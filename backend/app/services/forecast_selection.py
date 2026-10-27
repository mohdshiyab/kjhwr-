"""
WindLens - Forecast Selection & Decision Snapshot Engine
Implements the core decision-cutoff selection rule independently of HTTP framework:
Selected forecast(t, D) = argmax_f (f.publishTime)
s.t. f.startTime = t, f.publishTime <= D
where t is the delivery interval and D is the decision cutoff on the decision date.
"""

import datetime
from typing import List, Dict, Any, Optional, Tuple


def calculate_delivery_date(decision_date_str: str) -> str:
    """
    Day-ahead market logic: purchasing decision on date D delivers on date D+1.
    e.g. Decision on '2026-01-14' delivers on '2026-01-15'.
    """
    dt = datetime.date.fromisoformat(decision_date_str)
    delivery_dt = dt + datetime.timedelta(days=1)
    return delivery_dt.isoformat()


def build_cutoff_timestamp(decision_date_str: str, cutoff_time_str: str = "15:30") -> str:
    """
    Constructs the ISO UTC cutoff timestamp for a decision date.
    e.g. '2026-01-14' and '15:30' -> '2026-01-14T15:30:00Z'.
    """
    clean_time = cutoff_time_str.strip()
    if len(clean_time) == 5:
        clean_time += ":00"
    return f"{decision_date_str}T{clean_time}Z"


def select_eligible_forecast(
    candidates: List[Dict[str, Any]],
    cutoff_timestamp: str
) -> Optional[Dict[str, Any]]:
    """
    Core Selection Rule:
    Filters candidate forecasts whose publishTime <= cutoff_timestamp,
    and returns the eligible record with the latest (maximum) publishTime.
    
    If no forecast was published prior to cutoff, returns None (does not invent values).
    """
    eligible = [f for f in candidates if f["publish_time"] <= cutoff_timestamp]
    if not eligible:
        return None
    # Latest publish time among eligible
    return max(eligible, key=lambda x: x["publish_time"])


