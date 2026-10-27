from fastapi import APIRouter, Query
from typing import Optional
from app.services.data_processor import get_filtered_records
from app.services.metrics_service import (
    calculate_metrics_summary,
    compute_settlement_period_profile,
    compute_daily_leaderboard,
    compute_error_distribution
)
from app.models.schemas import AccuracyAnalyticsResponse
from app.config import DEFAULT_GATE_CLOSURE

router = APIRouter(prefix="/api/metrics", tags=["Quantitative Accuracy Analytics"])


@router.get("", response_model=AccuracyAnalyticsResponse)
def get_accuracy_analytics(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gate_closure: str = Query(DEFAULT_GATE_CLOSURE, description="Gate closure cutoff code")
):
    records = get_filtered_records(date_from=date_from, date_to=date_to, gate_closure=gate_closure)
    
    summary = calculate_metrics_summary(records, forecast_key="forecast_mw")
    sp_profile = compute_settlement_period_profile(records, forecast_key="forecast_mw")
    leaderboard = compute_daily_leaderboard(records, forecast_key="forecast_mw")
    dist = compute_error_distribution(records, forecast_key="forecast_mw", num_bins=12)

    return AccuracyAnalyticsResponse(
        summary=summary,
        settlement_period_profile=sp_profile,
        daily_leaderboard=leaderboard,
        error_distribution=dist
    )
