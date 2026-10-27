import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.routers import summary, forecasts, metrics, procurement, sensitivity

app = FastAPI(
    title="UK Day-Ahead Power Procurement & Wind Forecast Analytics",
    description="""
    Interactive Web Application for UK Energy Utility Power Procurement Desks.
    Quantifies Elexon BMRS Wind Generation Forecasts (WINDFOR) vs Actuals (FUELHH)
    for January 2026 Day-Ahead Electricity Market Decisions.
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

# Register API Routers
app.include_router(summary.router)
app.include_router(forecasts.router)
app.include_router(metrics.router)
app.include_router(procurement.router)
app.include_router(sensitivity.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "market": "UK Day-Ahead Electricity (Elexon BMRS)",
        "scope": "January 2026 Procurement Decisions",
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
            "message": "UK Day-Ahead Power Procurement & Wind Forecast Analytics API",
            "docs": "/docs",
            "health": "/health",
            "summary": "/api/summary",
            "timeseries": "/api/forecasts/timeseries",
            "metrics": "/api/metrics",
            "procurement_simulate": "/api/procurement/simulate",
            "sensitivity": "/api/sensitivity/compare"
        }
