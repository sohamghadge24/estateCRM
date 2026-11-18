from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class LeadCreateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = "NEW"
    source: Optional[str] = "WEBSITE"
    budgetMin: Optional[Decimal] = None
    budgetMax: Optional[Decimal] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    propertyType: Optional[str] = None
    property_type: Optional[str] = None
    assignedAgent: Optional[str] = None
    assigned_agent_name: Optional[str] = None
    score: Optional[int] = 50
    notes: Optional[str] = None

class LeadUpdateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    budgetMin: Optional[Decimal] = None
    budgetMax: Optional[Decimal] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    propertyType: Optional[str] = None
    property_type: Optional[str] = None
    assignedAgent: Optional[str] = None
    assigned_agent_name: Optional[str] = None
    score: Optional[int] = None
    notes: Optional[str] = None

class LeadActivityCreateRequest(BaseModel):
    activity_type: Optional[str] = "NOTE"
    activityType: Optional[str] = None
    description: Optional[str] = None
    details: Optional[str] = None
    performed_by: Optional[str] = None
    performedBy: Optional[str] = None

