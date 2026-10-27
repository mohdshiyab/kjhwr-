from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response
from app.services.data_loader import (
    get_decision_details,
    generate_decision_csv,
    get_available_decision_dates
)

router = APIRouter(prefix="/decisions", tags=["Decisions & Replay"])


@router.get("/{decision_date}")
def get_decision_replay(
    decision_date: str,
    cutoff_time: str = Query("15:30", description="Decision cutoff time in GMT/UTC (e.g. 15:30 for EPEX 30-min auction)")
):
    """
    Reconstructs the historical decision snapshot available to the purchasing desk
    at the decision cutoff on the specified decision date.
    """
    valid_dates = [d["decision_date"] for d in get_available_decision_dates()]
    if decision_date not in valid_dates:
        raise HTTPException(
            status_code=404,
            detail=f"Decision date '{decision_date}' not found. Supported January 2026 decision dates: 2026-01-01 to 2026-01-31."
        )

    return get_decision_details(decision_date, cutoff_time)


@router.get("/{decision_date}/revisions")
def get_decision_revisions(
    decision_date: str,
    cutoff_time: str = Query("15:30", description="Decision cutoff time in GMT/UTC")
):
    """
    Returns the publication history for this delivery day, explaining which forecasts
    were eligible prior to cutoff, which was selected, and which were excluded.
    """
    replay = get_decision_details(decision_date, cutoff_time)
    return {
        "decision_date": replay["decision_date"],
        "delivery_date": replay["delivery_date"],
        "cutoff_timestamp": replay["cutoff_timestamp"],
        "revisions": replay["revisions"]
    }


@router.get("/{decision_date}/export")
def export_decision_csv(
    decision_date: str,
    cutoff_time: str = Query("15:30", description="Decision cutoff time in GMT/UTC")
):
    """
    Downloads an auditable CSV snapshot of interval-level forecast vs actual values.
    """
    csv_content = generate_decision_csv(decision_date, cutoff_time)
    filename = f"windlens_decision_{decision_date}_cutoff_{cutoff_time.replace(':', '')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
