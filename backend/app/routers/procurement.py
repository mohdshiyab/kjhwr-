from fastapi import APIRouter, Query, Body
from typing import Optional
from app.models.schemas import ThermalProcurementRequest, ThermalProcurementResponse
from app.services.procurement_service import simulate_thermal_procurement
from app.config import DEFAULT_GATE_CLOSURE

router = APIRouter(prefix="/api/procurement", tags=["Thermal Procurement Simulator"])


@router.post("/simulate", response_model=ThermalProcurementResponse)
def run_simulation(req: ThermalProcurementRequest):
    result = simulate_thermal_procurement(
        target_date=req.target_date or "2026-01-15",
        base_demand_mw=req.demand_level_mw,
        use_derating_buffer=req.use_derating_buffer,
        buffer_pct=req.buffer_pct,
        gate_closure=req.gate_closure or DEFAULT_GATE_CLOSURE
    )
    return result


@router.get("/simulate")
def run_simulation_get(
    target_date: str = Query("2026-01-15", description="Target date (YYYY-MM-DD)"),
    demand_level_mw: float = Query(30000.0, description="Base demand level in MW"),
    use_derating_buffer: bool = Query(True, description="Apply safety buffer to mitigate over-forecast bias"),
    buffer_pct: float = Query(15.0, description="Safety buffer percentage"),
    gate_closure: str = Query(DEFAULT_GATE_CLOSURE, description="Gate closure cutoff code")
):
    result = simulate_thermal_procurement(
        target_date=target_date,
        base_demand_mw=demand_level_mw,
        use_derating_buffer=use_derating_buffer,
        buffer_pct=buffer_pct,
        gate_closure=gate_closure
    )
    return result
