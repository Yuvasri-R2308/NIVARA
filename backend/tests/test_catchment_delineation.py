"""
Unit Test Suite for DEM-Derived Micro-Catchment Engine
======================================================
Tests D8 synthetic DEM delineation, IDW point-to-catchment rainfall assignment,
localized extreme anomaly detection, and FastAPI catchment endpoints.
"""

import os
import sys
import tempfile
import pytest
import numpy as np
import pandas as pd
import geopandas as gpd
from pathlib import Path
from shapely.geometry import Polygon, box

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.models.catchment_engine import (
    compute_d8_flow_direction,
    delineate_catchments,
    assign_rainfall_to_catchments,
    flag_localized_extreme,
    regenerate_catchments,
    get_cached_catchments_geojson
)
from backend.app.main import app

client = TestClient(app)

# =====================================================================
# 1. SYNTHETIC DEM DELINEATION TEST
# =====================================================================

def test_delineate_catchments_synthetic_dem():
    """
    Creates a synthetic 10x10 V-notch DEM elevation array with a defined drainage channel,
    writes it to a temporary GeoTIFF raster, and confirms delineate_catchments produces >= 1 polygon.
    """
    import rasterio
    from rasterio.transform import from_bounds

    # Create 10x10 V-notch elevation grid sloping towards the center bottom
    rows, cols = 10, 10
    dem = np.zeros((rows, cols), dtype=np.float32)
    for r in range(rows):
        for c in range(cols):
            # V-notch: higher on sides (c=0, c=9) and top (r=0), draining to center bottom (r=9, c=5)
            dem[r, c] = 500.0 + (10 - r) * 20.0 + abs(c - 5) * 30.0

    with tempfile.NamedTemporaryFile(suffix=".tif", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # Spatial bounds around Wayanad: [76.0, 11.5, 76.2, 11.7]
        transform = from_bounds(76.0, 11.5, 76.2, 11.7, cols, rows)
        with rasterio.open(
            tmp_path,
            'w',
            driver='GTiff',
            height=rows,
            width=cols,
            count=1,
            dtype=dem.dtype,
            crs='EPSG:4326',
            transform=transform
        ) as dst:
            dst.write(dem, 1)

        # Run catchment delineation on synthetic raster
        gdf = delineate_catchments(tmp_path, min_catchment_area_km2=0.5, max_catchment_area_km2=5.0)

        assert isinstance(gdf, gpd.GeoDataFrame)
        assert len(gdf) >= 1
        assert "catchment_id" in gdf.columns
        assert "geometry" in gdf.columns
        assert all(isinstance(geom, Polygon) for geom in gdf.geometry)

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_delineate_catchments_default_wayanad():
    """Confirms default Wayanad multi-catchment delineation produces 12 defined basins."""
    gdf = delineate_catchments()
    assert isinstance(gdf, gpd.GeoDataFrame)
    assert len(gdf) == 12
    assert "MC_MEPPADI_01" in gdf["catchment_id"].values
    assert "MC_ACHOOR_01" in gdf["catchment_id"].values
    assert "MC_KOTTATHARA_01" in gdf["catchment_id"].values


# =====================================================================
# 2. INVERSE-DISTANCE WEIGHTED (IDW) RAINFALL ASSIGNMENT TEST
# =====================================================================

def test_assign_rainfall_to_catchments_idw():
    """
    Tests assigning point rainfall readings to polygon catchments using
    inverse-distance weighting (IDW).
    """
    # Create two test catchment polygons
    poly1 = box(76.10, 11.50, 76.15, 11.55)
    poly2 = box(76.15, 11.50, 76.20, 11.55)

    catchments_gdf = gpd.GeoDataFrame([
        {"catchment_id": "TEST_C1", "rainfall_24h_mm": 100.0, "geometry": poly1},
        {"catchment_id": "TEST_C2", "rainfall_24h_mm": 100.0, "geometry": poly2}
    ], crs="EPSG:4326")

    # Point station 1 near C1 (76.125, 11.525) reading 250mm
    # Point station 2 near C2 (76.175, 11.525) reading 50mm
    rainfall_points = pd.DataFrame([
        {"station_id": "ST_01", "lat": 11.525, "lon": 76.125, "rainfall_mm": 250.0},
        {"station_id": "ST_02", "lat": 11.525, "lon": 76.175, "rainfall_mm": 50.0}
    ])

    assigned_df = assign_rainfall_to_catchments(catchments_gdf, rainfall_points)

    assert isinstance(assigned_df, pd.DataFrame)
    assert len(assigned_df) == 2
    assert "catchment_id" in assigned_df.columns
    assert "rainfall_mm" in assigned_df.columns

    c1_rain = assigned_df.loc[assigned_df["catchment_id"] == "TEST_C1", "rainfall_mm"].values[0]
    c2_rain = assigned_df.loc[assigned_df["catchment_id"] == "TEST_C2", "rainfall_mm"].values[0]

    # C1 is right next to ST_01 (250mm) -> should be close to 250mm
    # C2 is right next to ST_02 (50mm) -> should be close to 50mm
    assert c1_rain == pytest.approx(250.0, abs=1.0)
    assert c2_rain == pytest.approx(50.0, abs=1.0)


# =====================================================================
# 3. LOCALIZED EXTREME PRECIPITATION ANOMALY DETECTION TEST
# =====================================================================

def test_flag_localized_extreme():
    """
    Tests adding is_localized_extreme boolean flag when rainfall >= 2.0x regional average.
    """
    df = pd.DataFrame([
        {"catchment_id": "C1", "rainfall_mm": 100.0},
        {"catchment_id": "C2", "rainfall_mm": 110.0},
        {"catchment_id": "C3", "rainfall_mm": 90.0},
        {"catchment_id": "C4_EXTREME", "rainfall_mm": 350.0}  # Mean is ~162.5, 350 / 162.5 = 2.15x >= 2.0x
    ])

    flagged_df = flag_localized_extreme(df, threshold_multiplier=2.0)

    assert "is_localized_extreme" in flagged_df.columns
    assert "anomaly_ratio" in flagged_df.columns

    # C4_EXTREME should be flagged True
    c4_flag = flagged_df.loc[flagged_df["catchment_id"] == "C4_EXTREME", "is_localized_extreme"].values[0]
    assert c4_flag is True or c4_flag == 1

    # C1 should be flagged False
    c1_flag = flagged_df.loc[flagged_df["catchment_id"] == "C1", "is_localized_extreme"].values[0]
    assert c1_flag is False or c1_flag == 0


# =====================================================================
# 4. CACHING & FASTAPI ENDPOINTS TEST
# =====================================================================

def test_get_catchments_geojson_endpoint():
    """Tests GET /api/catchments returns GeoJSON with 12 micro-catchments."""
    response = client.get("/api/catchments")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 12

def test_get_single_catchment_endpoint():
    """Tests GET /api/catchments/MC_MEPPADI_01 returns Meppadi catchment."""
    response = client.get("/api/catchments/MC_MEPPADI_01")
    assert response.status_code == 200
    data = response.json()
    assert data["properties"]["catchment_id"] == "MC_MEPPADI_01"
    assert "Chembra" in data["properties"]["name"]

def test_get_single_catchment_not_found():
    """Tests GET /api/catchments/UNKNOWN returns 404."""
    response = client.get("/api/catchments/NONEXISTENT_CATCHMENT")
    assert response.status_code == 404

if __name__ == "__main__":
    pytest.main(["-v", __file__])
