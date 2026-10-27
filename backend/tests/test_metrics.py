import pytest
import numpy as np
from app.services.metrics_service import (
    calculate_metrics_summary,
    compute_settlement_period_profile,
    compute_daily_leaderboard,
    compute_error_distribution
)


def test_calculate_metrics_summary_perfect_forecast():
    records = [
        {"forecast_mw": 1000.0, "actual_mw": 1000.0},
        {"forecast_mw": 2000.0, "actual_mw": 2000.0},
        {"forecast_mw": 3000.0, "actual_mw": 3000.0},
    ]
    summary = calculate_metrics_summary(records)
    assert summary.mae_mw == 0.0
    assert summary.rmse_mw == 0.0
    assert summary.bias_mw == 0.0
    assert summary.wape_pct == 0.0
    assert summary.sample_count == 3


def test_calculate_metrics_summary_known_error():
    # Actuals: 1000, 2000, 3000 (Sum = 6000)
    # Forecasts: 1200, 1900, 3500
    # Errors: +200, -100, +500 (Sum = +600 -> Bias = +200)
    # Abs Errors: 200, 100, 500 (Sum = 800 -> MAE = 266.67)
    # Squared Errors: 40000, 10000, 250000 (Mean = 100000 -> RMSE = 316.23)
    # WAPE = 800 / 6000 * 100 = 13.33%
    records = [
        {"forecast_mw": 1200.0, "actual_mw": 1000.0},
        {"forecast_mw": 1900.0, "actual_mw": 2000.0},
        {"forecast_mw": 3500.0, "actual_mw": 3000.0},
    ]
    summary = calculate_metrics_summary(records)
    assert summary.bias_mw == 200.0
    assert summary.mae_mw == 266.67
    assert summary.rmse_mw == 316.23
    assert summary.wape_pct == 13.33
    assert summary.sample_count == 3


def test_empty_records():
    summary = calculate_metrics_summary([])
    assert summary.sample_count == 0
    assert summary.mae_mw == 0.0
    assert summary.rmse_mw == 0.0


def test_error_distribution_bins():
    records = [
        {"forecast_mw": 1000.0, "actual_mw": 900.0},
        {"forecast_mw": 1000.0, "actual_mw": 1100.0},
        {"forecast_mw": 2000.0, "actual_mw": 2000.0},
    ]
    bins = compute_error_distribution(records, num_bins=4)
    assert len(bins) == 4
    total_pct = sum(b.percentage for b in bins)
    assert 99.0 <= total_pct <= 101.0
