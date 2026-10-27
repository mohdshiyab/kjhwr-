"""
WindLens - Data Refresh & Snapshot Pre-Computation Script
Downloads historical data from Elexon BMRS datasets (FUELHH & WINDFOR)
Normalizes into SQLite and structured cache for zero-latency, auditable serving.
"""

import os
import sys

# Ensure backend folder is on path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from fetch_cache import main as run_fetch_cache

if __name__ == "__main__":
    print("=" * 60)
    print("WindLens: Starting Elexon BMRS Data Refresh Pipeline...")
    print("Scope: January 2026 Purchasing Decisions (Delivery: Jan 2 - Feb 1, 2026)")
    print("=" * 60)
    run_fetch_cache()
    print("=" * 60)
    print("Data Refresh Complete! SQLite and JSON snapshots updated.")
    print("=" * 60)
