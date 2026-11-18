import uuid
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class ResponseMeta(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: Optional[int] = None
    page_size: Optional[int] = None
    total: Optional[int] = None

class StandardResponse(BaseModel, Generic[T]):
    data: T
    meta: ResponseMeta = Field(default_factory=ResponseMeta)

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str

class ErrorContent(BaseModel):
    code: str
    message: str
    details: List[ErrorDetail] = Field(default_factory=list)

class ErrorResponse(BaseModel):
    error: ErrorContent
    meta: ResponseMeta = Field(default_factory=ResponseMeta)

def success_response(data: Any, meta: Optional[ResponseMeta] = None, **meta_kwargs) -> dict:
    meta_dict = {"request_id": str(uuid.uuid4())}
    if meta:
        meta_dict.update(meta.model_dump(exclude_none=True))
    meta_dict.update({k: v for k, v in meta_kwargs.items() if v is not None})
    return {
        "data": data,
        "meta": meta_dict
    }

def error_response(code: str, message: str, details: Optional[List[dict]] = None) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or []
        },
        "meta": {
            "request_id": str(uuid.uuid4())
        }
    }

