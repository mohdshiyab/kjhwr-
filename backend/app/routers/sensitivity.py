from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.data_processor import get_filtered_records
from app.services.metrics_service import calculate_metrics_summary
from app.models.schemas import GateClosureComparisonItem

router = APIRouter(prefix="/api/sensitivity", tags=["Gate Closure Sensitivity Analysis"])

CLOSURES = [
    {"id": "da_0700", "label": "07:00 AM D-1 (Morning Strategy)", "cutoff": "07:00 GMT D-1"},
    {"id": "da_1100", "label": "11:00 AM D-1 (EPEX Day-Ahead Auction)", "cutoff": "11:00 GMT D-1"},
    {"id": "da_1200", "label": "12:00 PM D-1 (Nord Pool N2EX Auction)", "cutoff": "12:00 GMT D-1"},
    {"id": "da_1400", "label": "14:00 PM D-1 (Post-Auction Adjustment)", "cutoff": "14:00 GMT D-1"},
    {"id": "da_1700", "label": "17:00 PM D-1 (End of Day-Ahead Book)", "cutoff": "17:00 GMT D-1"},
    {"id": "intraday", "label": "Intraday (Latest Pre-Delivery)", "cutoff": "Delivery T-1h"}
]


@router.get("/compare", response_model=List[GateClosureComparisonItem])
def compare_gate_closures(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    results = []

    for c in CLOSURES:
        records = get_filtered_records(date_from=date_from, date_to=date_to, gate_closure=c["id"])
        summary = calculate_metrics_summary(records, forecast_key="forecast_mw")
        results.append(GateClosureComparisonItem(
            gate_closure_id=c["id"],
            gate_closure_label=c["label"],
            cutoff_time=c["cutoff"],
            mae_mw=summary.mae_mw,
            rmse_mw=summary.rmse_mw,
            wape_pct=summary.wape_pct,
            bias_mw=summary.bias_mw,
            p90_error_mw=summary.p90_error_mw
        ))

    return results
