from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.engagement import Task
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(prefix="/tasks", tags=["Tasks & Activities"])

class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    dueDate: Optional[str] = None
    due_date: Optional[datetime] = None
    due: Optional[str] = None
    assignedTo: Optional[str] = None
    assigned_to: Optional[str] = None
    relatedTo: Optional[str] = None
    related_to: Optional[str] = None

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    dueDate: Optional[str] = None

def task_to_dict(t: Task) -> dict:
    due_str = t.due_date.strftime("%Y-%m-%d") if t.due_date else "Soon"
    return {
        "id": t.id,
        "tenant_id": t.tenant_id,
        "title": t.title,
        "description": t.description,
        "priority": t.priority,
        "status": t.status,
        "completed": t.status == "COMPLETED",
        "dueDate": due_str,
        "due": due_str,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "assignedTo": t.assigned_to or "Alexander Wright",
        "assigned_to": t.assigned_to or "Alexander Wright",
        "relatedTo": t.related_to or "Mandate Action",
        "related_to": t.related_to or "Mandate Action",
        "createdAt": t.created_at.isoformat() if t.created_at else None,
    }

@router.get("")
def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Task, db, membership.tenant_id)
    filters = {}
    if status_filter:
        filters["status"] = status_filter
    if priority_filter:
        filters["priority"] = priority_filter

    tasks = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [task_to_dict(t) for t in tasks],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/my-tasks")
def list_my_tasks(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Task, db, membership.tenant_id)
    tasks = repo.list(limit=50)
    return success_response([task_to_dict(t) for t in tasks])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(
    req: TaskCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Task, db, membership.tenant_id)
    agent = req.assigned_to or req.assignedTo or "Alexander Wright"
    related = req.related_to or req.relatedTo or "Mandate Action"

    t = repo.create({
        "title": req.title,
        "description": req.description,
        "priority": req.priority or "MEDIUM",
        "status": "TODO",
        "due_date": req.due_date or datetime.now(timezone.utc),
        "assigned_to": agent,
        "related_to": related
    })
    return success_response(task_to_dict(t))

@router.patch("/{task_id}")
@router.put("/{task_id}")
def update_task(
    task_id: str,
    req: TaskUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Task, db, membership.tenant_id)
    t = repo.get_by_id(task_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    updates = {}
    if req.title: updates["title"] = req.title
    if req.priority: updates["priority"] = req.priority
    if req.status:
        updates["status"] = req.status
        if req.status == "COMPLETED":
            updates["completed_at"] = datetime.now(timezone.utc)
    if req.completed is not None:
        updates["status"] = "COMPLETED" if req.completed else "TODO"
        if req.completed:
            updates["completed_at"] = datetime.now(timezone.utc)

    updated = repo.update(t, updates)
    return success_response(task_to_dict(updated))

@router.patch("/{task_id}/toggle")
def toggle_task(
    task_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Task, db, membership.tenant_id)
    t = repo.get_by_id(task_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    new_status = "TODO" if t.status == "COMPLETED" else "COMPLETED"
    updated = repo.update(t, {
        "status": new_status,
        "completed_at": datetime.now(timezone.utc) if new_status == "COMPLETED" else None
    })
    return success_response(task_to_dict(updated))

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Task, db, membership.tenant_id)
    success = repo.delete(task_id, soft=True)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return success_response({"message": "Task completed/archived successfully."})

