from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MetricPill(BaseModel):
    label: str
    value: str
    color: Optional[str] = "#4ADE9A"

class RouteBlueprint(BaseModel):
    from_loc: str = Field(alias="from")
    to_loc: str = Field(alias="to")
    distance: str
    normal_time: str
    emergency_time: str
    safe_route_name: str
    hazard_to_avoid: str
    clearance_status: str = "SAFE"

    class Config:
        populate_by_name = True

class ActionButton(BaseModel):
    label: str
    view: Optional[str] = None
    village: Optional[str] = None

class MessageItem(BaseModel):
    id: Optional[str] = None
    role: str = "user"  # "user" | "assistant" | "system"
    content: str
    timestamp: Optional[str] = None
    metrics: Optional[List[MetricPill]] = None
    action_button: Optional[ActionButton] = None
    route_info: Optional[RouteBlueprint] = None

class FileEvidenceItem(BaseModel):
    file_name: str
    file_type: str
    file_size_bytes: int
    extracted_summary: str
    data_preview: Optional[str] = None
    is_image: bool = False
    is_pdf: bool = False
    is_tabular: bool = False
    image_base64: Optional[str] = None  # Base64 for multimodal inline image analysis

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: List[MessageItem] = Field(default_factory=list)
    language: Optional[str] = "auto"
    selected_village: Optional[str] = "ALL"
    selected_parcel_id: Optional[str] = None
    selected_site_id: Optional[str] = None
    active_view: Optional[str] = "sdma-command"
    selected_hazard: Optional[str] = None
    rainfall_multiplier: Optional[float] = 1.0
    live_weather: Optional[Dict[str, Any]] = None
    files_evidence: Optional[List[FileEvidenceItem]] = Field(default_factory=list)

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    language: str
    safety_status: Optional[str] = None  # "CRITICAL" | "HIGH" | "MODERATE" | "LOW"
    metrics: List[MetricPill] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)
    action_button: Optional[ActionButton] = None
    route_info: Optional[RouteBlueprint] = None
    is_fallback: bool = False
    model_used: str = "gemini-2.5-flash"
    disclaimer: str = "NIVARA Assessment Prototype (SIH26191) — Ground verification required for emergency field deployment."

class FileAnalysisResponse(BaseModel):
    file_name: str
    file_type: str
    file_size_bytes: int
    is_valid: bool
    summary: str
    detected_entities: List[str] = Field(default_factory=list)
    risk_indicators: List[str] = Field(default_factory=list)
    tabular_preview: Optional[str] = None
    data_points_count: Optional[int] = None
    recommendation: Optional[str] = None
