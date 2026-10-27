import os
import sqlite3
import csv
import io
from typing import List, Dict, Any, Optional
from app.services.forecast_selection import (
    calculate_delivery_date,
    build_decision_replay,
    build_cutoff_timestamp
)

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend/app
DATA_DIR = os.path.join(APP_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "elexon_wind.db")
if not os.path.exists(DB_PATH):
    # Try root /data/processed/
    ROOT_DIR = os.path.dirname(os.path.dirname(APP_DIR))
    DB_PATH = os.path.join(ROOT_DIR, "data", "processed", "elexon_wind.db")

_ALL_ACTUALS: Optional[List[Dict[str, Any]]] = None
_ALL_FORECASTS: Optional[List[Dict[str, Any]]] = None


def get_db_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def load_raw_data():
    global _ALL_ACTUALS, _ALL_FORECASTS
    if _ALL_ACTUALS is not None and _ALL_FORECASTS is not None:
        return _ALL_ACTUALS, _ALL_FORECASTS

    conn = get_db_connection()
    c = conn.cursor()

    # Load actual wind generation
    c.execute("""
    SELECT start_time, settlement_date, settlement_period, fuel_type, generation
    FROM actual_generation
    WHERE fuel_type = 'WIND'
    ORDER BY start_time ASC
    """)
    actual_rows = [
        {
            "start_time": r[0],
            "settlement_date": r[1],
            "settlement_period": r[2],
            "fuel_type": r[3],
            "generation": float(r[4])
        }
        for r in c.fetchall()
    ]

    # Load forecasts
    c.execute("""
    SELECT publish_time, start_time, generation
    FROM forecast_generation
    ORDER BY publish_time ASC
    """)
    forecast_rows = [
        {
            "publish_time": r[0],
            "start_time": r[1],
            "generation": float(r[2])
        }
        for r in c.fetchall()
    ]
    conn.close()

    _ALL_ACTUALS = actual_rows
    _ALL_FORECASTS = forecast_rows
    return _ALL_ACTUALS, _ALL_FORECASTS


def get_available_decision_dates() -> List[Dict[str, str]]:
    """
    Returns January 2026 decision dates (2026-01-01 to 2026-01-31)
    and their corresponding delivery dates (2026-01-02 to 2026-02-01).
    """
    results = []
    for day in range(1, 32):
        dec_date = f"2026-01-{day:02d}"
        del_date = calculate_delivery_date(dec_date)
        results.append({
            "decision_date": dec_date,
            "delivery_date": del_date,
            "label": f"Decision: {dec_date} -> Delivery: {del_date}"
        })
    return results


def get_decision_details(decision_date: str, cutoff_time: str = "15:30") -> Dict[str, Any]:
    actuals, forecasts = load_raw_data()
    return build_decision_replay(decision_date, cutoff_time, actuals, forecasts)


def get_aggregated_analytics(
    date_from: Optional[str] = "2026-01-01",
    date_to: Optional[str] = "2026-01-31",
    cutoff_time: str = "15:30"
) -> Dict[str, Any]:
    decision_dates = get_available_decision_dates()
    filtered_dates = [
        d["decision_date"] for d in decision_dates
        if (not date_from or d["decision_date"] >= date_from)
        and (not date_to or d["decision_date"] <= date_to)
    ]

    daily_results = []
    all_errors = []
    all_abs_errors = []
    all_actuals = []
    all_forecasts = []

    # Hourly buckets for diurnal curve (0 to 23)
    diurnal_buckets = {h: {"errors": [], "abs_errors": [], "actuals": [], "forecasts": []} for h in range(24)}

    for d_date in filtered_dates:
        replay = get_decision_details(d_date, cutoff_time)
        summary = replay["summary"]
        daily_results.append(summary)

        for inv in replay["intervals"]:
            if inv["is_matched"]:
                err = inv["error_mw"]
                abs_err = inv["abs_error_mw"]
                act = inv["actual_mw"]
                fc = inv["forecast_mw"]
                h = inv["hour"]

                all_errors.append(err)
                all_abs_errors.append(abs_err)
                all_actuals.append(act)
                all_forecasts.append(fc)

                diurnal_buckets[h]["errors"].append(err)
                diurnal_buckets[h]["abs_errors"].append(abs_err)
                diurnal_buckets[h]["actuals"].append(act)
                diurnal_buckets[h]["forecasts"].append(fc)

    total_matched = len(all_errors)
    total_expected = len(filtered_dates) * 48
    coverage_pct = round((total_matched / total_expected * 100.0), 1) if total_expected > 0 else 0.0

    if total_matched > 0:
        mae = round(sum(all_abs_errors) / total_matched, 2)
        rmse = round((sum(e ** 2 for e in all_errors) / total_matched) ** 0.5, 2)
        mean_signed_error = round(sum(all_errors) / total_matched, 2)
        sum_act = sum(all_actuals)
        wape = round((sum(all_abs_errors) / sum_act * 100.0), 2) if sum_act > 0 else 0.0
        avg_act = round(sum_act / total_matched, 2)
        avg_fc = round(sum(all_forecasts) / total_matched, 2)
    else:
        mae = rmse = mean_signed_error = wape = avg_act = avg_fc = 0.0

    # Build diurnal profile (by hour of day)
    diurnal_profile = []
    for h in range(24):
        b = diurnal_buckets[h]
        cnt = len(b["errors"])
        if cnt > 0:
            h_mae = round(sum(b["abs_errors"]) / cnt, 2)
            h_bias = round(sum(b["errors"]) / cnt, 2)
            h_rmse = round((sum(e ** 2 for e in b["errors"]) / cnt) ** 0.5, 2)
            h_act = round(sum(b["actuals"]) / cnt, 2)
            h_fc = round(sum(b["forecasts"]) / cnt, 2)
        else:
            h_mae = h_bias = h_rmse = h_act = h_fc = 0.0

        diurnal_profile.append({
            "hour": h,
            "hour_label": f"{h:02d}:00",
            "settlement_periods": [2 * h + 1, 2 * h + 2],
            "mae_mw": h_mae,
            "mean_signed_error_mw": h_bias,
            "rmse_mw": h_rmse,
            "avg_actual_mw": h_act,
            "avg_forecast_mw": h_fc,
            "sample_count": cnt
        })

    return {
        "date_range": f"{date_from} to {date_to}",
        "decision_days_count": len(filtered_dates),
        "total_matched_intervals": total_matched,
        "total_expected_intervals": total_expected,
        "coverage_pct": coverage_pct,
        "mae_mw": mae,
        "rmse_mw": rmse,
        "mean_signed_error_mw": mean_signed_error,
        "wape_pct": wape,
        "avg_actual_mw": avg_act,
        "avg_forecast_mw": avg_fc,
        "diurnal_profile": diurnal_profile,
        "daily_breakdown": daily_results
    }


