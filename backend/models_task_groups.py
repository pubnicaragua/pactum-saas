from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    project_id: str
    total_estimated_hours: float
    task_ids: List[str] = []
    color: Optional[str] = "#3b82f6"  # Default blue color

class TaskGroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    total_estimated_hours: Optional[float] = None
    task_ids: Optional[List[str]] = None
    color: Optional[str] = None
