from fastapi import APIRouter
from app.services.data_loader import get_available_decision_dates

router = APIRouter(tags=["Decision Dates"])


@router.get("/decision-dates")
def list_decision_dates():
    """
    Returns available January 2026 decision dates (2026-01-01 to 2026-01-31)
    and their corresponding delivery dates (2026-01-02 to 2026-02-01).
    """
    dates = get_available_decision_dates()
    return {
        "count": len(dates),
        "decision_dates": dates
    }
