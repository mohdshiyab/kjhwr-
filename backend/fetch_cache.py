"""
Elexon BMRS Data Ingestion & Caching Script
Fetches FUELHH (Wind Actuals) and WINDFOR (Wind Forecasts) for January 2026
Stores in SQLite and pre-computed JSON for high-performance retrieval.
"""

import os
import sys
import json
import sqlite3
import datetime
import requests
from typing import Dict, List, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "app", "data")
DB_PATH = os.path.join(DATA_DIR, "elexon_wind.db")

ELEXON_BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


def init_db(conn: sqlite3.Connection):
    cursor = conn.cursor()
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS actual_generation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time TEXT NOT NULL,
        publish_time TEXT,
        settlement_date TEXT NOT NULL,
        settlement_period INTEGER NOT NULL,
        fuel_type TEXT NOT NULL,
        generation REAL NOT NULL,
        UNIQUE(start_time, fuel_type)
    );
    CREATE INDEX IF NOT EXISTS idx_actual_start ON actual_generation(start_time);
    CREATE INDEX IF NOT EXISTS idx_actual_date ON actual_generation(settlement_date);

    CREATE TABLE IF NOT EXISTS forecast_generation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        publish_time TEXT NOT NULL,
        start_time TEXT NOT NULL,
        generation REAL NOT NULL,
        UNIQUE(publish_time, start_time)
    );
    CREATE INDEX IF NOT EXISTS idx_forecast_start ON forecast_generation(start_time);
    CREATE INDEX IF NOT EXISTS idx_forecast_pub ON forecast_generation(publish_time);
    """)
    conn.commit()


def fetch_fuelhh_actuals(conn: sqlite3.Connection, start_date="2026-01-01", end_date="2026-02-01"):
    print(f"Fetching FUELHH (Wind Actuals) from {start_date} to {end_date}...")
    url = f"{ELEXON_BASE}/FUELHH/stream?settlementDateFrom={start_date}&settlementDateTo={end_date}"
    r = requests.get(url, timeout=90)
    r.raise_for_status()
    raw = r.json()
    wind_items = [x for x in raw if x.get("fuelType") == "WIND"]
    print(f"Fetched {len(raw)} total FUELHH records. Found {len(wind_items)} WIND records.")

    cursor = conn.cursor()
    inserted = 0
    for item in wind_items:
        cursor.execute("""
        INSERT OR REPLACE INTO actual_generation 
        (start_time, publish_time, settlement_date, settlement_period, fuel_type, generation)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            item["startTime"],
            item.get("publishTime"),
            item["settlementDate"],
            item["settlementPeriod"],
            item["fuelType"],
            float(item["generation"])
        ))
        inserted += 1
    conn.commit()
    print(f"Successfully stored {inserted} actual wind records.")
    return wind_items


def fetch_windfor_forecasts(conn: sqlite3.Connection):
    print("Fetching WINDFOR (Wind Forecasts) for January 2026 decision horizons...")
    # Decisions in Jan 2026 (decisions from 2025-12-31 to 2026-01-31, delivering Jan 1 - Feb 2)
    # Query in 5-day sliding windows
    windows = [
        ("2025-12-30T00:00:00Z", "2026-01-04T00:00:00Z"),
        ("2026-01-04T00:00:00Z", "2026-01-09T00:00:00Z"),
        ("2026-01-09T00:00:00Z", "2026-01-14T00:00:00Z"),
        ("2026-01-14T00:00:00Z", "2026-01-19T00:00:00Z"),
        ("2026-01-19T00:00:00Z", "2026-01-24T00:00:00Z"),
        ("2026-01-24T00:00:00Z", "2026-01-29T00:00:00Z"),
        ("2026-01-29T00:00:00Z", "2026-02-02T23:59:59Z"),
    ]

    cursor = conn.cursor()
    total_stored = 0
    for w_start, w_end in windows:
        url = f"{ELEXON_BASE}/WINDFOR/stream?publishDateTimeFrom={w_start}&publishDateTimeTo={w_end}"
        print(f"  Fetching WINDFOR window {w_start[:10]} -> {w_end[:10]}...")
        try:
            r = requests.get(url, timeout=60)
            r.raise_for_status()
            data = r.json()
            for item in data:
                cursor.execute("""
                INSERT OR IGNORE INTO forecast_generation (publish_time, start_time, generation)
                VALUES (?, ?, ?)
                """, (item["publishTime"], item["startTime"], float(item["generation"])))
            conn.commit()
            total_stored += len(data)
            print(f"    -> Window returned {len(data)} forecasts.")
        except Exception as e:
            print(f"    -> Error fetching {w_start}..{w_end}: {e}")

    print(f"Total WINDFOR forecast records processed: {total_stored}")


