from fastapi import APIRouter, Query
from typing import List, Optional, Dict, Any
from app.services.data_processor import get_filtered_records, load_half_hourly_records
from app.models.schemas import TimeSeriesPoint
from app.config import DEFAULT_GATE_CLOSURE

router = APIRouter(prefix="/api/forecasts", tags=["Forecasts & Actuals"])


@router.get("/timeseries", response_model=List[TimeSeriesPoint])
def get_time_series(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    gate_closure: str = Query(DEFAULT_GATE_CLOSURE, description="Gate closure cutoff code")
):
    records = get_filtered_records(date_from=date_from, date_to=date_to, gate_closure=gate_closure)
    points = []
    for r in records:
        points.append(TimeSeriesPoint(
            start_time=r["start_time"],
            settlement_date=r["settlement_date"],
            hour=r["hour"],
            settlement_periods=r.get("settlement_periods", []),
            actual_mw=r["actual_mw"],
            forecast_mw=r.get("forecast_mw"),
            error_mw=r.get("error_mw"),
            abs_error_mw=r.get("abs_error_mw"),
            pct_error=r.get("pct_error"),
            publish_time=r.get("publish_time")
        ))
    return points


@router.get("/half-hourly")
def get_half_hourly_detail(
    date: str = Query("2026-01-15", description="Specific settlement date (YYYY-MM-DD)")
):
    all_hh = load_half_hourly_records()
    matched = [x for x in all_hh if x["settlement_date"] == date]
    return {
        "date": date,
        "count": len(matched),
        "settlement_periods": matched
    }
