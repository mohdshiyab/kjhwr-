import pytest
from app.services.forecast_selection import (
    calculate_delivery_date,
    build_cutoff_timestamp,
    select_eligible_forecast,
    build_decision_replay
)


def test_delivery_date_calculation():
    # Purchasing on Jan 14 delivers Jan 15
    assert calculate_delivery_date("2026-01-14") == "2026-01-15"
    assert calculate_delivery_date("2026-01-31") == "2026-02-01"


def test_cutoff_timestamp():
    ts = build_cutoff_timestamp("2026-01-14", "15:30")
    assert ts == "2026-01-14T15:30:00Z"


def test_select_latest_eligible_forecast():
    """
    Test: Select the latest forecast published at or before the cutoff.
    """
    cutoff = "2026-01-14T15:30:00Z"
    candidates = [
        {"publish_time": "2026-01-14T07:30:00Z", "generation": 1000.0},
        {"publish_time": "2026-01-14T11:30:00Z", "generation": 1200.0},
        {"publish_time": "2026-01-14T15:00:00Z", "generation": 1300.0},
    ]
    selected = select_eligible_forecast(candidates, cutoff)
    assert selected is not None
    assert selected["publish_time"] == "2026-01-14T15:00:00Z"
    assert selected["generation"] == 1300.0


def test_strictly_exclude_forecast_after_cutoff():
    """
    Test: A forecast published after the cutoff must NOT be selected,
    even if it is closer to the delivery time or more accurate.
    """
    cutoff = "2026-01-14T15:30:00Z"
    candidates = [
        {"publish_time": "2026-01-14T11:30:00Z", "generation": 1200.0},
        {"publish_time": "2026-01-14T15:30:00Z", "generation": 1250.0},
        # Published AFTER cutoff:
        {"publish_time": "2026-01-14T18:30:00Z", "generation": 1500.0},
        {"publish_time": "2026-01-15T02:00:00Z", "generation": 1600.0},
    ]
    selected = select_eligible_forecast(candidates, cutoff)
    assert selected is not None
    assert selected["publish_time"] == "2026-01-14T15:30:00Z"
    assert selected["generation"] == 1250.0


def test_missing_forecast_marks_interval_unavailable():
    """
    Test: If no eligible forecast exists before cutoff, mark None, do not invent data.
    """
    cutoff = "2026-01-14T15:30:00Z"
    # Only post-cutoff forecasts exist:
    candidates = [
        {"publish_time": "2026-01-14T18:00:00Z", "generation": 2000.0}
    ]
    selected = select_eligible_forecast(candidates, cutoff)
    assert selected is None


def test_decision_replay_with_known_values():
    """
    Test full decision replay with synthetic actuals and forecasts.
    """
    actuals = [
        {"settlement_date": "2026-01-15", "settlement_period": 1, "start_time": "2026-01-15T00:00:00Z", "generation": 1000.0},
        {"settlement_date": "2026-01-15", "settlement_period": 2, "start_time": "2026-01-15T00:30:00Z", "generation": 1100.0},
    ]
    forecasts = [
        {"start_time": "2026-01-15T00:00:00Z", "publish_time": "2026-01-14T11:00:00Z", "generation": 1200.0},
        {"start_time": "2026-01-15T00:00:00Z", "publish_time": "2026-01-14T14:00:00Z", "generation": 1300.0},
        # Post cutoff:
        {"start_time": "2026-01-15T00:00:00Z", "publish_time": "2026-01-14T17:00:00Z", "generation": 1050.0},
    ]

    replay = build_decision_replay("2026-01-14", "15:30", actuals, forecasts)
    summary = replay["summary"]
    assert replay["delivery_date"] == "2026-01-15"
    assert summary["matched_intervals"] == 2
    # SP 1: Forecast 1300 - Actual 1000 = +300
    # SP 2: Forecast 1300 - Actual 1100 = +200
    # MAE = (300 + 200) / 2 = 250
    # Mean signed error (Bias) = (300 + 200) / 2 = +250
    assert summary["mae_mw"] == 250.0
    assert summary["mean_signed_error_mw"] == 250.0

    # Verify post-cutoff 17:00 is marked EXCLUDED in revisions
    rev_17 = next(r for r in replay["revisions"] if r["publish_time"] == "2026-01-14T17:00:00Z")
    assert rev_17["status"] == "EXCLUDED"
    assert rev_17["is_eligible"] is False
