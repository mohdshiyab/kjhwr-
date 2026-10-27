# UK Day-Ahead Electricity Market Procurement & Renewable Forecast Analytics
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-9%20Passing-brightgreen.svg)]()

> **Live Application Demo (Vercel / Render / Heroku):**  
> 🔗 **[https://uk-power-dayahead-analytics.vercel.app](https://uk-power-dayahead-analytics.vercel.app)** *(or container deployment link)*  
> 
> **Unlisted Video Walkthrough (10 min max):**  
> 🎥 **[YouTube Video Demo: Client Pitch (Part 1) & Tech Lead Walkthrough (Part 2)](https://www.youtube.com/watch?v=UNLISTED_DEMO_LINK)**

---

## 1. Executive Problem Setting & Domain Context

An energy utility operating in the United Kingdom wholesale electricity market is responsible for procuring power from the **Day-Ahead Market (DAM)** to satisfy anticipated consumer demand. 

To determine the volume of dispatchable thermal power (e.g. Combined Cycle Gas Turbines - CCGT or peakers) that must be purchased in day-ahead auctions, the utility’s power purchase desk must accurately assess the generation available from intermittent renewable sources—specifically national wind generation.

Because wind generation is weather-dependent and purchase decisions in the day-ahead auction (EPEX SPOT / Nord Pool N2EX) must be finalized one day prior to delivery (Gate Closure at **11:00 AM / 12:00 PM GMT on Day D-1**), the desk relies heavily on renewable generation forecasts.

### Core Objectives Delivered by this Web Application
1. **Understand Latest Renewable Forecasts at Decision Milestones:** Provides clear, interactive visualization of the latest wind forecasts published prior to Day-Ahead Gate Closure across all 744 hours (1,488 half-hourly settlement periods) of **January 2026**.
2. **Quantitatively Evaluate Forecast Accuracy:** Computes empirical error statistics (**MAE, RMSE, WAPE, Systematic Bias, Correlation, and P10-P90 Quantiles**) so traders can price risk into their bidding decisions.
3. **Simulate Thermal Procurement & Imbalance Exposure:** Direct interactive simulator calculating the hourly thermal dispatch requirement and demonstrating how an **empirical derating safety buffer** mitigates punitive Balancing Mechanism cashout penalties.
4. **Gate Closure Sensitivity:** Compares accuracy across 07:00 AM, 11:00 AM (EPEX), 12:00 PM (Nord Pool), 14:00 PM, 17:00 PM, and Intraday to demonstrate lead-time information gains.

---

## 2. Key Data Sources & Domain Mechanics

This application utilizes national-level generation data streamed exclusively from **Elexon BMRS** (the official balancing mechanism reporting service for Great Britain):

| Dataset | Elexon Endpoint | Granularity | Scope Filtered | Key Fields |
| :--- | :--- | :--- | :--- | :--- |
| **Actual Generation** | `/datasets/FUELHH/stream` | 30-min Settlement Periods | `fuelType == "WIND"` | `startTime`, `settlementDate`, `settlementPeriod`, `generation` |
| **Forecast Generation** | `/datasets/WINDFOR/stream` | Rolling multi-horizon (1-hr resolution) | Decisions in Jan 2026 | `startTime`, `publishTime`, `generation` |

### Prevention of Look-Ahead Bias (Data Leakage)
In day-ahead electricity auctions, order books close at **11:00 AM on Day D-1** (EPEX SPOT) or **12:00 PM on Day D-1** (Nord Pool). Because Elexon updates forecasts continuously throughout D-1 and delivery day D, querying the "latest" forecast naively introduces severe look-ahead bias (evaluating a forecast published after the auction closed).

Our data pipeline strictly filters candidates by:
$$\text{Candidate Forecasts} = \{ f \in \text{WINDFOR} \mid f.\text{startTime} = t \text{ and } f.\text{publishTime} \le T_{\text{gate\_closure}} \}$$
The active Day-Ahead forecast is selected via $\max(f.\text{publishTime})$ within that historical information window.

---

## 3. Key Analytical Findings (January 2026)

* **Total Wind Energy Delivered:** **8,616.1 GWh** (Average: 11,580.7 MW; Peak: 17,755.5 MW).
* **Mean Absolute Error (MAE):** **2,122.8 MW**
* **Root Mean Square Error (RMSE):** **2,616.7 MW**
* **Weighted Absolute Percentage Error (WAPE):** **18.33%**
* **Systematic Bias:** **+1,840.3 MW**  
  > ⚠️ **Critical Discovery:** National Grid / Elexon's Day-Ahead wind forecast systematically **over-predicted** wind generation by an average of 1.84 GW every hour in January 2026. A trader relying on raw forecasts would consistently under-procure thermal baseload, leaving the utility short in the balancing mechanism and paying punitive cashout prices (£160–£300+/MWh).

---

## 4. Repository Structure & File Details

```
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   ├── aligned_dayahead_jan2026.json   # Pre-computed hourly aligned Jan 2026 dataset
│   │   │   ├── half_hourly_aligned_jan2026.json# 48 settlement period detailed dataset
│   │   │   └── elexon_wind.db                  # Persistent SQLite database of raw BMRS streams
│   │   ├── models/
│   │   │   └── schemas.py                      # Pydantic v2 validation schemas
│   │   ├── routers/
│   │   │   ├── summary.py                      # /api/summary (Executive KPIs)
│   │   │   ├── forecasts.py                    # /api/forecasts (Time-series & SP breakdown)
│   │   │   ├── metrics.py                      # /api/metrics (Quantitative accuracy & diurnal)
│   │   │   ├── procurement.py                  # /api/procurement/simulate (Thermal simulator)
│   │   │   └── sensitivity.py                  # /api/sensitivity/compare (Gate closures)
│   │   ├── services/
│   │   │   ├── data_processor.py               # Gate closure filtering & in-memory caching
│   │   │   ├── metrics_service.py              # Vectorized NumPy statistical error formulas
│   │   │   └── procurement_service.py          # Thermal gap dispatch & imbalance calculator
│   │   ├── config.py                           # Market default parameters (cashout prices, gate times)
│   │   └── main.py                             # FastAPI application & SPA static asset server
│   ├── tests/
│   │   ├── test_metrics.py                     # Unit tests for MAE, RMSE, WAPE, Bias, Bins
│   │   └── test_api.py                         # Integration tests for all REST API endpoints
│   ├── fetch_cache.py                          # Automated data ingestion script for Elexon BMRS
│   └── requirements.txt                        # Pinned backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx                      # Top bar with market status, date & gate picker
│   │   │   ├── ExecutiveKPIs.tsx               # Metric cards (GWh, WAPE, Bias, P90 Buffer)
│   │   │   ├── DayAheadDesk.tsx                # Tab 1: Operational Procurement Desk (Charts + Table)
│   │   │   ├── ThermalSimulator.tsx            # Interactive Thermal Procurement Simulator
│   │   │   ├── AccuracyAnalytics.tsx           # Tab 2: Error metrics, SP 1-48 diurnal curve, histogram
│   │   │   ├── GateClosureImpact.tsx           # Tab 3: Gate closure sensitivity analysis
│   │   │   ├── ClientPitchDeck.tsx             # Tab 4: Interactive Client Presentation Deck (Part 1)
│   │   │   └── TechLeadReview.tsx              # Tab 5: Technical Architecture Walkthrough (Part 2)
│   │   ├── services/api.ts                     # Strongly-typed API client
│   │   ├── types/index.ts                      # TypeScript interfaces matching backend models
│   │   ├── App.tsx                             # Main application layout and state management
│   │   ├── main.tsx                            # React DOM entry point
│   │   └── index.css                           # Tailwind CSS directives and custom styling
│   ├── package.json                            # Frontend npm dependencies
│   ├── vite.config.ts                          # Vite bundler configuration with API reverse proxy
│   ├── tailwind.config.js                      # Custom energy utility theme palette
│   └── tsconfig.json                           # TypeScript configuration
├── Dockerfile                                  # Multi-stage production container build
├── docker-compose.yml                          # Single-command orchestration
├── PRESENTATION_SCRIPT.md                      # Word-for-word timed 5-min Client Pitch script
├── TECH_REVIEW_SCRIPT.md                       # Word-for-word timed 5-min Tech Lead review script
└── README.md                                   # Comprehensive documentation & setup guide
```

---

## 5. How to Start the Application

### Option A: Using Docker (Recommended)
Make sure Docker Desktop is running, then run:

```bash
# Clone the repository
git clone <REPO_URL>
cd <REPO_NAME>

# Build and start container
docker compose up --build
```

The application will be available at:
👉 **`http://localhost:8000`** (serves both React UI and FastAPI backend).  
API interactive documentation: **`http://localhost:8000/docs`**.

---

### Option B: Local Development (Python + Vite)

#### 1. Start the Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend tests to verify
pytest tests

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at `http://127.0.0.1:8000`.

#### 2. Start the Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server with proxy to backend
npm run dev
```
Frontend development server will open at:
👉 **`http://localhost:3000`**.

---

## 6. Mathematical Error Formulation

1. **Mean Absolute Error (MAE):**
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |F_i - A_i|$$
2. **Root Mean Square Error (RMSE):**
   $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (F_i - A_i)^2}$$
3. **Weighted Absolute Percentage Error (WAPE):**
   $$\text{WAPE} = \frac{\sum_{i=1}^N |F_i - A_i|}{\sum_{i=1}^N A_i} \times 100\%$$
   *Note: WAPE is implemented instead of naive MAPE because during wind dropouts ($A_i \approx 0$), naive MAPE causes division by near-zero resulting in distorted 1,000%+ figures.*
4. **Systematic Prediction Bias (MPE):**
   $$\text{Bias} = \frac{1}{N} \sum_{i=1}^N (F_i - A_i)$$
   *(Positive value denotes persistent over-prediction / shortfall risk).*
5. **Thermal Procurement Formula:**
   $$T_{\text{procured}, t} = \max\left(0, D_t - F_{\text{wind}, t} \times (1 - \text{Buffer})\right)$$
   $$\text{Imbalance}_t = T_{\text{procured}, t} - \max\left(0, D_t - A_{\text{wind}, t}\right)$$

---

## 7. Video Demo & Presentation Guidance

The assignment requires an unlisted YouTube video containing two distinct 5-minute segments:
1. **Part 1: Client Presentation & Pitch (Max 5 mins)**  
   *Use the embedded **"Client Pitch (Part 1 Demo)"** tab in the web application.*  
   Follow the step-by-step word-for-word script in [`PRESENTATION_SCRIPT.md`](PRESENTATION_SCRIPT.md).
2. **Part 2: Technical Walkthrough & Architecture Review (Max 5 mins)**  
   *Use the embedded **"Tech Lead Review (Part 2 Demo)"** tab in the web application.*  
   Follow the step-by-step word-for-word script in [`TECH_REVIEW_SCRIPT.md`](TECH_REVIEW_SCRIPT.md).

---

## 8. Explicit Disclosure of AI Tools Used

In accordance with the assignment instructions (*"You are free to use AI tools to assist with building this application (please mention it explicitly in the README if you’ve used AI tools)"*):
* **AI Tool Utilized:** Google DeepMind Advanced Agentic Assistant (Gemini 3.8).
* **Scope of Assistance:**
  - Formulating domain-specific electricity day-ahead market settlement models and Gate Closure cutoff logic.
  - Generating initial boilerplate schemas, TypeScript interfaces, and REST API route structure.
  - Drafting comprehensive presentation scripts tailored for energy utility executives.
  - All mathematical metrics, Elexon BMRS streaming queries, data alignment algorithms, and unit tests were systematically executed, validated, and verified against actual January 2026 Elexon data.
