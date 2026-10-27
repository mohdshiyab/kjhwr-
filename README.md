# WindLens — Day-Ahead Wind Forecast Intelligence Platform
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passing-brightgreen.svg)]()

> **Live Application Demo (Vercel / Render / Heroku):**  
> 🔗 **[https://windlens-uk-energy.vercel.app](https://windlens-uk-energy.vercel.app)** *(or active container deployment)*  
> 


---

## 1. Product Definition & Business Problem

**WindLens** is a purpose-built day-ahead wind forecast intelligence platform designed for wholesale electricity purchasing desks at UK energy utilities.

The product's purpose is not to predict the weather or replace meteorological agencies. Elexon BMRS already publishes forecasts and actual generation outturns. Instead, WindLens is the software platform that **selects, validates, compares, analyzes, and presents** that information to support day-ahead power purchasing decisions.

### Answering Five Critical Trading Questions Immediately
1. **How much wind generation was forecast?** Reconstructed for every 30-minute settlement period across the delivery day.
2. **When was that forecast published?** Explicit tracking of Elexon publication timestamps.
3. **Was it the latest forecast available at the relevant purchasing decision time?** Enforces strict gate-closure cutoffs (15:30 GMT) to eliminate look-ahead bias.
4. **How far was the forecast from actual generation?** Interval-by-interval error tracking ($e_t = \hat{y}_t - y_t$).
5. **What do the errors tell us about the reliability of the forecast?** Empirical evaluation of MAE, RMSE, diurnal error curves, and systematic bias (+1,840 MW over-forecasting in January 2026).

---

## 2. Core Business Concepts: The Three Dates

WindLens models three distinct temporal concepts that must never be conflated:

```
  [A. DECISION DATE] ──────────► [B. FORECAST PUBLICATION DATE] ──────────► [C. DELIVERY DATE]
  When purchasing desk          When Elexon publishes a particular         When electricity is generated
  submits day-ahead bids        forecast vintage (e.g. 14:30 GMT)          and consumed on the GB grid
  (e.g. 14 January 2026)                                                   (e.g. 15 January 2026)
            │                                                                         │
            └────────── GATE CLOSURE CUTOFF: 15:30 GMT (D-1) ─────────────────────────┘
```

### Interpretation of January 2026 Scope
The assignment specifies *purchase decisions to be made in January 2026*.
* **Decision Dates:** Modeled from **January 1 through January 31, 2026** (31 decision days).
* **Associated Delivery Dates:** Run from **January 2 through February 1, 2026** (31 delivery days), because day-ahead purchasing decisions occur one day prior ($D-1$).
* **Decision Cutoff Assumption:** EPEX SPOT documents the GB hourly day-ahead auction at 09:20 GMT and the GB 30-minute day-ahead auction at **15:30 GMT**. Since this challenge uses half-hourly generation data, **15:30 UK time (GMT) on Day D-1** is modeled as the primary decision cutoff. Alternative auction cutoffs (09:20, 11:00, 12:00) are also selectable in the UI.

---

## 3. Product Scope Boundaries

| Included in Version One | Not Included in Version One (Explicit Boundaries) |
| :--- | :--- |
| ✅ January 2026 purchasing decision dates (Jan 1 – Jan 31) | ❌ Live electricity trading or order execution |
| ✅ National wind generation forecasts (Elexon WINDFOR) | ❌ Solar, hydro, or other non-wind fuels |
| ✅ National wind generation actuals (Elexon FUELHH, WIND) | ❌ Weather prediction ML model (we use Elexon data) |
| ✅ Decision Replay & historical forecast selection | ❌ Automated purchasing orders |
| ✅ Forecast accuracy metrics (MAE, RMSE, Bias, Diurnal) | ❌ Electricity price prediction |
| ✅ Forecast revision history & data-quality audit | ❌ **Consumer demand prediction** *(see limitation below)* |
| ✅ Interval-level CSV export for auditability | ❌ Exact calculated utility purchase volume |

> ⚠️ **Important Domain Limitation:** National wind generation data alone cannot determine the exact megawatt purchase order of an individual utility. That calculation requires proprietary consumer load curves and internal generation assets, which are not present in Elexon market-wide data. WindLens focuses strictly on forecast intelligence and error quantification.

---

## 4. The Four Product Screens

The user interface is designed as one cohesive, executive-grade intelligence tool across four functional views:

### Screen 1 — Overview (The Daily Starting Point)
Displays the selected decision date, associated delivery date, chosen forecast publication vintage, daily forecast and actual totals (MWh and average MW), daily MAE, daily bias, and coverage (**48 / 48 intervals matched, 100%**). Traders can assess the day's performance in under five seconds.

### Screen 2 — Decision Replay (The Flagship Feature)
Reconstructs the exact information the desk had at the 15:30 GMT purchasing cutoff.
* **Composed Replay Chart:** Displays actual wind (cyan line) vs. day-ahead forecast (green dashed line) vs. over/under error bars across all 48 half-hourly settlement periods.
* **Decision Timeline Widget:** Shows all forecast publication runs on Day D-1 (e.g. 02:30, 07:30, 11:30, 15:30) and explains *why* the 15:30 run was **SELECTED**, earlier runs were **SUPERSEDED**, and runs published after 15:30 (e.g. 18:30, 22:30) were **STRICTLY EXCLUDED** to prevent look-ahead bias.
* **Interval Inspector:** Clicking any interval displays exact settlement period, timestamps, megawatt values, error, and publication metadata.

### Screen 3 — Accuracy & Insights (Understand Reliability)
Aggregates performance across all 744 delivery hours of January 2026:
* Overall MAE (**2,122.8 MW**), RMSE (**2,616.7 MW**), and WAPE (**18.33%**).
* **Systematic Bias (+1,840.3 MW):** Documents that Elexon wind forecasts persistently over-predicted generation throughout January 2026.
* **Diurnal Error Curve (00:00 to 23:00):** Reveals that forecasting error peaks during the evening peak (**17:00–19:00 tea-time load**), coinciding with the tightest grid margins.
* **Daily Performance Leaderboard:** Ranks all 31 decision days by error.

### Screen 4 — Data & Method (Explain and Trust the Result)
Auditability and data governance:
* Ingestion audit: 1,536 actual intervals, 20,440 forecast horizons, 0 missing intervals, 0 duplicates.
* Selection algorithm definition and cutoff assumptions.
* **One-Click CSV Export:** Generates auditable interval-level CSV snapshots (`windlens_decision_YYYY-MM-DD.csv`).

---

## 5. Mathematical Formulation & Selection Algorithm

### Forecast Selection Rule
For delivery interval $t$ on delivery day $D+1$ and decision cutoff $D$:
$$\text{Selected forecast}(t, D) = \arg\max_{f} \bigl(f.\text{publishTime}\bigr)$$
$$\text{subject to} \quad f.\text{startTime} = t, \quad f.\text{publishTime} \le D$$

### Accuracy Metrics
1. **Forecast Error:** $e_t = \hat{y}_t - y_t$ (Forecast minus Actual).
2. **Mean Absolute Error (MAE):** $\text{MAE} = \frac{1}{N} \sum_{t=1}^N |\hat{y}_t - y_t|$
3. **Root Mean Square Error (RMSE):** $\text{RMSE} = \sqrt{\frac{1}{N} \sum_{t=1}^N (\hat{y}_t - y_t)^2}$
4. **Mean Signed Error (Bias):** $\text{Bias} = \frac{1}{N} \sum_{t=1}^N (\hat{y}_t - y_t)$ *(Positive = Over-forecast)*
5. **Weighted Absolute Percentage Error (WAPE):** $\text{WAPE} = \frac{\sum |\hat{y}_t - y_t|}{\sum y_t} \times 100\%$ *(Used instead of naive MAPE to prevent division-by-zero during low-wind dropouts).*

---

## 6. Repository Layout & File Details

```
elexon-dayahead-procure-analytics/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health.py               # /api/health & /api/data-quality
│   │   │   ├── decision_dates.py       # /api/decision-dates (Jan 1 - Jan 31)
│   │   │   ├── decisions.py            # /api/decisions/{date}, /revisions, /export
│   │   │   └── analytics.py            # /api/analytics/summary (Aggregate & Diurnal)
│   │   ├── services/
│   │   │   ├── forecast_selection.py   # Pure decision cutoff selection engine
│   │   │   └── data_loader.py          # SQLite & JSON caching layer
│   │   ├── main.py                     # FastAPI app & SPA static file serving
│   │   └── config.py                   # Market defaults & cutoff settings
│   ├── tests/
│   │   ├── test_forecast_selection.py  # 6 tests: cutoff exclusion, missing data, etc.
│   │   ├── test_api.py                 # 7 tests: endpoint contracts & CSV exports
│   │   └── test_metrics.py             # 4 tests: statistical formula accuracy
│   ├── fetch_cache.py                  # Ingestion script streaming from Elexon BMRS
│   └── requirements.txt                # Pinned dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx        # Screen 1: Daily Starting Point
│   │   │   ├── DecisionReplayPage.tsx  # Screen 2: Flagship Decision Replay
│   │   │   ├── AnalyticsPage.tsx       # Screen 3: Accuracy & Insights
│   │   │   └── DataMethodPage.tsx      # Screen 4: Data Quality & Method
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Top controls (Date, Cutoff, Screen tabs)
│   │   │   ├── DecisionTimeline.tsx    # Visual eligibility stepper
│   │   │   ├── ClientPitchDeck.tsx     # 5-slide interactive presentation (Part 1)
│   │   │   └── TechLeadReview.tsx      # Architecture & review walkthrough (Part 2)
│   │   ├── services/api.ts             # Typed API client
│   │   └── types/index.ts              # TypeScript models
│   ├── package.json
│   └── vite.config.ts
├── data/
│   └── processed/
│       ├── elexon_wind.db              # SQLite database (1,536 actuals, 20,440 forecasts)
│       └── aligned_dayahead_jan2026.json
├── scripts/
│   └── refresh_data.py                 # Command to refresh from Elexon BMRS API
├── Dockerfile                          # Multi-stage production container
├── docker-compose.yml                  # Local development orchestration
├── PRESENTATION_SCRIPT.md              # Word-for-word timed 5-min Client Pitch script
├── TECH_REVIEW_SCRIPT.md               # Word-for-word timed 5-min Tech Lead review script
└── README.md
```

---

## 7. How to Start the Application

### Option A: Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone <REPO_URL>
cd <REPO_NAME>

# Start application (builds frontend and runs FastAPI on port 8000)
docker compose up --build
```
Open **`http://localhost:8000`** in your browser.

---

### Option B: Local Python + Vite Development

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run full test suite (17 passing tests)
pytest tests

# Start FastAPI server
uvicorn app.main:app --port 8000 --reload
```
API runs at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

#### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 8. REST API Reference

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | None |
| `GET` | `/api/decision-dates` | Returns 31 January decision dates and associated delivery dates | None |
| `GET` | `/api/decisions/{decision_date}` | Returns 48-interval decision snapshot at cutoff | `cutoff_time` (default: `15:30`) |
| `GET` | `/api/decisions/{decision_date}/revisions` | Returns publication vintage history (eligible vs excluded) | `cutoff_time` (default: `15:30`) |
| `GET` | `/api/decisions/{decision_date}/export` | Downloads interval-level CSV snapshot | `cutoff_time` (default: `15:30`) |
| `GET` | `/api/analytics/summary` | Aggregated error metrics & diurnal hourly curve | `date_from`, `date_to`, `cutoff_time` |
| `GET` | `/api/data-quality` | Audit report: ingested intervals, missing observations, refresh timestamp | None |

---

## 9. Automated Testing (17 Passing Tests)

Run tests from the `backend/` directory:
```bash
pytest tests
```

```
tests\test_api.py .......                                                [ 41%]
tests\test_forecast_selection.py ......                                  [ 76%]
tests\test_metrics.py ....                                               [100%]
============================= 17 passed in 0.89s ==============================
```

Covering:
* **`test_select_latest_eligible_forecast`**: Selects latest publication before cutoff.
* **`test_strictly_exclude_forecast_after_cutoff`**: Excludes post-cutoff forecasts (prevents data leakage).
* **`test_missing_forecast_marks_interval_unavailable`**: Returns `None`, never invents synthetic numbers.
* **`test_decision_replay_with_known_values`**: Verifies exact mathematical error on synthetic cases.
* **`test_csv_export`**: Validates CSV structure and metadata headers.

---

## 10. Video Demo Recording Guide (10 Minutes)

Use the built-in presentation tabs in the web app:
* **Part 1: Client Presentation & Pitch (Max 5 mins):** Click **"Part 1 Pitch"** in the navbar. Script is in [`PRESENTATION_SCRIPT.md`](PRESENTATION_SCRIPT.md).
* **Part 2: Technical Review for Tech Lead (Max 5 mins):** Click **"Part 2 Tech Review"** in the navbar. Script is in [`TECH_REVIEW_SCRIPT.md`](TECH_REVIEW_SCRIPT.md).

---

## 11. Explicit Disclosure of AI Tools Used

In compliance with the challenge instructions:
* **AI Tool Utilized:** Google DeepMind Advanced Agentic Assistant (Gemini 3.8).
* **Scope of Assistance:**
  - Designing the WindLens product blueprint and day-ahead electricity auction settlement structure.
  - Formulating the forecast selection algorithm to prevent look-ahead bias at auction gate closure.
  - Generating initial component scaffolding and drafting presentation scripts.
  - All Elexon BMRS streaming queries, data normalization, mathematical error calculations, and Pytest suites were executed and verified against actual January 2026 Elexon data.
