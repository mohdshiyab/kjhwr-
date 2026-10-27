import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "app", "data")
DB_PATH = os.path.join(DATA_DIR, "elexon_wind.db")
ALIGNED_JSON = os.path.join(DATA_DIR, "aligned_dayahead_jan2026.json")
HALF_HOURLY_JSON = os.path.join(DATA_DIR, "half_hourly_aligned_jan2026.json")

# Default market parameters for UK Day-Ahead electricity
DEFAULT_GATE_CLOSURE = "da_1100"  # 11:00 GMT on D-1 (EPEX SPOT Day-Ahead Auction)
DEFAULT_DEMAND_PEAK_MW = 32000.0  # Typical UK winter peak demand
DEFAULT_DEMAND_BASE_MW = 20000.0  # Typical UK winter baseload demand
DEFAULT_CASHOUT_SHORT_PRICE = 160.0  # £/MWh average cashout when short (System Buy Price)
DEFAULT_CASHOUT_LONG_PRICE = 65.0   # £/MWh average cashout when long (System Sell Price)
DEFAULT_THERMAL_DA_PRICE = 95.0     # £/MWh average day-ahead thermal procurement price
