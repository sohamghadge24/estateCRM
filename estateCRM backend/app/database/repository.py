from typing import Generic, TypeVar, Type, Optional, List, Any, Dict
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from app.database.base import Base
from app.core.tenant import get_current_tenant_id

ModelType = TypeVar("ModelType", bound=Base)

class BaseTenantRepository(Generic[ModelType]):
    """
    Centralized, production-grade MySQL Tenant-Scoped Repository.
    Guarantees that every query strictly filters by the authenticated tenant_id,
    preventing any cross-tenant data leakage.
    """
    def __init__(self, model: Type[ModelType], db: Session, tenant_id: Optional[str] = None):
        self.model = model
        self.db = db
        # If tenant_id not explicitly passed, resolve from context
        self.tenant_id = tenant_id or get_current_tenant_id()
        if not self.tenant_id and hasattr(model, "tenant_id"):
            raise ValueError(f"Tenant isolation failure: Cannot query {model.__name__} without active tenant context.")

    def _base_query(self, include_archived: bool = False):
        query = self.db.query(self.model)
        if hasattr(self.model, "tenant_id"):
            query = query.filter(self.model.tenant_id == self.tenant_id)
        if hasattr(self.model, "is_archived") and not include_archived:
            query = query.filter(self.model.is_archived == False)
        return query

    def get_by_id(self, entity_id: str, include_archived: bool = False) -> Optional[ModelType]:
        """Fetch a single record by ID within current tenant scope."""
        return self._base_query(include_archived=include_archived).filter(self.model.id == entity_id).first()

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: Any = None,
        include_archived: bool = False,
        **filters
    ) -> List[ModelType]:
        """List records with pagination and filtering within current tenant scope."""
        query = self._base_query(include_archived=include_archived)
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)
        if order_by is not None:
            query = query.order_by(order_by)
        elif hasattr(self.model, "created_at"):
            query = query.order_by(self.model.created_at.desc())
        return query.offset(skip).limit(limit).all()

    def count(self, include_archived: bool = False, **filters) -> int:
        """Count records within current tenant scope."""
        query = self._base_query(include_archived=include_archived)
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)
        return query.count()

    def create(self, attributes: Dict[str, Any]) -> ModelType:
        """Create a new entity, automatically binding the tenant_id."""
        data = attributes.copy()
        if hasattr(self.model, "tenant_id"):
            data["tenant_id"] = self.tenant_id
        db_obj = self.model(**data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: ModelType, updates: Dict[str, Any]) -> ModelType:
        """Update existing entity within tenant scope."""
        for field, value in updates.items():
            if hasattr(db_obj, field) and field not in ("id", "tenant_id", "created_at"):
                setattr(db_obj, field, value)
        if hasattr(db_obj, "updated_at"):
            setattr(db_obj, "updated_at", datetime.now(timezone.utc))
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, entity_id: str, soft: bool = True) -> bool:
        """Delete or soft-delete entity within tenant scope."""
        db_obj = self.get_by_id(entity_id)
        if not db_obj:
            return False
        if soft and hasattr(db_obj, "is_archived"):
            db_obj.is_archived = True
            if hasattr(db_obj, "archived_at"):
                db_obj.archived_at = datetime.now(timezone.utc)
            self.db.commit()
        else:
            self.db.delete(db_obj)
            self.db.commit()
        return True

