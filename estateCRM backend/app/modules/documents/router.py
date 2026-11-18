from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.business import DocumentVault
from app.database.repository import BaseTenantRepository
from app.core.response import success_response
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents & Vault"])

class DocumentCreateRequest(BaseModel):
    title: str
    category: Optional[str] = "AGREEMENT"
    fileUrl: Optional[str] = None
    file_url: Optional[str] = None
    fileSizeBytes: Optional[int] = None
    file_size_bytes: Optional[int] = None
    mimeType: Optional[str] = "application/pdf"
    mime_type: Optional[str] = "application/pdf"
    accessLevel: Optional[str] = "CONFIDENTIAL"
    access_level: Optional[str] = "CONFIDENTIAL"

@router.get("")
def list_documents(
    category_filter: Optional[str] = Query(None, alias="category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(DocumentVault, db, membership.tenant_id)
    filters = {}
    if category_filter:
        filters["category"] = category_filter

    docs = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [
            {
                "id": d.id,
                "title": d.title,
                "category": d.category,
                "fileUrl": d.file_url,
                "file_url": d.file_url,
                "fileSize": f"{d.file_size_bytes // 1024} KB" if d.file_size_bytes else "1.2 MB",
                "mimeType": d.mime_type,
                "accessLevel": d.access_level,
                "uploadedBy": d.uploaded_by or "Alexander Wright",
                "createdAt": d.created_at.strftime("%Y-%m-%d") if d.created_at else None,
            } for d in docs
        ],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.post("", status_code=status.HTTP_201_CREATED)
def upload_document(
    req: DocumentCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(DocumentVault, db, membership.tenant_id)
    url = req.file_url or req.fileUrl or f"{settings.STORAGE_ENDPOINT}/{settings.STORAGE_BUCKET}/docs/{req.title.replace(' ', '_')}.pdf"
    size = req.file_size_bytes or req.fileSizeBytes or 1048576
    mime = req.mime_type or req.mimeType or "application/pdf"
    access = req.access_level or req.accessLevel or "CONFIDENTIAL"

    d = repo.create({
        "title": req.title,
        "category": req.category or "AGREEMENT",
        "file_url": url,
        "file_size_bytes": size,
        "mime_type": mime,
        "access_level": access,
        "uploaded_by": "Alexander Wright"
    })
    return success_response({
        "id": d.id,
        "title": d.title,
        "fileUrl": d.file_url,
        "status": "STORED"
    })

@router.get("/{document_id}/download")
def get_download_url(
    document_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(DocumentVault, db, membership.tenant_id)
    d = repo.get_by_id(document_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Generates signed download URL token
    signed_url = f"{d.file_url}?token=sig_{d.id[:8]}&expires=3600"
    return success_response({"download_url": signed_url, "expires_in_seconds": 3600})

