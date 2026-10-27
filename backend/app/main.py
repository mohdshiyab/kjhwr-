import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.api import health, decision_dates, decisions, analytics
from app.routers import summary, forecasts, metrics, sensitivity

app = FastAPI(
    title="WindLens — Day-Ahead Wind Forecast Intelligence Platform",
    description="""
    Purpose-built intelligence platform for UK electricity day-ahead purchasing teams.
    Reconstructs exact historical decision snapshots, validates forecast vintages at gate closure,
    and quantifies forecast accuracy vs Elexon BMRS actuals for January 2026 decisions.
    """,
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register WindLens Core Endpoints
app.include_router(health.router, prefix="/api")
app.include_router(decision_dates.router, prefix="/api")
app.include_router(decisions.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

# Complementary routes
app.include_router(summary.router)
app.include_router(forecasts.router)
app.include_router(metrics.router)
app.include_router(sensitivity.router)

# Health endpoint at root
@app.get("/health", tags=["Health"])
def root_health():
    return {
        "status": "healthy",
        "product": "WindLens",
        "version": "1.0.0"
    }

# Static Frontend Mounting for unified Docker / Heroku deployment
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "product": "WindLens",
            "docs": "/docs",
            "health": "/api/health",
            "decision_dates": "/api/decision-dates",
            "sample_decision": "/api/decisions/2026-01-14",
            "analytics_summary": "/api/analytics/summary",
            "data_quality": "/api/data-quality"
        }
