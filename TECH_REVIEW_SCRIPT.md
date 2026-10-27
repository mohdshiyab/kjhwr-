# Part 2: Technical Walkthrough & Architecture Review Script
**Target Duration:** 4 to 5 Minutes (Max 5 minutes)  
**Audience:** Internal Technical Lead, Engineering Reviewers, and Peer Architects  
**Goal:** Provide clear knowledge transfer on software architecture, domain modeling, data integrity (zero look-ahead bias), code patterns, testing verification, and containerization.

---

### [0:00 - 0:45] Architecture Overview & Tech Stack
**On-Screen:** Navigate to **"Tech Lead Review (Part 2 Demo)"** tab in the web portal.

> *"Hi everyone. In this second half of the review, I'm going to walk through the technical architecture, data engineering pipelines, mathematical modeling, test coverage, and key software engineering practices behind the platform.*
> 
> *Our design requirements called for React for the front-end, Python for the backend, and Docker for reproducible containerization.*
> 
> *To deliver production-grade performance, we selected:*
> *• **FastAPI** on the Python side, leveraging Pydantic v2 schemas for strict contract validation and NumPy for vectorized statistical calculations.*
> *• **React 18 with TypeScript and Vite** on the front-end, styled with Tailwind CSS and utilizing Recharts for responsive, GPU-accelerated financial charts.*
> *• A multi-stage **Dockerfile** that builds the production React bundle in Node 20 and packages it into a lightweight Python 3.11 container where FastAPI natively serves both the REST endpoints and the static SPA bundle.*
> *• Single-command orchestration with **Docker Compose**."*

---

### [0:45 - 2:00] Data Lineage & Elimination of Look-Ahead Bias
**On-Screen:** Scroll to the **"Market Integrity: Look-Ahead Bias Prevention"** section in the Tech Lead view.

> *"Let’s talk about data engineering and how we handled the Elexon BMRS streaming feeds.*
> 
> *We stream from two official Elexon endpoints:*
> 1. `FUELHH/stream` *for actual half-hourly generation, filtered on `fuelType == 'WIND'`.*
> 2. `WINDFOR/stream` *for rolling multi-horizon wind forecasts.*
> 
> *Now, the most critical domain hazard in energy analytics is **look-ahead bias (data leakage)**.*
> *In the UK market, day-ahead auction bids for delivery day D must be submitted before gate closure on Day D-1—typically 11:00 AM for the EPEX SPOT auction or 12:00 PM for Nord Pool.*
> 
> *Because Elexon publishes forecasts continuously every 30 to 60 minutes throughout D-1 and during day D, a naive query of 'latest forecast' would retrieve an intraday forecast published after the auction closed!*
> 
> *To guarantee zero data leakage, our matching engine in `data_processor.py` implements strict temporal filtering:*
> *For every target delivery hour on Day D, we calculate the exact cut-off timestamp: `D-1 at 11:00:00Z`.*
> *We filter the candidate forecasts to only those where `publishTime <= cutoff_time`, and select the maximum `publishTime` within that valid subset.*
> *This guarantees that our historical error metrics reflect the exact information state available to traders at the decision moment."*

---

### [2:00 - 3:00] Mathematical Rigor & Metric Formulation
**On-Screen:** Point to the **"Why WAPE Over Naive MAPE?"** callout and statistical formulas.

> *"Next, let's look at the mathematical formulations in `metrics_service.py`.*
> 
> *We compute six key statistical indicators:*
> *1. **MAE (Mean Absolute Error):** \(\frac{1}{N} \sum |F_i - A_i|\), which measures average magnitude in megawatts.*
> *2. **RMSE (Root Mean Square Error):** \(\sqrt{\frac{1}{N} \sum (F_i - A_i)^2}\), which heavily penalizes extreme forecasting errors during sudden meteorological front transitions.*
> *3. **Systematic Bias:** \(\frac{1}{N} \sum (F_i - A_i)\), which revealed the +1,840 MW persistent over-prediction.*
> *4. **Error Quantiles (P10, P50, P90):** Computed via NumPy percentiles to establish value-at-risk safety margins for thermal dispatch.*
> 
> *Crucially, we avoided naive MAPE (Mean Absolute Percentage Error).*
> *In renewable power, wind output frequently drops near zero during atmospheric high-pressure events. Dividing by an actual generation of 50 MW causes naive MAPE to explode into thousands of percent.*
> *Instead, we implemented **Weighted Absolute Percentage Error (WAPE)**, defined as the sum of absolute errors divided by total actual energy delivered. This metric is numerically stable, mathematically bounded, and standard in wholesale power markets."*

---

### [3:00 - 3:45] Code Tour & Test Verification
**On-Screen:** Scroll down to the **"Codebase Layout & Verification Test Suite"** section.

> *"Turning to code organization and testing:*
> 
> *The repository is cleanly partitioned into `backend/` and `frontend/`:*
> *• In `backend/app/routers/`, we have five decoupled routers: `summary.py`, `forecasts.py`, `metrics.py`, `procurement.py`, and `sensitivity.py`.*
> *• In `backend/app/services/`, business logic is strictly separated from HTTP handlers, making the statistical routines completely deterministic and easy to unit test.*
> 
> *We have an automated **Pytest** test suite with 9 passing tests covering:*
> *• Mathematical precision against synthetic corner cases (perfect forecasts, known errors, zero division).*
> *• Histogram probability density binning.*
> *• Contract validation for all FastAPI endpoints.*
> 
> *Because we pre-computed and indexed the 744 hours of January 2026 into SQLite and structured JSON in `backend/app/data/`, the entire API responds with sub-5 millisecond latency and has zero runtime external network dependencies."*

---

### [3:45 - 4:30] Containerization, Deployment & Wrap-Up
**On-Screen:** Show the Docker Compose section and terminal command.

> *"Finally, containerization and deployment.*
> 
> *Our multi-stage `Dockerfile` is optimized for production:*
> *Stage 1 builds the TypeScript assets and compiles minified CSS and JS with Rollup.*
> *Stage 2 pulls a clean Python 3.11 slim image, installs pinned dependencies from `requirements.txt`, copies the compiled frontend into `frontend/dist`, and binds FastAPI to serve both the REST API and the SPA.*
> 
> *To run locally:*
> ```bash
> docker compose up --build
> ```
> *The entire application boots on port 8000 in under 30 seconds.*
> *It is also cloud-ready and deployable directly to Heroku, Render, or Vercel.*
> 
> *All code is documented in the README with clear file trees, startup guides, and explicit disclosure of AI tool usage.*
> 
> *That concludes our technical walkthrough. Thank you, and I look forward to your review comments and feedback."*
