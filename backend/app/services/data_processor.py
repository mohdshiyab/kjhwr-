import os
import json
from typing import List, Dict, Any, Optional
from app.config import ALIGNED_JSON, HALF_HOURLY_JSON, DEFAULT_GATE_CLOSURE

# Global in-memory cache for speed
_ALIGNED_RECORDS: Optional[List[Dict[str, Any]]] = None
_HALF_HOURLY_RECORDS: Optional[List[Dict[str, Any]]] = None


def load_aligned_records() -> List[Dict[str, Any]]:
    global _ALIGNED_RECORDS
    if _ALIGNED_RECORDS is None:
        if os.path.exists(ALIGNED_JSON):
            with open(ALIGNED_JSON, "r", encoding="utf-8") as f:
                _ALIGNED_RECORDS = json.load(f)
        else:
            _ALIGNED_RECORDS = []
    return _ALIGNED_RECORDS


def load_half_hourly_records() -> List[Dict[str, Any]]:
    global _HALF_HOURLY_RECORDS
    if _HALF_HOURLY_RECORDS is None:
        if os.path.exists(HALF_HOURLY_JSON):
            with open(HALF_HOURLY_JSON, "r", encoding="utf-8") as f:
                _HALF_HOURLY_RECORDS = json.load(f)
        else:
            _HALF_HOURLY_RECORDS = []
    return _HALF_HOURLY_RECORDS


def get_filtered_records(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    gate_closure: str = DEFAULT_GATE_CLOSURE
) -> List[Dict[str, Any]]:
    """
    Returns time series records with the selected gate closure forecast active as 'forecast_mw'
    and recomputed errors for that gate closure.
    """
    all_records = load_aligned_records()
    results = []

    for r in all_records:
        sdate = r["settlement_date"]
        if date_from and sdate < date_from:
            continue
        if date_to and sdate > date_to:
            continue

        item = dict(r)

        # Resolve forecast according to gate closure
        if gate_closure == "intraday":
            fc_val = r.get("intraday_forecast_mw")
            pub_val = r.get("intraday_publish_time")
        else:
            fc_info = r.get("forecasts", {}).get(gate_closure)
            if fc_info:
                fc_val = fc_info.get("forecast_mw")
                pub_val = fc_info.get("publish_time")
            else:
                fc_val = r.get("day_ahead_forecast_mw")
                pub_val = r.get("day_ahead_publish_time")

        act_val = r.get("actual_mw", 0.0)
        if fc_val is not None:
            err = round(fc_val - act_val, 2)
            abs_err = round(abs(err), 2)
            pct_err = round((abs_err / act_val * 100.0), 2) if act_val > 0 else 0.0
        else:
            err = None
            abs_err = None
            pct_err = None

        item["forecast_mw"] = fc_val
        item["publish_time"] = pub_val
        item["error_mw"] = err
        item["abs_error_mw"] = abs_err
        item["pct_error"] = pct_err
        item["gate_closure"] = gate_closure

        results.append(item)

    return results


def get_available_dates() -> List[str]:
    all_records = load_aligned_records()
    dates = sorted(list(set(r["settlement_date"] for r in all_records)))
    return dates