def precompute_aligned_dataset(conn: sqlite3.Connection):
    """
    Creates an aligned dataset matching actuals with day-ahead and intraday forecasts.
    Evaluates gate closure cuts at 07:00, 11:00, 12:00, 14:00, 17:00 on D-1, plus Intraday.
    Saves to JSON for fast API serving.
    """
    print("Pre-computing aligned Day-Ahead procurement dataset...")
    cursor = conn.cursor()

    # Get all actuals for Jan 1 - Jan 31
    cursor.execute("""
    SELECT start_time, settlement_date, settlement_period, generation 
    FROM actual_generation 
    WHERE settlement_date >= '2026-01-01' AND settlement_date <= '2026-01-31'
    ORDER BY start_time ASC
    """)
    actual_rows = cursor.fetchall()

    # Pre-load all forecasts
    cursor.execute("SELECT publish_time, start_time, generation FROM forecast_generation")
    forecast_rows = cursor.fetchall()
    
    # Organize forecasts by start_time -> list of (publish_time, generation)
    forecast_by_start: Dict[str, List[tuple]] = {}
    for pub, st, gen in forecast_rows:
        if st not in forecast_by_start:
            forecast_by_start[st] = []
        forecast_by_start[st].append((pub, gen))

    # Sort each list by publish_time ascending
    for st in forecast_by_start:
        forecast_by_start[st].sort(key=lambda x: x[0])

    gate_closures = {
        "da_0700": "07:00:00Z",
        "da_1100": "11:00:00Z", # Primary EPEX Day-Ahead Gate
        "da_1200": "12:00:00Z", # Nord Pool Day-Ahead Gate
        "da_1400": "14:00:00Z",
        "da_1700": "17:00:00Z",
    }

    # Hourly actuals mapping: hour_key (e.g. "2026-01-01T00:00:00Z") -> list of 2 half-hour actuals
    hourly_actuals: Dict[str, Dict[str, Any]] = {}
    for st, sdate, sp, gen in actual_rows:
        # st is "2026-01-01T00:30:00Z" -> hour is "2026-01-01T00:00:00Z"
        dt = datetime.datetime.fromisoformat(st.replace("Z", "+00:00"))
        hour_dt = dt.replace(minute=0, second=0)
        hour_key = hour_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        if hour_key not in hourly_actuals:
            hourly_actuals[hour_key] = {
                "start_time": hour_key,
                "date": hour_dt.strftime("%Y-%m-%d"),
                "hour": hour_dt.hour,
                "actual_periods": [],
                "actual_mw": 0.0,
            }
        hourly_actuals[hour_key]["actual_periods"].append({"sp": sp, "start_time": st, "gen": gen})

    # Compute average actual MW for each hour
    for hk, hdata in hourly_actuals.items():
        gens = [p["gen"] for p in hdata["actual_periods"]]
        hdata["actual_mw"] = round(sum(gens) / len(gens), 2) if gens else 0.0

    aligned_records = []

    for hk in sorted(hourly_actuals.keys()):
        hdata = hourly_actuals[hk]
        dt = datetime.datetime.fromisoformat(hk.replace("Z", "+00:00"))
        d_minus_1 = (dt - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

        candidates = forecast_by_start.get(hk, [])

        # Intraday: latest forecast published before delivery start
        intraday_c = [c for c in candidates if c[0] <= hk]
        intraday_val = intraday_c[-1][1] if intraday_c else None
        intraday_pub = intraday_c[-1][0] if intraday_c else None

        row = {
            "start_time": hk,
            "settlement_date": hdata["date"],
            "hour": hdata["hour"],
            "settlement_periods": [p["sp"] for p in hdata["actual_periods"]],
            "actual_mw": hdata["actual_mw"],
            "actual_half_hours": hdata["actual_periods"],
            "intraday_forecast_mw": intraday_val,
            "intraday_publish_time": intraday_pub,
            "forecasts": {}
        }

        # For each gate closure on D-1
        for gc_name, gc_time in gate_closures.items():
            cutoff_iso = f"{d_minus_1}T{gc_time}"
            valid_c = [c for c in candidates if c[0] <= cutoff_iso]
            if valid_c:
                latest_forecast = valid_c[-1]
                val = latest_forecast[1]
                pub = latest_forecast[0]
                err = round(val - hdata["actual_mw"], 2)
                abs_err = round(abs(err), 2)
                pct_err = round((abs_err / hdata["actual_mw"] * 100.0), 2) if hdata["actual_mw"] > 0 else 0.0
                row["forecasts"][gc_name] = {
                    "forecast_mw": val,
                    "publish_time": pub,
                    "error_mw": err,         # Positive = Over-forecast, Negative = Under-forecast
                    "abs_error_mw": abs_err,
                    "pct_error": pct_err
                }
            else:
                row["forecasts"][gc_name] = None

        # Primary DA reference is da_1100 (standard EPEX Day-Ahead Auction)
        primary = row["forecasts"].get("da_1100") or row["forecasts"].get("da_1200")
        if primary:
            row["day_ahead_forecast_mw"] = primary["forecast_mw"]
            row["day_ahead_publish_time"] = primary["publish_time"]
            row["day_ahead_error_mw"] = primary["error_mw"]
            row["day_ahead_abs_error_mw"] = primary["abs_error_mw"]
            row["day_ahead_pct_error"] = primary["pct_error"]
        else:
            row["day_ahead_forecast_mw"] = None
            row["day_ahead_publish_time"] = None
            row["day_ahead_error_mw"] = None
            row["day_ahead_abs_error_mw"] = None
            row["day_ahead_pct_error"] = None

        aligned_records.append(row)

    output_path = os.path.join(DATA_DIR, "aligned_dayahead_jan2026.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(aligned_records, f, indent=2)

    print(f"Precomputed {len(aligned_records)} hourly aligned records.")
    print(f"Saved aligned dataset to: {output_path}")

    # Also build half-hourly detailed dataset
    hh_records = []
    for st, sdate, sp, act_gen in actual_rows:
        dt = datetime.datetime.fromisoformat(st.replace("Z", "+00:00"))
        hour_dt = dt.replace(minute=0, second=0)
        hour_key = hour_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        d_minus_1 = (dt - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

        candidates = forecast_by_start.get(hour_key, [])
        cutoff_11 = f"{d_minus_1}T11:00:00Z"
        valid_11 = [c for c in candidates if c[0] <= cutoff_11]
        fc_11 = valid_11[-1][1] if valid_11 else None
        pub_11 = valid_11[-1][0] if valid_11 else None

        err = round(fc_11 - act_gen, 2) if fc_11 is not None else None
        abs_err = round(abs(err), 2) if err is not None else None
        pct_err = round((abs_err / act_gen * 100.0), 2) if (abs_err is not None and act_gen > 0) else 0.0

        hh_records.append({
            "start_time": st,
            "settlement_date": sdate,
            "settlement_period": sp,
            "actual_mw": act_gen,
            "day_ahead_forecast_mw": fc_11,
            "day_ahead_publish_time": pub_11,
            "error_mw": err,
            "abs_error_mw": abs_err,
            "pct_error": pct_err
        })

    hh_output_path = os.path.join(DATA_DIR, "half_hourly_aligned_jan2026.json")
    with open(hh_output_path, "w", encoding="utf-8") as f:
        json.dump(hh_records, f, indent=2)

    print(f"Precomputed {len(hh_records)} half-hourly aligned records.")
    print(f"Saved half-hourly dataset to: {hh_output_path}")


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        init_db(conn)
        fetch_fuelhh_actuals(conn)
        fetch_windfor_forecasts(conn)
        precompute_aligned_dataset(conn)
        print("Data ingestion and pre-computation complete!")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
