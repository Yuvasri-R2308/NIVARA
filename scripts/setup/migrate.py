import os
import shutil

ROOT = r"c:\Users\yuvasri\OneDrive\Desktop\SIH PRG DATASET\Wayanad_FINAL_PROJECT_DATASET_PACKAGE_UPDATED\NIVRA UPDATED PROJECT"
FRONTEND = os.path.join(ROOT, "frontend")
SRC = os.path.join(ROOT, "src")
DATA = os.path.join(ROOT, "data")
PUBLIC = os.path.join(ROOT, "public")
MODELS = os.path.join(ROOT, "models")
SCRIPTS = os.path.join(ROOT, "scripts")

def copy_tree(src, dst):
    if not os.path.exists(dst):
        os.makedirs(dst, exist_ok=True)
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)

# 1. Datasets
print("Populating datasets/...")
copy_tree(os.path.join(DATA, "raw"), os.path.join(ROOT, "datasets", "raw"))
copy_tree(os.path.join(DATA, "processed"), os.path.join(ROOT, "datasets", "processed"))
shutil.copy2(os.path.join(PUBLIC, "data.json"), os.path.join(ROOT, "datasets", "processed", "data.json"))
shutil.copy2(os.path.join(PUBLIC, "cadastral_parcels.geojson"), os.path.join(ROOT, "datasets", "gis", "cadastral_parcels.geojson"))

# Specific domain dataset copies
for f in os.listdir(os.path.join(DATA, "raw")):
    full = os.path.join(DATA, "raw", f)
    if "Rainfall" in f or "open-meteo" in f:
        shutil.copy2(full, os.path.join(ROOT, "datasets", "rainfall", f))
    if "Population" in f:
        shutil.copy2(full, os.path.join(ROOT, "datasets", "population", f))
    if "DEM" in f:
        shutil.copy2(full, os.path.join(ROOT, "datasets", "elevation", f))
        shutil.copy2(full, os.path.join(ROOT, "datasets", "soil", f))

# 2. GIS
print("Populating gis/...")
shutil.copy2(os.path.join(DATA, "raw", "11_Official_Boundary_Targets.csv"), os.path.join(ROOT, "gis", "boundaries", "11_Official_Boundary_Targets.csv"))
shutil.copy2(os.path.join(DATA, "raw", "07_Cadastral_Prototype.geojson"), os.path.join(ROOT, "gis", "geojson", "07_Cadastral_Prototype.geojson"))
shutil.copy2(os.path.join(PUBLIC, "cadastral_parcels.geojson"), os.path.join(ROOT, "gis", "geojson", "cadastral_parcels.geojson"))

# 3. ML
print("Populating ml/...")
shutil.copy2(os.path.join(MODELS, "xgboost_risk_model.py"), os.path.join(ROOT, "ml", "training", "train_xgboost.py"))
shutil.copy2(os.path.join(MODELS, "bayesian_risk_model.py"), os.path.join(ROOT, "ml", "prediction", "bayesian_risk_inference.py"))
copy_tree(os.path.join(DATA, "processed"), os.path.join(ROOT, "ml", "models"))

# 4. Scripts
print("Populating scripts/...")
shutil.copy2(os.path.join(SCRIPTS, "build_data.py"), os.path.join(ROOT, "scripts", "data", "build_data.py"))

# 5. Frontend configs & public
print("Populating frontend/...")
copy_tree(PUBLIC, os.path.join(FRONTEND, "public"))
for cfg in ["index.html", "package.json", "tsconfig.json", "vite.config.ts", "tailwind.config.js", "postcss.config.js"]:
    shutil.copy2(os.path.join(ROOT, cfg), os.path.join(FRONTEND, cfg))

# Frontend core src
for root_f in ["index.css", "main.tsx", "App.tsx", "types.ts"]:
    shutil.copy2(os.path.join(SRC, root_f), os.path.join(FRONTEND, "src", root_f))
shutil.copy2(os.path.join(SRC, "types.ts"), os.path.join(FRONTEND, "src", "types", "index.ts"))

# Frontend directories
copy_tree(os.path.join(SRC, "context"), os.path.join(FRONTEND, "src", "context"))
copy_tree(os.path.join(SRC, "services"), os.path.join(FRONTEND, "src", "services"))
copy_tree(os.path.join(SRC, "utils"), os.path.join(FRONTEND, "src", "utils"))
copy_tree(os.path.join(SRC, "data"), os.path.join(FRONTEND, "src", "data"))

# Components mapping
common_components = [
    "Header.tsx", "Sidebar.tsx", "Footer.tsx", "StatCard.tsx", "RiskBadge.tsx", 
    "DataConfidenceTag.tsx", "LoadingSkeleton.tsx", "ErrorState.tsx", "Chatbot.tsx"
]
for c in common_components:
    shutil.copy2(os.path.join(SRC, "components", c), os.path.join(FRONTEND, "src", "components", "common", c))

shutil.copy2(os.path.join(SRC, "components", "MapComponent.tsx"), os.path.join(FRONTEND, "src", "components", "map", "MapComponent.tsx"))
shutil.copy2(os.path.join(SRC, "components", "GlobalSearchDropdown.tsx"), os.path.join(FRONTEND, "src", "components", "search", "GlobalSearchDropdown.tsx"))
shutil.copy2(os.path.join(SRC, "components", "DetailedAnalysisModal.tsx"), os.path.join(FRONTEND, "src", "components", "modals", "DetailedAnalysisModal.tsx"))
shutil.copy2(os.path.join(SRC, "components", "EvidenceModal.tsx"), os.path.join(FRONTEND, "src", "components", "modals", "EvidenceModal.tsx"))
shutil.copy2(os.path.join(SRC, "components", "FactorBreakdown.tsx"), os.path.join(FRONTEND, "src", "components", "risk", "FactorBreakdown.tsx"))

copy_tree(os.path.join(SRC, "components", "capacity"), os.path.join(FRONTEND, "src", "components", "capacity"))
copy_tree(os.path.join(SRC, "components", "geotechnical"), os.path.join(FRONTEND, "src", "components", "geotechnical"))

# Pages
copy_tree(os.path.join(SRC, "views"), os.path.join(FRONTEND, "src", "pages"))

print("Migration completed successfully!")
