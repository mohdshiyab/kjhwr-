import numpy as np
from typing import Dict, Any, List
from app.services.data_processor import get_filtered_records
from app.config import (
    DEFAULT_CASHOUT_SHORT_PRICE,
    DEFAULT_CASHOUT_LONG_PRICE,
    DEFAULT_THERMAL_DA_PRICE
)


def get_hourly_demand_profile(base_demand_mw: float, hour: int, profile_type="winter_diurnal") -> float:
    """
    Standard UK Winter Diurnal Electricity Demand Profile multiplier.
    Morning peak at 08:00-09:00, evening tea-time peak at 17:00-19:00, overnight trough at 03:00-05:00.
    """
    if profile_type == "flat":
        return base_demand_mw

    diurnal_multipliers = [
        0.75, 0.72, 0.70, 0.69, 0.71, 0.78, 0.90, 1.05,  # 00:00 - 07:00
        1.14, 1.12, 1.08, 1.05, 1.03, 1.02, 1.01, 1.03,  # 08:00 - 15:00
        1.12, 1.25, 1.22, 1.15, 1.08, 1.00, 0.88, 0.80   # 16:00 - 23:00
    ]
    mult = diurnal_multipliers[hour % 24]
    return round(base_demand_mw * mult, 1)


def simulate_thermal_procurement(
    target_date: str,
    base_demand_mw: float = 30000.0,
    use_derating_buffer: bool = True,
    buffer_pct: float = 15.0,
    gate_closure: str = "da_1100"
) -> Dict[str, Any]:
    records = get_filtered_records(date_from=target_date, date_to=target_date, gate_closure=gate_closure)

    if not records:
        return {
            "error": f"No data found for date {target_date}",
            "target_date": target_date,
            "hourly_schedule": []
        }

    hourly_schedule = []
    total_demand_mwh = 0.0
    total_wind_actual_mwh = 0.0
    total_wind_forecast_mwh = 0.0
    total_thermal_procured_mwh = 0.0
    total_thermal_needed_mwh = 0.0
    total_short_mwh = 0.0
    total_long_mwh = 0.0
    total_cashout_penalty_gbp = 0.0

    for r in records:
        h = r["hour"]
        demand_mw = get_hourly_demand_profile(base_demand_mw, h)
        w_fc = r.get("forecast_mw") or 0.0
        w_act = r.get("actual_mw") or 0.0

        # If derating buffer is enabled: reduce wind expectation to protect against over-forecasting
        if use_derating_buffer:
            derated_wind_mw = max(0.0, round(w_fc * (1.0 - (buffer_pct / 100.0)), 1))
        else:
            derated_wind_mw = round(w_fc, 1)

        # Day-ahead procurement decision: how much thermal to buy to serve remaining demand
        thermal_procured = max(0.0, round(demand_mw - derated_wind_mw, 1))

        # Actual thermal needed in real-time
        actual_thermal_needed = max(0.0, round(demand_mw - w_act, 1))

        # Imbalance = Procured - Needed
        imbalance_mw = round(thermal_procured - actual_thermal_needed, 1)

        # Financial impact of imbalance
        if imbalance_mw < 0:
            status = "SHORT"
            short_mwh = abs(imbalance_mw)
            # Short penalty = Paying cashout buy price minus what we would have paid in day-ahead
            imbalance_cost = short_mwh * (DEFAULT_CASHOUT_SHORT_PRICE - DEFAULT_THERMAL_DA_PRICE)
            total_short_mwh += short_mwh
        elif imbalance_mw > 0:
            status = "LONG"
            long_mwh = imbalance_mw
            # Long loss = Day-ahead cost paid minus cashout sell price received
            imbalance_cost = long_mwh * (DEFAULT_THERMAL_DA_PRICE - DEFAULT_CASHOUT_LONG_PRICE)
            total_long_mwh += long_mwh
        else:
            status = "BALANCED"
            imbalance_cost = 0.0

        total_demand_mwh += demand_mw
        total_wind_actual_mwh += w_act
        total_wind_forecast_mwh += w_fc
        total_thermal_procured_mwh += thermal_procured
        total_thermal_needed_mwh += actual_thermal_needed
        total_cashout_penalty_gbp += max(0.0, imbalance_cost)

        hourly_schedule.append({
            "hour": h,
            "start_time": r["start_time"],
            "consumer_demand_mw": demand_mw,
            "wind_forecast_mw": w_fc,
            "derated_wind_mw": derated_wind_mw,
            "actual_wind_mw": w_act,
            "thermal_procured_mw": thermal_procured,
            "actual_thermal_needed_mw": actual_thermal_needed,
            "imbalance_mw": imbalance_mw,
            "status": status,
            "est_imbalance_impact_gbp": round(imbalance_cost, 2)
        })

    summary = {
        "target_date": target_date,
        "gate_closure": gate_closure,
        "base_demand_mw": base_demand_mw,
        "use_derating_buffer": use_derating_buffer,
        "buffer_pct": buffer_pct,
        "total_demand_mwh": round(total_demand_mwh, 1),
        "total_wind_actual_mwh": round(total_wind_actual_mwh, 1),
        "total_wind_forecast_mwh": round(total_wind_forecast_mwh, 1),
        "total_thermal_procured_mwh": round(total_thermal_procured_mwh, 1),
        "total_thermal_needed_mwh": round(total_thermal_needed_mwh, 1),
        "net_imbalance_mwh": round(total_thermal_procured_mwh - total_thermal_needed_mwh, 1),
        "total_short_mwh": round(total_short_mwh, 1),
        "total_long_mwh": round(total_long_mwh, 1),
        "est_imbalance_penalty_gbp": round(total_cashout_penalty_gbp, 2),
        "renewable_penetration_pct": round((total_wind_actual_mwh / total_demand_mwh * 100.0), 1) if total_demand_mwh > 0 else 0.0
    }

    return {
        "target_date": target_date,
        "summary": summary,
        "hourly_schedule": hourly_schedule
    }
