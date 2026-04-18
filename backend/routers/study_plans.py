import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.schemas import StudyPlanSummary, StudyPlanDetail, UserOut
from db.database import get_study_plans, get_study_plan
from routers.auth import get_current_user

log = logging.getLogger("curator.study_plans")
router = APIRouter()


@router.get("", response_model=List[StudyPlanSummary])
def list_study_plans(current_user: UserOut = Depends(get_current_user)):
    """GET /api/study-plans — list all plans for the authenticated user"""
    return get_study_plans(current_user.id)


@router.get("/{plan_id}", response_model=StudyPlanDetail)
def get_plan(plan_id: int, current_user: UserOut = Depends(get_current_user)):
    """GET /api/study-plans/{plan_id} — fetch a single plan"""
    result = get_study_plan(plan_id, current_user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Study plan not found")
    if result.get("_forbidden"):
        raise HTTPException(status_code=403, detail="Access denied")
    return result
