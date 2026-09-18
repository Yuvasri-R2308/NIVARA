import sys
from pathlib import Path

# Ensure project root (containing 'backend') is always in sys.path regardless of execution directory
_file_path = Path(__file__).resolve()
_project_root = str(_file_path.parent.parent.parent)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)
_backend_root = str(_file_path.parent.parent)
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .routes.copilot_routes import router as copilot_router
from .routes.v2_routes import router as v2_router
from .routes.emergency_routes import router as emergency_router
from .routes.hazard_routes import get_cadastral_hazard_overview
from backend.schemas.maturity_schemas import ModelMaturityDetailResponse
from backend.models.maturity_engine import evaluate_model_component

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NIVARA 2.0 Multi-Hazard Risk Intelligence, Micro-Catchment Hydrology & Decision Support System"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(copilot_router, prefix=settings.API_V1_STR)
app.include_router(v2_router, prefix=settings.API_V2_STR)
app.include_router(emergency_router)

# Register Verified Multi-Hazard Pipeline Routers
try:
    from modules.landslide.api import router as landslide_router
    from modules.flood.api import router as flood_router
    from modules.coastal.api import router as coastal_router
    from modules.cloudburst.api import router as cloudburst_router

    app.include_router(landslide_router, prefix="/api/landslide")
    app.include_router(flood_router, prefix="/api/flood")
    app.include_router(coastal_router, prefix="/api/coastal")
    app.include_router(cloudburst_router, prefix="/api/cloudburst")
except Exception as _router_err:
    import logging
    logging.getLogger("uvicorn").error(f"Failed to mount multi-hazard routers: {_router_err}")


@app.get("/")
def root_endpoint():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
        "api_v2": settings.API_V2_STR,
        "copilot_status": "ACTIVE",
        "demo_mode": settings.DEMO_MODE
    }

@app.get(f"{settings.API_V1_STR}/hazard/overview")
def hazard_overview_endpoint():
    return get_cadastral_hazard_overview()

@app.get("/api/catchments")
def get_catchments_endpoint():
    """
    Returns the DEM-derived micro-catchment GeoJSON cached in backend/data/catchments.geojson.
    """
    from backend.models.catchment_engine import get_cached_catchments_geojson
    return get_cached_catchments_geojson()

@app.get("/api/catchments/{catchment_id}")
def get_catchment_detail_endpoint(catchment_id: str):
    """
    Returns specific micro-catchment feature by catchment_id.
    """
    from fastapi import HTTPException
    from backend.models.catchment_engine import get_cached_catchments_geojson
    data = get_cached_catchments_geojson()
    for feat in data.get("features", []):
        if feat.get("properties", {}).get("catchment_id", "").upper() == catchment_id.upper():
            return feat
    raise HTTPException(status_code=404, detail=f"Catchment {catchment_id} not found.")

@app.get("/api/maturity/{model_name}", response_model=ModelMaturityDetailResponse)
def get_model_maturity_endpoint(model_name: str):
    """
    Returns MMI, mode, and last backtest date for model components:
    xgboost, bayesian, hri, rpi.
    """
    try:
        return evaluate_model_component(model_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
