import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env from backend or root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent

# Load environment variables from root and backend .env files
if (ROOT_DIR / ".env").exists():
    load_dotenv(ROOT_DIR / ".env", override=False)
if (BASE_DIR / ".env").exists():
    load_dotenv(BASE_DIR / ".env", override=True)
if (ROOT_DIR / ".env").exists():
    load_dotenv(ROOT_DIR / ".env", override=False)

class Settings:
    BASE_DIR: Path = BASE_DIR
    ROOT_DIR: Path = ROOT_DIR
    PROJECT_NAME: str = "NIVARA 2.0 Multi-Hazard Intelligence & Decision Support Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    API_V2_STR: str = "/api/v2"
    
    # Gemini Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    NIVARA_ENV: str = os.getenv("NIVARA_ENV", "development")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    # CORS Origins
    _raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173")
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]
    
    # Telemetry / Weather Station (Chembra Peak station)
    OPEN_METEO_API_URL: str = "https://api.open-meteo.com/v1/forecast"
    LATITUDE: float = 11.49
    LONGITUDE: float = 76.11
    ELEVATION_M: float = 1627.0
    
    # Paths to Datasets
    DATASETS_DIR: Path = ROOT_DIR / "datasets"
    RAW_DATA_PATH: Path = DATASETS_DIR / "raw"
    PROCESSED_DATA_PATH: Path = DATASETS_DIR / "processed" / "data.json"
    BAYESIAN_DATA_PATH: Path = DATASETS_DIR / "processed" / "bayesian_risk.json"
    XGBOOST_DATA_PATH: Path = DATASETS_DIR / "processed" / "xgboost_hazard_results.json"
    PUBLIC_DATA_PATH: Path = ROOT_DIR / "frontend" / "public" / "data.json"
    
    DEM_SLOPE_CSV: Path = RAW_DATA_PATH / "01_DEM_Slope.csv"
    DEM_SUMMARY_CSV: Path = RAW_DATA_PATH / "02_DEM_Slope_Summary.csv"
    IMD_OBSERVATIONS_CSV: Path = RAW_DATA_PATH / "03_IMD_2024_Rainfall_Observations.csv"
    IMD_SUMMARY_CSV: Path = RAW_DATA_PATH / "04_IMD_2024_Rainfall_Summary.csv"
    FOUR_AREAS_RAINFALL_CSV: Path = RAW_DATA_PATH / "05_Four_Areas_Rainfall.csv"
    CADASTRAL_CSV: Path = RAW_DATA_PATH / "06_Cadastral_Prototype.csv"
    CADASTRAL_GEOJSON: Path = RAW_DATA_PATH / "07_Cadastral_Prototype.geojson"
    POPULATION_CSV: Path = RAW_DATA_PATH / "09_Population_Census2011.csv"
    POPULATION_CORRECTED_CSV: Path = RAW_DATA_PATH / "10_Population_CORRECTED_Census2011.csv"
    
    # NIVARA 2.0 Hydrology & Modeling Parameters
    API_DECAY_FACTOR: float = float(os.getenv("API_DECAY_FACTOR", "0.85"))  # k parameter (0.85 - 0.90)
    DYNAMIC_HRI_API_WEIGHT: float = float(os.getenv("DYNAMIC_HRI_API_WEIGHT", "0.25"))
    DYNAMIC_HRI_PORE_PRESSURE_WEIGHT: float = float(os.getenv("DYNAMIC_HRI_PORE_PRESSURE_WEIGHT", "0.15"))
    LOCAL_EXTREME_MULTIPLIER: float = float(os.getenv("LOCAL_EXTREME_MULTIPLIER", "2.0"))
    
    # Model Maturity Index (MMI) Thresholds
    MMI_SHADOW_THRESHOLD: float = float(os.getenv("MMI_SHADOW_THRESHOLD", "40.0"))
    MMI_ASSISTED_THRESHOLD: float = float(os.getenv("MMI_ASSISTED_THRESHOLD", "75.0"))
    
    # Alert & Escalation Parameters
    ALERT_MODE: str = os.getenv("ALERT_MODE", "DEMO")  # "DEMO" or "PRODUCTION"
    ALERT_ACK_TIMEOUT_MINUTES: int = int(os.getenv("ALERT_ACK_TIMEOUT_MINUTES", "15"))
    MAX_CALL_ATTEMPTS: int = int(os.getenv("MAX_CALL_ATTEMPTS", "2"))
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "mock")

    # Voice Calling & Telephony Adapter Configuration
    VOICE_CALL_MODE: str = os.getenv("VOICE_CALL_MODE", "demo").lower()  # "demo" or "real"
    VOICE_PROVIDER: str = os.getenv("VOICE_PROVIDER", "twilio").lower()
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    WEBHOOK_BASE_URL: str = os.getenv("WEBHOOK_BASE_URL", "")
    TWIML_URL: str = os.getenv("TWIML_URL", "https://handler.twilio.com/twiml/EH6abd15072d4a1a20c083b0bfcf81e79f")

settings = Settings()
