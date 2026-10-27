import pytest
from app.routers.summary import get_executive_summary
from app.routers.forecasts import get_time_series
from app.routers.metrics import get_accuracy_analytics
from app.routers.procurement import run_simulation
from app.routers.sensitivity import compare_gate_closures
from app.models.schemas import ThermalProcurementRequest


def test_summary_router():
    data = get_executive_summary(date_from="2026-01-01", date_to="2026-01-31", gate_closure="da_1100")
    assert data.total_actual_gwh > 0
    assert data.metrics.sample_count == 744
    assert data.active_gate_closure == "da_1100"


def test_timeseries_router():
    points = get_time_series(date_from="2026-01-01", date_to="2026-01-02", gate_closure="da_1100")
    assert len(points) == 48
    assert points[0].actual_mw > 0
    assert points[0].forecast_mw is not None


def test_metrics_router():
    analytics = get_accuracy_analytics(date_from=None, date_to=None, gate_closure="da_1100")
    assert analytics.summary.mae_mw > 0
    assert len(analytics.settlement_period_profile) == 24
    assert len(analytics.daily_leaderboard) == 31
    assert len(analytics.error_distribution) > 0


def test_procurement_router():
    req = ThermalProcurementRequest(
        target_date="2026-01-15",
        demand_level_mw=32000.0,
        use_derating_buffer=True,
        buffer_pct=15.0,
        gate_closure="da_1100"
    )
    result = run_simulation(req)
    assert "summary" in result
    assert len(result["hourly_schedule"]) == 24
    assert result["summary"]["total_demand_mwh"] > 0


def test_sensitivity_router():
    comparison = compare_gate_closures(date_from=None, date_to=None)
    assert len(comparison) >= 5
    closures = [c.gate_closure_id for c in comparison]
    assert "da_1100" in closures
    assert "intraday" in closures
