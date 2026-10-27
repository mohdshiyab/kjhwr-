import math
import numpy as np
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    MetricSummary,
    SettlementPeriodBreakdown,
    DailyAccuracyRecord,
    ErrorDistributionBin,
    AccuracyAnalyticsResponse
)


def calculate_metrics_summary(records: List[Dict[str, Any]], forecast_key="forecast_mw") -> MetricSummary:
    valid = []
    for r in records:
        f_val = r.get(forecast_key)
        a_val = r.get("actual_mw")
        if f_val is not None and a_val is not None:
            valid.append((float(f_val), float(a_val)))

    if not valid:
        return MetricSummary(
            mae_mw=0.0,
            rmse_mw=0.0,
            wape_pct=0.0,
            mape_pct=0.0,
            bias_mw=0.0,
            correlation=0.0,
            p10_error_mw=0.0,
            p50_error_mw=0.0,
            p90_error_mw=0.0,
            sample_count=0
        )

    f_arr = np.array([v[0] for v in valid])
    a_arr = np.array([v[1] for v in valid])

    errors = f_arr - a_arr
    abs_errors = np.abs(errors)

    mae = float(np.mean(abs_errors))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    bias = float(np.mean(errors))

    sum_actual = float(np.sum(a_arr))
    wape = float((np.sum(abs_errors) / sum_actual * 100.0)) if sum_actual > 0 else 0.0

    # MAPE (safeguarded against near-zero actuals)
    non_zero = a_arr > 10.0
    if np.any(non_zero):
        mape = float(np.mean(abs_errors[non_zero] / a_arr[non_zero] * 100.0))
    else:
        mape = 0.0

    # Correlation
    if len(f_arr) > 1 and np.std(f_arr) > 0 and np.std(a_arr) > 0:
        corr_matrix = np.corrcoef(f_arr, a_arr)
        corr = float(corr_matrix[0, 1])
    else:
        corr = 1.0

    p10 = float(np.percentile(errors, 10))
    p50 = float(np.percentile(errors, 50))
    p90 = float(np.percentile(errors, 90))

    return MetricSummary(
        mae_mw=round(mae, 2),
        rmse_mw=round(rmse, 2),
        wape_pct=round(wape, 2),
        mape_pct=round(mape, 2),
        bias_mw=round(bias, 2),
        correlation=round(corr, 4),
        p10_error_mw=round(p10, 2),
        p50_error_mw=round(p50, 2),
        p90_error_mw=round(p90, 2),
        sample_count=len(valid)
    )


def compute_settlement_period_profile(records: List[Dict[str, Any]], forecast_key="forecast_mw") -> List[SettlementPeriodBreakdown]:
    """
    Computes average performance for each settlement period (or hour of day).
    """
    by_hour: Dict[int, List[Tuple[float, float]]] = {h: [] for h in range(24)}

    for r in records:
        h = r.get("hour")
        f_val = r.get(forecast_key)
        a_val = r.get("actual_mw")
        if h is not None and f_val is not None and a_val is not None:
            by_hour[h].append((float(f_val), float(a_val)))

    profile = []
    for h in range(24):
        vals = by_hour[h]
        if not vals:
            continue
        f_arr = np.array([v[0] for v in vals])
        a_arr = np.array([v[1] for v in vals])
        errors = f_arr - a_arr
        abs_errors = np.abs(errors)

        # In UK market, hour h corresponds to settlement periods 2h+1 and 2h+2
        sp_num = 2 * h + 1
        profile.append(SettlementPeriodBreakdown(
            settlement_period=sp_num,
            hour_of_day=float(h),
            avg_actual_mw=round(float(np.mean(a_arr)), 2),
            avg_forecast_mw=round(float(np.mean(f_arr)), 2),
            mae_mw=round(float(np.mean(abs_errors)), 2),
            bias_mw=round(float(np.mean(errors)), 2),
            rmse_mw=round(float(np.sqrt(np.mean(errors ** 2))), 2),
            sample_count=len(vals)
        ))

    return profile


def compute_daily_leaderboard(records: List[Dict[str, Any]], forecast_key="forecast_mw") -> List[DailyAccuracyRecord]:
    """
    Computes daily forecast accuracy metrics for each day in January 2026.
    """
    by_date: Dict[str, List[Tuple[float, float]]] = {}
    for r in records:
        d = r.get("settlement_date")
        f_val = r.get(forecast_key)
        a_val = r.get("actual_mw")
        if d and f_val is not None and a_val is not None:
            if d not in by_date:
                by_date[d] = []
            by_date[d].append((float(f_val), float(a_val)))

    leaderboard = []
    for d in sorted(by_date.keys()):
        vals = by_date[d]
        f_arr = np.array([v[0] for v in vals])
        a_arr = np.array([v[1] for v in vals])
        errors = f_arr - a_arr
        abs_errors = np.abs(errors)

        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        bias = float(np.mean(errors))
        sum_act = float(np.sum(a_arr))
        wape = float((np.sum(abs_errors) / sum_act * 100.0)) if sum_act > 0 else 0.0

        leaderboard.append(DailyAccuracyRecord(
            date=d,
            avg_actual_mw=round(float(np.mean(a_arr)), 2),
            avg_forecast_mw=round(float(np.mean(f_arr)), 2),
            mae_mw=round(mae, 2),
            rmse_mw=round(rmse, 2),
            wape_pct=round(wape, 2),
            bias_mw=round(bias, 2),
            max_under_forecast_mw=round(float(np.min(errors)), 2),
            max_over_forecast_mw=round(float(np.max(errors)), 2)
        ))

    return leaderboard


def compute_error_distribution(records: List[Dict[str, Any]], forecast_key="forecast_mw", num_bins=12) -> List[ErrorDistributionBin]:
    """
    Computes frequency distribution histogram of forecast errors.
    """
    errors = []
    for r in records:
        f_val = r.get(forecast_key)
        a_val = r.get("actual_mw")
        if f_val is not None and a_val is not None:
            errors.append(float(f_val) - float(a_val))

    if not errors:
        return []

    err_arr = np.array(errors)
    min_err = float(np.min(err_arr))
    max_err = float(np.max(err_arr))

    # Create symmetrical or nice bin edges around 0
    bin_range = max(abs(min_err), abs(max_err))
    edges = np.linspace(-bin_range, bin_range, num_bins + 1)

    hist, _ = np.histogram(err_arr, bins=edges)
    total = len(errors)

    bins = []
    for i in range(len(hist)):
        start = round(float(edges[i]), 1)
        end = round(float(edges[i + 1]), 1)
        label = f"{start:+.0f} to {end:+.0f} MW"
        count = int(hist[i])
        pct = round((count / total) * 100.0, 2)
        bins.append(ErrorDistributionBin(
            bin_start=start,
            bin_end=end,
            bin_label=label,
            frequency=count,
            percentage=pct
        ))

    return bins
