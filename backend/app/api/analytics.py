from fastapi import APIRouter, Query
from typing import Optional
from app.services.data_loader import get_aggregated_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics & Accuracy"])


@router.get("/summary")
def get_analytics_summary(
    date_from: Optional[str] = Query("2026-01-01", description="Start decision date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query("2026-01-31", description="End decision date (YYYY-MM-DD)"),
    cutoff_time: str = Query("15:30", description="Decision cutoff time in GMT/UTC")
):
    """
    Returns aggregated accuracy metrics (MAE, RMSE, Mean Signed Error, WAPE)
    and diurnal error breakdown across the selected January 2026 decision range.
    """
    return get_aggregated_analytics(date_from=date_from, date_to=date_to, cutoff_time=cutoff_time)
