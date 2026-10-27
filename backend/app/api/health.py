from fastapi import APIRouter
from app.services.data_loader import get_data_quality_report

router = APIRouter(tags=["Health & Quality"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "product": "WindLens",
        "description": "Day-Ahead Wind Forecast Intelligence Platform",
        "decision_horizon": "January 2026 Purchasing Decisions (Delivery: Jan 2 - Feb 1, 2026)",
        "source": "Elexon BMRS (FUELHH & WINDFOR)"
    }


@router.get("/data-quality")
def data_quality_audit():
    """
    Returns audit statistics regarding ingested intervals, missing observations,
    duplicate checks, and data refresh status.
    """
    return get_data_quality_report()