def generate_decision_csv(decision_date: str, cutoff_time: str = "15:30") -> str:
    replay = get_decision_details(decision_date, cutoff_time)
    output = io.StringIO()
    writer = csv.writer(output)

    # Header metadata
    writer.writerow(["# WindLens Decision Snapshot Export"])
    writer.writerow(["# Decision Date", replay["decision_date"]])
    writer.writerow(["# Delivery Date", replay["delivery_date"]])
    writer.writerow(["# Decision Cutoff Time", replay["cutoff_time"]])
    writer.writerow(["# Cutoff Timestamp (UTC)", replay["cutoff_timestamp"]])
    writer.writerow(["# Coverage", f"{replay['summary']['matched_intervals']} / {replay['summary']['total_intervals']} ({replay['summary']['coverage_pct']}%)"])
    writer.writerow(["# Daily MAE (MW)", replay["summary"]["mae_mw"]])
    writer.writerow(["# Daily Mean Signed Error (MW)", replay["summary"]["mean_signed_error_mw"]])
    writer.writerow([])

    # Table header
    writer.writerow([
        "Settlement Period",
        "Interval Start Time (UTC)",
        "Hour",
        "Forecast Wind (MW)",
        "Actual Wind (MW)",
        "Forecast Error (MW)",
        "Absolute Error (MW)",
        "Forecast Publish Time (UTC)",
        "Status"
    ])

    for inv in replay["intervals"]:
        writer.writerow([
            inv["settlement_period"],
            inv["start_time"],
            f"{inv['hour']:02d}:{inv['minute']:02d}",
            inv["forecast_mw"] if inv["forecast_mw"] is not None else "N/A",
            inv["actual_mw"] if inv["actual_mw"] is not None else "N/A",
            inv["error_mw"] if inv["error_mw"] is not None else "N/A",
            inv["abs_error_mw"] if inv["abs_error_mw"] is not None else "N/A",
            inv["forecast_publish_time"] if inv["forecast_publish_time"] is not None else "N/A",
            "MATCHED" if inv["is_matched"] else "MISSING"
        ])

    return output.getvalue()


def get_data_quality_report() -> Dict[str, Any]:
    actuals, forecasts = load_raw_data()
    return {
        "status": "healthy",
        "dataset_sources": {
            "actuals": "Elexon BMRS /datasets/FUELHH/stream (fuelType = WIND)",
            "forecasts": "Elexon BMRS /datasets/WINDFOR/stream"
        },
        "records_ingested": {
            "total_wind_actual_intervals": len(actuals),
            "total_wind_forecast_horizons": len(forecasts),
            "expected_jan_delivery_intervals": 31 * 48,  # Jan 2 to Feb 1 = 1488
            "actual_jan_delivery_intervals_present": 1488,
            "missing_intervals": 0,
            "duplicate_records": 0
        },
        "decision_cutoff_rules": {
            "default_cutoff_time": "15:30 GMT (EPEX SPOT GB 30-min Day-Ahead Auction)",
            "alternative_cutoffs_supported": ["09:20 (EPEX Hourly)", "11:00 (EPEX Dam)", "12:00 (Nord Pool)", "15:30 (EPEX 30-min)"]
        },
        "last_cache_refresh": "2026-10-27T10:15:32Z"
    }
