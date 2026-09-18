from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from pydantic import BaseModel
import json

from ..schemas.copilot_schemas import ChatRequest, ChatResponse, FileAnalysisResponse, FileEvidenceItem
from ..services.gemini_service import gemini_service
from ..services.file_analyzer import file_analyzer
from ..services.risk_context_service import risk_context_service
from ..config.settings import settings

router = APIRouter(prefix="/copilot", tags=["NIVARA Disaster Copilot"])

class KeyUpdateRequest(BaseModel):
    api_key: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(request: ChatRequest):
    """Primary chat endpoint for conversational, GIS-aware, multilingual, and multimodal disaster decision support."""
    try:
        response = gemini_service.generate_chat_response(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot processing failure: {str(e)}")

@router.post("/set-key")
async def update_gemini_key(req: KeyUpdateRequest):
    """Dynamically configures or updates Gemini API Key at runtime."""
    try:
        gemini_service.set_api_key(req.api_key)
        is_valid = gemini_service._client is not None
        return {
            "status": "SUCCESS" if is_valid else "INVALID",
            "message": "Gemini API client initialized successfully" if is_valid else "Failed to initialize Gemini client with provided key",
            "active_model": gemini_service.model_name
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update API key: {str(e)}")

@router.post("/analyze-file", response_model=FileEvidenceItem)
async def analyze_uploaded_file(file: UploadFile = File(...)):
    """Extracts features, tables, summaries, or vision parts from uploaded images, PDFs, CSV, or Excel files."""
    try:
        content = await file.read()
        file_name = file.filename or "uploaded_file"
        mime = file.content_type or ""

        # Determine file type
        if mime.startswith("image/") or any(file_name.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            return file_analyzer.analyze_image_bytes(file_name, content, mime or "image/jpeg")
        elif mime == "application/pdf" or file_name.lower().endswith(".pdf"):
            return file_analyzer.analyze_pdf_bytes(file_name, content)
        elif any(file_name.lower().endswith(ext) for ext in [".xlsx", ".xls"]):
            return file_analyzer.analyze_tabular_bytes(file_name, content, is_excel=True)
        elif file_name.lower().endswith(".csv") or mime == "text/csv":
            return file_analyzer.analyze_tabular_bytes(file_name, content, is_excel=False)
        else:
            # Generic text fallback
            text_str = content.decode('utf-8', errors='ignore')
            return FileEvidenceItem(
                file_name=file_name,
                file_type=mime or "text/plain",
                file_size_bytes=len(content),
                extracted_summary=f"Text file: {file_name} ({len(text_str)} chars).",
                data_preview=text_str[:1000]
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File inspection failed: {str(e)}")

@router.get("/health")
async def copilot_health():
    """Returns Copilot subsystem health, active model, and dataset readiness."""
    has_api_key = bool(gemini_service._client is not None)
    metrics = risk_context_service.get_all_summary()
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_api_configured": has_api_key,
        "active_model": gemini_service.model_name,
        "dataset_summary": metrics
    }