def build_decision_replay(
    decision_date: str,
    cutoff_time: str,
    actual_rows: List[Dict[str, Any]],
    forecast_rows: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Reconstructs the exact information state available to the purchasing desk
    at the decision cutoff on the decision date for delivery on the following day.
    
    Matching is strictly on delivery startTime (e.g. '2026-01-15T00:00:00Z').
    """
    delivery_date = calculate_delivery_date(decision_date)
    cutoff_timestamp = build_cutoff_timestamp(decision_date, cutoff_time)

    # Filter actuals for this delivery date (48 half-hourly settlement periods)
    day_actuals = [a for a in actual_rows if a.get("settlement_date") == delivery_date]
    day_actuals.sort(key=lambda x: x["start_time"])

    # Index forecasts by target startTime -> list of candidate forecasts
    forecasts_by_start: Dict[str, List[Dict[str, Any]]] = {}
    for f in forecast_rows:
        st = f["start_time"]
        if st.startswith(delivery_date):
            if st not in forecasts_by_start:
                forecasts_by_start[st] = []
            forecasts_by_start[st].append(f)

    # Map hourly forecast start times to half-hourly settlement periods
    # e.g. hour '2026-01-15T00:00:00Z' covers SP 1 (00:00) and SP 2 (00:30)
    intervals = []
    matched_count = 0
    errors = []
    abs_errors = []
    total_act_mw = 0.0
    total_fc_mw = 0.0

    # Ensure 48 settlement periods are represented
    for sp in range(1, 49):
        # Determine interval start time in UTC
        h = (sp - 1) // 2
        m = 30 if (sp % 2 == 0) else 0
        interval_start_time = f"{delivery_date}T{h:02d}:{m:02d}:00Z"
        hour_start_time = f"{delivery_date}T{h:02d}:00:00Z"

        # Find actual generation for this SP
        act_match = next((a for a in day_actuals if a["settlement_period"] == sp), None)
        act_mw = float(act_match["generation"]) if act_match is not None else None

        # Find forecast: check candidates for the hour
        candidates = forecasts_by_start.get(hour_start_time, [])
        selected_fc = select_eligible_forecast(candidates, cutoff_timestamp)

        fc_mw = float(selected_fc["generation"]) if selected_fc is not None else None
        pub_time = selected_fc["publish_time"] if selected_fc is not None else None

        # Compute error if both actual and forecast exist: error = forecast - actual
        if fc_mw is not None and act_mw is not None:
            err = round(fc_mw - act_mw, 2)
            abs_err = round(abs(err), 2)
            errors.append(err)
            abs_errors.append(abs_err)
            total_act_mw += act_mw
            total_fc_mw += fc_mw
            matched_count += 1
            is_matched = True
        else:
            err = None
            abs_err = None
            is_matched = False

        intervals.append({
            "interval_index": sp,
            "settlement_period": sp,
            "start_time": interval_start_time,
            "hour": h,
            "minute": m,
            "actual_mw": act_mw,
            "forecast_mw": fc_mw,
            "error_mw": err,
            "abs_error_mw": abs_err,
            "forecast_publish_time": pub_time,
            "is_matched": is_matched,
            "is_eligible": selected_fc is not None
        })

    # Summary metrics across the delivery day
    total_intervals = 48
    coverage_pct = round((matched_count / total_intervals) * 100.0, 1)

    if matched_count > 0:
        mae_mw = round(sum(abs_errors) / matched_count, 2)
        rmse_mw = round((sum(e ** 2 for e in errors) / matched_count) ** 0.5, 2)
        mean_signed_error = round(sum(errors) / matched_count, 2)
        avg_act = round(total_act_mw / matched_count, 2)
        avg_fc = round(total_fc_mw / matched_count, 2)
        # Half-hour energy in MWh = MW * 0.5 hours
        total_act_mwh = round(total_act_mw * 0.5, 1)
        total_fc_mwh = round(total_fc_mw * 0.5, 1)
    else:
        mae_mw = 0.0
        rmse_mw = 0.0
        mean_signed_error = 0.0
        avg_act = 0.0
        avg_fc = 0.0
        total_act_mwh = 0.0
        total_fc_mwh = 0.0

    # Build Revisions Timeline: what publications were issued for this delivery day?
    # Get all distinct publish times that forecasted any hour of this delivery day
    all_day_forecasts = [f for f in forecast_rows if f["start_time"].startswith(delivery_date)]
    all_publish_times = sorted(list(set(f["publish_time"] for f in all_day_forecasts)))

    revisions_timeline = []
    for pt in all_publish_times:
        is_eligible = pt <= cutoff_timestamp
        v_forecasts = [f for f in all_day_forecasts if f["publish_time"] == pt]
        avg_gen = round(sum(f["generation"] for f in v_forecasts) / len(v_forecasts), 1) if v_forecasts else 0.0

        if is_eligible:
            if pt == max([p for p in all_publish_times if p <= cutoff_timestamp], default=None):
                status = "SELECTED"
                reason = "Latest eligible forecast published prior to decision cutoff. Used for day-ahead purchasing."
            else:
                status = "SUPERSEDED"
                reason = "Published prior to cutoff, but superseded by a later pre-cutoff forecast update."
        else:
            status = "EXCLUDED"
            reason = "Published AFTER decision cutoff. Cannot leak into historical day-ahead purchasing decision."

        revisions_timeline.append({
            "publish_time": pt,
            "status": status,
            "is_eligible": is_eligible,
            "reason": reason,
            "avg_forecast_mw": avg_gen,
            "horizon_count": len(v_forecasts)
        })

    return {
        "decision_date": decision_date,
        "delivery_date": delivery_date,
        "cutoff_time": cutoff_time,
        "cutoff_timestamp": cutoff_timestamp,
        "summary": {
            "decision_date": decision_date,
            "delivery_date": delivery_date,
            "cutoff_timestamp": cutoff_timestamp,
            "matched_intervals": matched_count,
            "total_intervals": total_intervals,
            "coverage_pct": coverage_pct,
            "mae_mw": mae_mw,
            "rmse_mw": rmse_mw,
            "mean_signed_error_mw": mean_signed_error,
            "avg_actual_mw": avg_act,
            "avg_forecast_mw": avg_fc,
            "total_actual_mwh": total_act_mwh,
            "total_forecast_mwh": total_fc_mwh,
            "active_vintage_publish_time": revisions_timeline[-1]["publish_time"] if revisions_timeline else None
        },
        "intervals": intervals,
        "revisions": revisions_timeline
    }
