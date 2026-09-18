"""
NIVARA — Model Maturity Pydantic Schemas
Response models wrapping XGBoost, Bayesian, HRI, and RPI outputs with Model Maturity Index (MMI) metadata.
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

MaturityMode = Literal["shadow", "assisted", "autonomous"]

class MaturityMetadata(BaseModel):
    maturity_index: float = Field(..., ge=0.0, le=100.0, description="Model Maturity Index score between 0 and 100")
    maturity_mode: MaturityMode = Field(..., description="Operating trust mode: shadow | assisted | autonomous")
    last_backtest_date: Optional[str] = Field(default=None, description="ISO timestamp of last rolling backtest")
    requires_manual_review: bool = Field(default=False, description="Flag indicating human review required if shadow mode")

class ModelMaturityDetailResponse(BaseModel):
    model_name: str = Field(..., description="Name of the evaluated model component (xgboost, bayesian, hri, rpi)")
    maturity_index: float = Field(..., ge=0.0, le=100.0)
    maturity_mode: MaturityMode
    last_backtest_date: Optional[str] = None
    sample_size: int
    backtest_accuracy: float
    uncertainty_width: float
    requires_manual_review: bool

class XGBoostRiskResponse(BaseModel):
    predicted_class: str = Field(..., description="Predicted landslide/hazard risk category")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    features_used: Optional[List[str]] = None
    maturity_index: float = Field(..., ge=0.0, le=100.0)
    maturity_mode: MaturityMode

class BayesianPosteriorResponse(BaseModel):
    location: str
    prior_probability: float = Field(..., ge=0.0, le=1.0)
    posterior_probability: float = Field(..., ge=0.0, le=1.0)
    credible_interval_lower: float = Field(..., ge=0.0, le=1.0)
    credible_interval_upper: float = Field(..., ge=0.0, le=1.0)
    uncertainty_width: float = Field(..., ge=0.0, le=1.0)
    maturity_index: float = Field(..., ge=0.0, le=100.0)
    maturity_mode: MaturityMode

class HRIResponse(BaseModel):
    location: str
    static_hri: float = Field(..., ge=0.0, le=100.0)
    dynamic_hri: float = Field(..., ge=0.0, le=100.0)
    rainfall_24h_mm: float
    risk_level: str
    maturity_index: float = Field(..., ge=0.0, le=100.0)
    maturity_mode: MaturityMode

class RPIResponse(BaseModel):
    parcel_id: Optional[str] = None
    village: str
    base_rpi: float = Field(..., ge=0.0, le=100.0)
    adjusted_rpi: float = Field(..., ge=0.0, le=100.0)
    relocation_urgency: str
    is_downstream_corridor: bool = False
    maturity_index: float = Field(..., ge=0.0, le=100.0)
    maturity_mode: MaturityMode

class UnifiedRiskMaturityResponse(BaseModel):
    location: str
    hri: float
    rpi: float
    bayesian_probability: float
    xgboost_risk_class: str
    maturity_index: float = Field(..., ge=0.0, le=100.0)
    maturity_mode: MaturityMode
    requires_manual_review: bool
