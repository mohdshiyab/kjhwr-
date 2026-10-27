from fastapi import APIRouter, Query
from typing import Optional
from app.services.data_processor import get_filtered_records, get_available_dates
from app.services.metrics_service import calculate_metrics_summary
from app.models.schemas import ExecutiveKPIs
from app.config import DEFAULT_GATE_CLOSURE

router = APIRouter(prefix="/api/summary", tags=["Executive Summary"])


@router.get("", response_model=ExecutiveKPIs)
def get_executive_summary(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gate_closure: str = Query(DEFAULT_GATE_CLOSURE, description="Gate closure cutoff code")
):
    records = get_filtered_records(date_from=date_from, date_to=date_to, gate_closure=gate_closure)
    metrics = calculate_metrics_summary(records, forecast_key="forecast_mw")

    actuals = [r["actual_mw"] for r in records if r.get("actual_mw") is not None]
    forecasts = [r["forecast_mw"] for r in records if r.get("forecast_mw") is not None]

    total_actual_gwh = round(sum(actuals) / 1000.0, 2) if actuals else 0.0
    total_forecast_gwh = round(sum(forecasts) / 1000.0, 2) if forecasts else 0.0
    avg_act = round(sum(actuals) / len(actuals), 1) if actuals else 0.0
    max_act = round(max(actuals), 1) if actuals else 0.0
    min_act = round(min(actuals), 1) if actuals else 0.0

    date_range_str = f"{date_from or '2026-01-01'} to {date_to or '2026-01-31'}"

    return ExecutiveKPIs(
        date_range=date_range_str,
        total_actual_gwh=total_actual_gwh,
        total_forecast_gwh=total_forecast_gwh,
        avg_actual_mw=avg_act,
        max_actual_mw=max_act,
        min_actual_mw=min_act,
        forecast_accuracy_wape=metrics.wape_pct,
        systematic_bias_mw=metrics.bias_mw,
        active_gate_closure=gate_closure,
        metrics=metrics
    )


@router.get("/dates")
def get_dates():
    return {"available_dates": get_available_dates()}
