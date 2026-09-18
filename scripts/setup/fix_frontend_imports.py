import os
import re

FRONTEND_SRC = r"c:\Users\yuvasri\OneDrive\Desktop\SIH PRG DATASET\Wayanad_FINAL_PROJECT_DATASET_PACKAGE_UPDATED\NIVRA UPDATED PROJECT\frontend\src"

# 1. Header.tsx
header_path = os.path.join(FRONTEND_SRC, "components", "common", "Header.tsx")
if os.path.exists(header_path):
    with open(header_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("from '../context/AppContext'", "from '../../context/AppContext'")
    content = content.replace("from './GlobalSearchDropdown'", "from '../search/GlobalSearchDropdown'")
    with open(header_path, "w", encoding="utf-8") as f:
        f.write(content)

# 2. Sidebar.tsx
sidebar_path = os.path.join(FRONTEND_SRC, "components", "common", "Sidebar.tsx")
if os.path.exists(sidebar_path):
    with open(sidebar_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("from '../context/AppContext'", "from '../../context/AppContext'")
    content = content.replace("from '../types'", "from '../../types'")
    with open(sidebar_path, "w", encoding="utf-8") as f:
        f.write(content)

# 3. Chatbot.tsx
chatbot_path = os.path.join(FRONTEND_SRC, "components", "common", "Chatbot.tsx")
if os.path.exists(chatbot_path):
    with open(chatbot_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("from '../context/AppContext'", "from '../../context/AppContext'")
    content = content.replace("from '../data/areaHazardProfiles'", "from '../../data/areaHazardProfiles'")
    content = content.replace("from '../data/siteCapacityRegistry'", "from '../../data/siteCapacityRegistry'")
    content = content.replace("from '../utils/capacityCalculator'", "from '../../utils/capacityCalculator'")
    with open(chatbot_path, "w", encoding="utf-8") as f:
        f.write(content)

# 4. GlobalSearchDropdown.tsx
search_path = os.path.join(FRONTEND_SRC, "components", "search", "GlobalSearchDropdown.tsx")
if os.path.exists(search_path):
    with open(search_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("from '../context/AppContext'", "from '../../context/AppContext'")
    content = content.replace("from '../data/areaHazardProfiles'", "from '../../data/areaHazardProfiles'")
    content = content.replace("from './DetailedAnalysisModal'", "from '../modals/DetailedAnalysisModal'")
    with open(search_path, "w", encoding="utf-8") as f:
        f.write(content)

# 5. DetailedAnalysisModal.tsx
modal_path = os.path.join(FRONTEND_SRC, "components", "modals", "DetailedAnalysisModal.tsx")
if os.path.exists(modal_path):
    with open(modal_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("from './RiskBadge'", "from '../common/RiskBadge'")
    content = content.replace("from './DataConfidenceTag'", "from '../common/DataConfidenceTag'")
    content = content.replace("from './FactorBreakdown'", "from '../risk/FactorBreakdown'")
    content = content.replace("from './geotechnical/SoilMoistureAnalysisHub'", "from '../geotechnical/SoilMoistureAnalysisHub'")
    content = content.replace("from '../utils/capacityCalculator'", "from '../../utils/capacityCalculator'")
    content = content.replace("from '../data/siteCapacityRegistry'", "from '../../data/siteCapacityRegistry'")
    with open(modal_path, "w", encoding="utf-8") as f:
        f.write(content)

# 6. EvidenceModal.tsx
evidence_path = os.path.join(FRONTEND_SRC, "components", "modals", "EvidenceModal.tsx")
if os.path.exists(evidence_path):
    with open(evidence_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("from '../context/AppContext'", "from '../../context/AppContext'")
    with open(evidence_path, "w", encoding="utf-8") as f:
        f.write(content)

# 7. MapComponent.tsx
map_path = os.path.join(FRONTEND_SRC, "components", "map", "MapComponent.tsx")
if os.path.exists(map_path):
    with open(map_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("from '../context/AppContext'", "from '../../context/AppContext'")
    content = content.replace("from '../data/areaHazardProfiles'", "from '../../data/areaHazardProfiles'")
    content = content.replace("from './DetailedAnalysisModal'", "from '../modals/DetailedAnalysisModal'")
    content = content.replace("from './RiskBadge'", "from '../common/RiskBadge'")
    content = content.replace("from './DataConfidenceTag'", "from '../common/DataConfidenceTag'")
    content = content.replace("from './FactorBreakdown'", "from '../risk/FactorBreakdown'")
    with open(map_path, "w", encoding="utf-8") as f:
        f.write(content)

# 8. Capacity components
capacity_dir = os.path.join(FRONTEND_SRC, "components", "capacity")
if os.path.exists(capacity_dir):
    for cf in os.listdir(capacity_dir):
        cfp = os.path.join(capacity_dir, cf)
        if cf.endswith(".tsx"):
            with open(cfp, "r", encoding="utf-8") as f:
                c = f.read()
            c = c.replace("from '../../types'", "from '../../../types'")
            c = c.replace("from '../types'", "from '../../types'")
            c = c.replace("from '../utils/capacityCalculator'", "from '../../utils/capacityCalculator'")
            c = c.replace("from '../data/siteCapacityRegistry'", "from '../../data/siteCapacityRegistry'")
            with open(cfp, "w", encoding="utf-8") as f:
                f.write(c)

# 9. All pages in frontend/src/pages/
pages_dir = os.path.join(FRONTEND_SRC, "pages")
if os.path.exists(pages_dir):
    for pf in os.listdir(pages_dir):
        pfp = os.path.join(pages_dir, pf)
        if pf.endswith(".tsx"):
            with open(pfp, "r", encoding="utf-8") as f:
                c = f.read()
            c = c.replace("from '../components/MapComponent'", "from '../components/map/MapComponent'")
            c = c.replace("from '../components/StatCard'", "from '../components/common/StatCard'")
            c = c.replace("from '../components/RiskBadge'", "from '../components/common/RiskBadge'")
            c = c.replace("from '../components/DataConfidenceTag'", "from '../components/common/DataConfidenceTag'")
            c = c.replace("from '../components/FactorBreakdown'", "from '../components/risk/FactorBreakdown'")
            c = c.replace("from '../components/DetailedAnalysisModal'", "from '../components/modals/DetailedAnalysisModal'")
            c = c.replace("from '../components/GlobalSearchDropdown'", "from '../components/search/GlobalSearchDropdown'")
            c = c.replace("from '../components/geotechnical/SoilMoistureAnalysisHub'", "from '../components/geotechnical/SoilMoistureAnalysisHub'")
            with open(pfp, "w", encoding="utf-8") as f:
                f.write(c)

print("All imports in frontend/src/ successfully updated!")
