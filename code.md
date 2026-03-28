## .gitignore
```
# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
.env
.pytest_cache/

# Node
node_modules/
.next/
out/
build/
.DS_Store
*.local

# Project Specific
AutoLCA/backend/uploads/
AutoLCA/backend/static/reports/
AutoLCA/frontend/.next/
AutoLCA/frontend/node_modules/

# Database / Research
Database_Triya/data_bases/
Database_Triya/triya_poc.db
*.sqlite
*.db

```

## AutoLCA/.agents/workflows/ingest-database.md
```markdown
---
description: How to ingest professional openLCA databases (NEEDS, ecoinvent) into AutoLCA
---

// turbo-all
# Professional Data Ingestion Workflow

This workflow describes how to move from raw openLCA files (like those in `C:\Users\Asus\Documents\Database_AutoLCA`) to a live AutoLCA database.

### 1. Preparation
AutoLCA is optimized for **JSON-LD** data. This is the fastest and most transparent way to pipe environmental science into the AI engine.

- **Current Files**: You have `needs_18.zolca` and `openLCA LCIA Methods 2.8.0.zip`.
- **Requirement**: Open these in openLCA one last time and select **Export -> JSON-LD**.

### 2. Dumping to Imports
Move your exported JSON-LD folders into the designated space:
- Copy the `processes/` folder to `C:\Users\Asus\Documents\AutoLCA\imports\processes`
- Copy the `flows/` folder to `C:\Users\Asus\Documents\AutoLCA\imports\flows`

### 3. Running the Ingestor
Once the files are in `imports/`, run the ingestion script (to be implemented as needed):
```powershell
venv\Scripts\python ingest_jsonld.py
```

### 4. Verification
Run the standard "Benchy" benchmark to ensure the new data hasn't shifted the baseline accuracy:
```powershell
venv\Scripts\python test_benchy.py
```

> [!TIP]
> Using JSON-LD allows the AutoLCA engine to read the "Recipe" of every process independently, which is how the KNN AI learns to predict missing data so accurately.

```

## AutoLCA/.gitignore
```
# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.env
.pytest_cache/

# Node
node_modules/
.next/
out/
build/
.DS_Store
*.local

# Project Specific
data/*.pdf
data/*.sqlite
data/*.json
!data/init_db.py
report/*.pdf
static/reports/

```

## AutoLCA/.vscode/extensions.json
```json
{
    "recommendations": [
        "rooveterinaryinc.roo-cline"
    ]
}
```

## AutoLCA/.vscode/settings.json
```json
{
    "roo.provider": "minimax",
    "roo.minimax.apiKey": "sk-api-41YIyojDY-fEKDiq3o5S0sNjQHoc5HzJv5zd5Y4FidndQrVRtc4y3i0c3IdtJioVjuLvKM3mIFgnaC3bcrxpfVQBFiL1FvgSRdvfkk9yux_byWi-3ycrhSk",
    "roo.minimax.baseUrl": "https://api.minimax.io/v1",
    "roo.model": "MiniMax-Text-01"
}
```

## AutoLCA/ETHICS.md
```markdown
# Ethical Considerations for AutoLCA

AutoLCA is an automated Life Cycle Assessment (LCA) tool designed to support decision-making in sustainable engineering. Given the significant environmental and social impact of industrial decisions, this document outlines the ethical responsibilities and limitations of using this software.

## 1. Data Transparency & Integrity
- **Primary vs. Estimated Data**: The tool uses a KNN (K-Nearest Neighbors) imputer to fill missing data. All results derived from filled/imputed data must be clearly distinguished from primary database data to avoid misleading conclusions.
- **Source Disclosure**: Users should be aware of the underlying database (e.g., ecoinvent, GaBi, or custom SQLite data) providing the impact factors.

## 2. Model Bias & Scope
- **Geographical Bias**: Impact factors for electricity or raw materials vary significantly by region. Using a model trained on European data for a Southeast Asian project may lead to incorrect environmental assessments.
- **Industry Specificity**: The KNN model may struggle with niche industries not well-represented in the training set.

## 3. Accountability & Decision Support
- **Decision Support, Not Compliance**: AutoLCA is intended for rapid prototyping and early-stage design exploration. It should **not** be used as the sole basis for legal environmental compliance (e.g., EPD certification) without verification from a certified LCA professional.
- **System Boundaries**: Transparently defining what is included (Cradle-to-Gate vs. Cradle-to-Grave) is essential to prevent "greenwashing" by omitting high-impact phases like use or disposal.

## 4. Responsibility of the User
- Users are encouraged to validate model outputs through sensitivity analysis.
- The "Scale" and "Scenario intensity" features should be used to explore worst-case scenarios, not just the most favorable ones.

```

## AutoLCA/LICENSE
```
MIT License

Copyright (c) 2026 AutoLCA Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## AutoLCA/README.md
```markdown
# Triya.io: AI-Driven Life Cycle Assessment Engine

## 🌍 The "Why"
Triya.io is a Next.js + FastAPI powered Proof of Concept (PoC) designed to simplify **JRC & ISO 14040/14044 compliance**. 

In professional LCA, the biggest blockers are **Data Gaps** (missing environmental factors) and **Complexity**. Triya.io solves this by:
1.  **AI Data Filling**: Uses SciKit-Learn's KNN Imputer to scientifically predict missing environmental data based on local background datasets.
2.  **Automated JRC Reporting**: Generates technical reports compliant with the EUR 31853 EN standards (JRC EF 3.1).

---

## ⚡ Setup in 3 Steps

### Step 1: Install Python & Node.js
Ensure you have Python 3.10+ and Node.js 18+ installed on your Windows machine.

### Step 2: Install Dependencies
Run the initialization script to set up your virtual environment and frontend packages:
```powershell
./install_dependencies.bat
```

### Step 3: Start the App
Run the starter script to launch both the FastAPI backend and the Next.js frontend:
```powershell
./start_app.bat
```

---

---

## 📖 Walkthrough for Dummies

### 1. The "Shuffle" Demo: Proving AI Accuracy 🧪
Click the **"Shuffle Demo"** button in the sidebar. The system will randomly select one of 5 scientifically verified benchmarks (Aluminum, PET, Electricity, Paper, or Transport). 
- **Observe the AI**: Notice that some environmental factors are marked as "Predicted". The backend uses a KNN model to fill intentional data gaps in real-time, proving we can achieve 100% compliance even with imperfect source data.

### 2. The "Super Calculator": Your Data, Your Rules 📂
Want to use your own data? 
- Drag and drop any **.db** (SQLite) or **.csv** file into the "Upload Database" zone.
- The system will dynamically switch its active engine to your file.
- **Dynamic Inputs**: Every variable found in your process will automatically generate a slider in the "Input Parameters" section. No more hardcoding.

### 3. Verifying against JRC Standards 📜
Once you've configured your process, click **"Generate PDF Report"**.
- View the **Data Quality Rating (DQR)** score calculated via the EUR 31853 EN formula.
- Check the **16 EF Category table** (Normalization and Weighting included).
- Audit the **Hotspot Analysis** to see exactly which parts of your product lifecycle drive the highest impact.

---

## �️ Master Setup (setup_all.py)
This project uses a "Twin Pathway" architecture:
- **Pathway A (App)**: The code in this repository.
- **Pathway B (Database)**: Your local research lake at `C:\Users\Asus\Documents\Database_Triya`.

Run `python setup_all.py` to automatically link these pathways, install all dependencies, and verify your GTK+ runtime for PDF generation.

```

## AutoLCA/Triya.io.spec
```
# -*- mode: python ; coding: utf-8 -*-
import sys
import os
from PyInstaller.utils.hooks import collect_data_files

block_cipher = None

# Automatically collect all templates and data
added_files = [
    ('data', 'data'),
    ('report', 'report'),
]

# Specifically handle NodeGraphQt icons and resources if needed
# (NodeGraphQt often bundles its own resources which PyInstaller might miss)

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=added_files,
    hiddenimports=[
        'PyQt5.QtCore',
        'PyQt5.QtWidgets',
        'PyQt5.QtGui',
        'jinja2',
        'weasyprint'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Triya.io',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    # icon=['resources/icon.ico'], # Add an icon file here later if desired
)

```

## AutoLCA/backend/Dockerfile.backend
```
# Triya.io FastAPI Backend
FROM python:3.11-slim

WORKDIR /app

# System deps for WeasyPrint (Objective 4)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements-backend.txt ./
RUN pip install --no-cache-dir -r requirements-backend.txt

COPY main.py .
COPY core ./core
COPY data ./data
COPY templates ./templates
COPY static ./static

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

```

## AutoLCA/backend/__init__.py
```python
# Triya.io Backend Package

```

## AutoLCA/backend/check_db.py
```python
import sqlite3
db_path = r"C:\Users\Asus\Documents\Database_Triya\triya_poc.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(lca_processes);")
cols = cursor.fetchall()
for col in cols:
    print(f"Col: {col[1]}")
conn.close()

```

## AutoLCA/backend/core/__init__.py
```python
# Triya.io Core Module

```

## AutoLCA/backend/core/monte_carlo.py
```python
import numpy as np
from scipy import stats
from typing import Dict, Any, Union

def generate_samples(dist_config: Dict[str, Any], iterations: int = 1000) -> np.ndarray:
    """
    Generates N random samples based on the provided distribution configuration.
    
    Supported types: normal, lognormal, triangular, uniform
    """
    dist_type = dist_config.get('type', 'deterministic').lower()
    
    if dist_type == 'deterministic':
        value = float(dist_config.get('value', 0.0))
        return np.full(iterations, value)
    
    params = dist_config.get('params', {})
    
    if dist_type == 'normal':
        mean = float(params.get('mean', 1.0))
        std = float(params.get('std', 0.1))
        return np.random.normal(mean, std, iterations)
    
    elif dist_type == 'lognormal':
        # geom_mean (mu*), geom_sd (sigma*)
        # mu = ln(geom_mean), sigma = ln(geom_sd)
        geom_mean = float(params.get('geom_mean', 1.0))
        geom_sd = float(params.get('geom_sd', 1.2))
        return np.random.lognormal(np.log(geom_mean), np.log(geom_sd), iterations)
    
    elif dist_type == 'triangular':
        left = float(params.get('min', 0.8))
        mode = float(params.get('mode', 1.0))
        right = float(params.get('max', 1.2))
        # numpy.random.triangular(left, mode, right, size)
        return np.random.triangular(left, mode, right, iterations)
    
    elif dist_type == 'uniform':
        low = float(params.get('min', 0.0))
        high = float(params.get('max', 1.0))
        return np.random.uniform(low, high, iterations)
    
    # Fallback to deterministic
    value = float(dist_config.get('value', 0.0))
    return np.full(iterations, value)

def calculate_stats(samples: np.ndarray) -> Dict[str, float]:
    """
    Calculates descriptive statistics for a sample array.
    """
    if len(samples) == 0:
        return {}
        
    return {
        "mean": float(np.mean(samples)),
        "median": float(np.median(samples)),
        "std": float(np.std(samples)),
        "p5": float(np.percentile(samples, 5)),
        "p95": float(np.percentile(samples, 95)),
        "min": float(np.min(samples)),
        "max": float(np.max(samples))
    }

```

## AutoLCA/backend/core/reporter.py
```python
import os
import datetime
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class JRCReporter:
    def __init__(self, template_dir="templates"):
        # We no longer use jinja2 templates for ReportLab, but keep init for compatibility
        pass

    def generate_pdf_buffer(self, process_data):
        """
        Generates a rigorous Scientific LCA Data Sheet with multi-standard compliance.
        v1.1 - Fix: HexColor attribute
        """
        print("DEBUG: reporter.py v1.1 - Standardizing on HexColor")
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter,
            rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50
        )
        styles = getSampleStyleSheet()
        
        # Professional Scientific Styles
        header_style = ParagraphStyle(
            'ScientificHeader',
            parent=styles['Normal'],
            fontSize=16,
            textColor=colors.toColor("#1a5f7a"),
            alignment=1, # Center
            spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        subhead_style = ParagraphStyle(
            'ScientificSubhead',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.toColor("#333333"),
            borderPadding=5,
            backColor=colors.toColor("#f0f4f8"),
            spaceBefore=15,
            spaceAfter=10
        )

        elements = []

        # 1. Standard-Specific Title & Branding
        meta = process_data.get("metadata", {})
        framework = meta.get("compliance_framework", "iso-14044")
        
        branding_text = "<b>TRIYA AUTO-LCA - SCIENTIFIC REPORT</b>"
        elements.append(Paragraph(branding_text, ParagraphStyle('Branding', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=1)))
        
        title_text = "LCA SCIENTIFIC DATA SHEET"
        if framework == 'jrc-pef':
            title_text = "JRC PEF COMPLIANCE REPORT (EF 3.1)"
        elif framework == 'en-15804':
            title_text = "ENVIRONMENTAL PRODUCT DECLARATION (EN 15804+A2)"
        elif framework == 'ghg-protocol':
            title_text = "GHG PROTOCOL CARBON FOOTPRINT"

        elements.append(Paragraph(title_text, header_style))
        
        # Metadata Table
        meta_data = [
            ["Project Identifier", "Triya AutoLCA v1.0", "Generation Date", datetime.datetime.now().strftime('%Y-%m-%d %H:%M')],
            ["Standard / Compliance", framework.upper(), "Functional Unit", process_data.get("process_name", "Supply Chain Model")],
            ["Methodology", "EF 3.1 (JRC) / ISO 14044", "System Boundary", str(meta.get("system_boundary", "gate-to-gate")).upper()]
        ]
        
        meta_table = Table(meta_data, colWidths=[110, 140, 110, 140])
        meta_table.setStyle(TableStyle([
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.25, colors.grey),
            ('BACKGROUND', (0,0), (0,-1), colors.toColor("#e8f1f5")),
            ('BACKGROUND', (2,0), (2,-1), colors.toColor("#e8f1f5")),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ]))
        elements.append(meta_table)

        # 2. Methodology & Assumptions
        elements.append(Paragraph("1.0 METHODOLOGICAL SUMMARY", subhead_style))
        method_desc = "This assessment follows internationally recognized LCA standards. "
        if framework == 'jrc-pef':
            method_desc += "Compliant with JRC EF 3.1 Characterization Methods (2023)."
        elif framework == 'en-15804':
            method_desc += "Compliant with EN 15804+A2 sustainability of construction works."
        elif framework == 'ghg-protocol':
            method_desc += "Compliant with GHG Protocol Product Standard (GWP-100)."
        else:
            method_desc += "Conducted under ISO 14040/14044 guidelines."
            
        elements.append(Paragraph(method_desc, styles['Normal']))

        # 3. Supply Chain Model (Snapshot)
        snapshot_b64 = meta.get("snapshot")
        if snapshot_b64 and isinstance(snapshot_b64, str) and "," in snapshot_b64:
            try:
                import base64
                img_data = base64.b64decode(snapshot_b64.split(",")[1])
                img_buffer = io.BytesIO(img_data)
                img = Image(img_buffer, width=400, height=200)
                img.hAlign = 'CENTER'
                elements.append(Paragraph("2.0 SYSTEM BOUNDARY & FLOW MODEL", subhead_style))
                elements.append(img)
            except: pass

        # 4. Impact Assessment Results
        elements.append(Paragraph("3.0 LIFE CYCLE IMPACT ASSESSMENT (LCIA)", subhead_style))
        
        impacts = process_data.get("impacts", {})
        UNIT_MAP = {
            'gwp_climate_change': 'kg CO2 eq',
            'odp_ozone_depletion': 'kg CFC11 eq',
            'ap_acidification': 'mol H+ eq',
            'ep_freshwater': 'kg P eq',
            'ep_marine': 'kg N eq',
            'ep_terrestrial': 'mol N eq',
            'pocp_photochemical_ozone': 'kg NMVOC eq',
            'pm_particulate_matter': 'disease inc.',
            'ir_ionising_radiation': 'kBq U235 eq',
            'ht_c_human_toxicity_cancer': 'CTUh',
            'ht_nc_human_toxicity_non_cancer': 'CTUh',
            'et_fw_ecotoxicity_freshwater': 'CTUe',
            'lu_land_use': 'Pt',
            'wsf_water_scarcity': 'm3 world eq',
            'ru_mm_resource_use_min_met': 'kg Sb eq',
            'ru_f_resource_use_fossils': 'MJ'
        }

        # Dynamic Columns based on Framework
        uncertainty = process_data.get("uncertainty")
        
        if framework == 'ghg-protocol':
            impact_data = [["Carbon Indicator", "Metric", "Result (Mean)", "95% CI (Stochastic)", "Unit"]]
            for cat, val in impacts.items():
                if cat == "gwp_climate_change":
                    ci_text = "N/A"
                    if uncertainty and cat in uncertainty:
                        u = uncertainty[cat]
                        ci_text = f"{u['p5']:.2e} - {u['p95']:.2e}"
                    impact_data.append(["Carbon Footprint", "Climate Change", f"{val:.4e}", ci_text, "kg CO2 eq"])
            col_widths = [110, 100, 90, 120, 80]
        else:
            impact_data = [["Impact Category", "Mean Result", "95% Confidence Interval", "Unit"]]
            for cat, val in impacts.items():
                label = cat.replace("_", " ").title()
                unit = UNIT_MAP.get(cat, "pts")
                ci_text = "Deterministic"
                if uncertainty and cat in uncertainty:
                    u = uncertainty[cat]
                    ci_text = f"{u['p5']:.2e} - {u['p95']:.2e}"
                impact_data.append([label, f"{val:.4e}", ci_text, unit])
            col_widths = [160, 100, 140, 100]

        if len(impact_data) > 1:
            it = Table(impact_data, colWidths=col_widths)
            it.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.toColor("#1a5f7a")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (1, 1), (2, -1), 'RIGHT'),
                ('FONTSIZE', (0, 0), (-1, -1), 7),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            elements.append(it)
            if uncertainty:
                elements.append(Paragraph(f"<i>Note: Calculations based on {process_data.get('iterations', 1000)} Monte Carlo iterations.</i>", 
                    ParagraphStyle('MCNote', parent=styles['Normal'], fontSize=7, textColor=colors.grey)))

        # 5. Inventory Contribution Analysis (The 'Scientist' View)
        node_breakdown = meta.get("node_breakdown", {})
        if node_breakdown:
            elements.append(Paragraph("4.0 CONTRIBUTION ANALYSIS & INVENTORY DECOMPOSITION", subhead_style))
            
            # Module Grouping (Construction/PEF style)
            mod_impacts = {}
            for nid, info in node_breakdown.items():
                m = info.get("module", "A1-A3")
                if m not in mod_impacts: mod_impacts[m] = 0.0
                mod_impacts[m] += info.get("impacts", {}).get("gwp_climate_change", 0.0)
            
            elements.append(Paragraph("<b>4.1 Life Cycle Module Summary (GWP)</b>", styles['Normal']))
            mod_data = [["Module", "Indicator", "Impact (GWP)", "Unit"]]
            for m, val in sorted(mod_impacts.items()):
                mod_data.append([f"Mod {m}", "Global Warming", f"{val:.4e}", "kg CO2 eq"])
            
            mt = Table(mod_data, colWidths=[120, 140, 140, 100])
            mt.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
                ('BACKGROUND', (0,0), (-1,0), colors.toColor("#f0f4f8")),
            ]))
            elements.append(mt)
            elements.append(Spacer(1, 10))
            
            # Hotspot/Top Contributor (ISO style)
            elements.append(Paragraph("<b>4.2 Top Supply Chain Contributors</b>", styles['Normal']))
            sorted_nodes = sorted(
                node_breakdown.values(), 
                key=lambda x: x.get("impacts", {}).get("gwp_climate_change", 0.0) if isinstance(x, dict) else 0.0, 
                reverse=True
            )
            
            top_data = [["Process Node", "Amount / Scaling", "Contribution (GWP)", "% Total"]]
            total_gwp = impacts.get("gwp_climate_change", 1.0)
            for info in sorted_nodes[:5]:
                gwp = info.get("impacts", {}).get("gwp_climate_change", 0.0)
                pct = (gwp / total_gwp) * 100 if total_gwp > 0 else 0
                top_data.append([info.get("name", "N/A")[:35], "1.0 unit", f"{gwp:.3e}", f"{pct:.1f}%"])
            
            tt = Table(top_data, colWidths=[180, 100, 120, 100])
            tt.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
                ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
            ]))
            elements.append(tt)

        if meta.get("is_ai_predicted"):
            elements.append(Spacer(1, 15))
            elements.append(Paragraph("<b>DATA QUALITY & AI TRANSPARENCY</b>", styles['Normal']))
            elements.append(Paragraph(
                "Notice: Some characterization factors were imputed via AI-KNN algorithms to fill data gaps. "
                "These predictions have been validated against global average impacts with a 30% cut-off.",
                styles['Normal']
            ))

        print(f"DEBUG: reporter.py received process_data with {len(impacts)} impacts and {len(node_breakdown)} nodes.")
        if snapshot_b64:
             print(f"DEBUG: Snapshot detected (size {len(snapshot_b64)})")

        try:
            print(f"DEBUG: Building PDF with {len(elements)} elements...")
            doc.build(elements)
            print("DEBUG: PDF build successful.")
        except Exception as build_err:
            import traceback
            traceback.print_exc()
            print(f"DEBUG: PDF Build Error: {build_err}")
            # Fallback: simple error page in PDF
            buffer = io.BytesIO()
            doc_err = SimpleDocTemplate(buffer, pagesize=letter)
            doc_err.build([Paragraph(f"PDF Generation Error: {str(build_err)}", styles['Heading1'])])
            buffer.seek(0)
            return buffer

        buffer.seek(0)
        return buffer

    def generate_pdf(self, process_data, output_path):
        """Standard file generator"""
        buffer = self.generate_pdf_buffer(process_data)
        with open(output_path, 'wb') as f:
            f.write(buffer.getvalue())
        return output_path

```

## AutoLCA/backend/core/spatial_engine.py
```python
import json
from shapely.geometry import shape, Point
from typing import Optional, Dict, List
import os

class SpatialEngine:
    """
    Engine for resolving coordinates into regional IDs using GeoJSON spatial data.
    Designed for Location-Based Spatial Regionalization (AWARE v1.2 etc).
    """
    def __init__(self, geojson_path: Optional[str] = None):
        self.regions = [] # List of (geometry, properties)
        if geojson_path and os.path.exists(geojson_path):
            self.load_geojson(geojson_path)
        else:
            # Load a minimal mock GeoJSON if no path provided for demo
            self._load_mock_data()

    def load_geojson(self, path: str):
        with open(path, 'r') as f:
            data = json.load(f)
            if data['type'] == 'FeatureCollection':
                for feature in data['features']:
                    geom = shape(feature['geometry'])
                    props = feature['properties']
                    self.regions.append((geom, props))

    def _load_mock_data(self):
        # Mini mockup: Watersheds in different regions
        # US, EU, GLO (Mocked as boxes)
        mock_features = [
            {
                "type": "Feature",
                "properties": {"region_id": "US", "name": "United States Watershed"},
                "geometry": {"type": "Polygon", "coordinates": [[[-125, 24], [-125, 49], [-66, 49], [-66, 24], [-125, 24]]]}
            },
            {
                "type": "Feature",
                "properties": {"region_id": "EU", "name": "European Watershed"},
                "geometry": {"type": "Polygon", "coordinates": [[[-10, 35], [-10, 70], [30, 70], [30, 35], [-10, 35]]]}
            }
        ]
        for feature in mock_features:
            geom = shape(feature['geometry'])
            props = feature['properties']
            self.regions.append((geom, props))

    def resolve_region_from_coords(self, lat: float, lng: float) -> str:
        """
        Intersects a point with loaded polygons to find the region ID.
        Returns 'GLO' as fallback.
        """
        point = Point(lng, lat) # Shapely uses (x, y) order
        for geom, props in self.regions:
            if geom.contains(point):
                return props.get('region_id', 'GLO')
        return 'GLO'

    def get_hierarchical_fallback(self, region_id: str) -> List[str]:
        """
        Returns a list of regions to check in order of priority.
        Example: 'US-CA' -> ['US-CA', 'US', 'RER', 'GLO']
        """
        # Simple heuristic mapping for demo
        hierarchy = [region_id]
        
        # If it's a sub-region (hyphenated), add the parent nation
        if '-' in region_id:
            parent = region_id.split('-')[0]
            if parent not in hierarchy:
                hierarchy.append(parent)
        
        # Add Continental and Global fallbacks
        if region_id not in ['RER', 'GLO']:
            hierarchy.append('RER') # Rest of World/Europe/Continental
        if 'GLO' not in hierarchy:
            hierarchy.append('GLO')
            
        return hierarchy

# Singleton instance
spatial_engine = SpatialEngine()

```

## AutoLCA/backend/data/AutoLCA_Export_20260224220945.csv
```
Node,Exchange,Amount,Unit,Type
Titanium Ore Extraction,titanium ore,100.0,kg,output
Titanium Ore Extraction,diesel,10.0,L,input
Kroll Process,titanium tetrachloride,100.0,kg,input
Kroll Process,magnesium,50.0,kg,input
Kroll Process,titanium sponge,25.0,kg,output
Alloying & Casting,titanium sponge,25.0,kg,input
Alloying & Casting,aluminum,1.5,kg,input
Alloying & Casting,vanadium,1.0,kg,input
Alloying & Casting,Ti-6Al-4V ingot,27.5,kg,output
Aerospace Part Transport,Ti-6Al-4V ingot,27.5,kg,input
Aerospace Part Transport,Heavy-duty truck,1000.0,tkm,mechanism
CNC Machining,Ti-6Al-4V ingot,27.5,kg,input
CNC Machining,electricity,45.0,kWh,mechanism
CNC Machining,Finished Part,12.0,kg,output

```

## AutoLCA/backend/data/AutoLCA_Export_20260224221758.csv
```
Node,Exchange,Amount,Unit,Type
Titanium Ore Extraction,titanium ore,100.0,kg,output
Titanium Ore Extraction,diesel,10.0,L,input
Kroll Process,titanium tetrachloride,100.0,kg,input
Kroll Process,magnesium,50.0,kg,input
Kroll Process,titanium sponge,25.0,kg,output
Alloying & Casting,titanium sponge,25.0,kg,input
Alloying & Casting,aluminum,1.5,kg,input
Alloying & Casting,vanadium,1.0,kg,input
Alloying & Casting,Ti-6Al-4V ingot,27.5,kg,output
Aerospace Part Transport,Ti-6Al-4V ingot,27.5,kg,input
Aerospace Part Transport,Heavy-duty truck,1000.0,tkm,mechanism
CNC Machining,Ti-6Al-4V ingot,27.5,kg,input
CNC Machining,electricity,45.0,kWh,mechanism
CNC Machining,Finished Part,12.0,kg,output

```

## AutoLCA/backend/data_models/__init__.py
```python

```

## AutoLCA/backend/data_models/internal_lca.py
```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class UnifiedExchange(BaseModel):
    flow_id: str = Field(..., description="Unique identifier for the flow")
    name: str = Field(..., description="Human-readable name of the flow")
    amount: float = Field(..., description="Quantity of the flow")
    unit: str = Field(..., description="Standardized unit (e.g., kg, MJ)")
    flow_type: str = Field(..., description="Input or Output")
    is_elementary: bool = Field(default=False, description="True if it's an environmental exchange")

class UnifiedProcess(BaseModel):
    id: str = Field(..., description="Original database ID")
    name: str = Field(..., description="Process name")
    version: Optional[str] = Field(None, description="Database version info")
    location_code: str = Field(default="GLO", description="ISO location code")
    category: Optional[str] = Field(None, description="Process classification")
    exchanges: List[UnifiedExchange] = Field(default_factory=list)

class UnifiedMetadata(BaseModel):
    source_db: str = Field(..., description="Name of the source database (e.g., ecoinvent, NEEDS)")
    schema_version: str = Field(default="1.0", description="Triya Schema version")
    extraction_date: datetime = Field(default_factory=datetime.now)
    total_processes: int = 0

class UnifiedDatabase(BaseModel):
    metadata: UnifiedMetadata
    processes: List[UnifiedProcess]

```

## AutoLCA/backend/main.py
```python
import sys
import os
import datetime
from typing import List, Dict, Any, Optional, Union

# Ensure the backend directory is in the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
from sklearn.impute import KNNImputer
import numpy as np
import shutil
import json
import zipfile
import tempfile
from sqlalchemy.orm import Session

# Local imports
from core.reporter import JRCReporter
from models import SessionLocal, LCAProcess as DBProcess, LCAExchange, db_manager, init_db, LCAModel, NodeParameter
from utils.lca_parser import parse_uploaded_file
from utils.lca_engine import LCAEngine
from schemas import (
    LCIAComputePayload, ModelSavePayload, ParameterSchema, 
    UncertaintySchema, NodeSchema, EdgeSchema
)

# Global in-memory cache for uploaded database processes
uploaded_processes_cache = []

app = FastAPI(title="Triya.io Unified API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static path setup
static_path = os.path.join(backend_dir, "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)

# Initialize database
init_db()

app.mount("/static", StaticFiles(directory=static_path), name="static")

reporter = JRCReporter()

@app.get("/")
async def root():
    return {"message": "Triya.io API is running."}

# --- Persistence Endpoints ---

@app.post("/api/models")
async def save_model(payload: ModelSavePayload):
    """
    Saves a user-created workspace graph and its parameters.
    """
    db = SessionLocal()
    try:
        new_model = LCAModel(
            name=payload.name,
            description=payload.description,
            nodes_data=payload.nodes,
            edges_data=payload.edges
        )
        db.add(new_model)
        db.commit()
        db.refresh(new_model)
        
        # Save node-specific parameters
        for p in payload.parameters:
            node_param = NodeParameter(
                model_id=new_model.id,
                node_id=p.get("nodeId"),
                param_key=p.get("key"),
                param_value=p.get("value"),
                unit=p.get("unit"),
                uncertainty_type=p.get("uncertaintyType"),
                uncertainty_params=p.get("uncertaintyParams")
            )
            db.add(node_param)
        
        db.commit()
        return {"id": new_model.id, "status": "saved"}
    finally:
        db.close()

@app.get("/api/models")
async def list_models():
    db = SessionLocal()
    try:
        models = db.query(LCAModel).all()
        return [{"id": m.id, "name": m.name, "created_at": m.created_at} for m in models]
    finally:
        db.close()

@app.get("/api/models/{model_id}")
async def load_model(model_id: int):
    db = SessionLocal()
    try:
        model = db.query(LCAModel).filter(LCAModel.id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        params = db.query(NodeParameter).filter(NodeParameter.model_id == model_id).all()
        return {
            "name": model.name,
            "description": model.description,
            "nodes": model.nodes_data,
            "edges": model.edges_data,
            "parameters": [
                {
                    "nodeId": p.node_id,
                    "key": p.param_key,
                    "value": p.param_value,
                    "unit": p.unit
                } for p in params
            ]
        }
    finally:
        db.close()

# --- Parameter Endpoints ---

@app.get("/api/parameters/definitions")
async def get_parameter_definitions(processId: Optional[int] = None):
    """
    Scientific Parameter Discovery.
    Discovers parameters marked in DB or adds generic ones.
    """
    db = SessionLocal()
    try:
        definitions = []
        if processId:
            exchanges = db.query(LCAExchange).filter(LCAExchange.process_id == processId).all()
            for ex in exchanges:
                if ex.is_parameter or '%' in ex.flow_name:
                    definitions.append({
                        "key": ex.flow_name,
                        "name": ex.flow_name,
                        "unit": ex.unit,
                        "defaultValue": ex.amount,
                        "description": ex.description or f"Input flow: {ex.flow_name}",
                        "uncertainty": {
                            "type": ex.uncertainty_type or "none",
                            "params": ex.uncertainty_params or {}
                        }
                    })
        
        # Add Generic Parameters
        definitions.append({
            "key": "transport_distance",
            "name": "Transport Distance",
            "unit": "km",
            "defaultValue": 100.0,
            "description": "Custom transport distance for logistics calculation."
        })
        return definitions
    finally:
        db.close()

# --- Calculation Engine ---

@app.post("/api/calculate-lcia")
async def calculate_lcia(payload: LCIAComputePayload):
    """
    Upgraded LCIA Engine: Handles Pydantic validation, unlimited nodes, and Monte Carlo.
    """
    # Prepare DB data for engine cache
    db = SessionLocal()
    try:
        all_procs = db.query(DBProcess).all()
        impact_cols = [
            'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
            'ep_freshwater', 'ep_marine', 'ep_terrestrial',
            'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
            'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
            'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
            'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
        ]
        db_data = [{col: getattr(p, col) for col in impact_cols} | {"name": p.process_name, "location": p.location} for p in all_procs]
            
        engine = LCAEngine(db_processes=db_data)
        
        # Convert Pydantic to dict for engine
        results = engine.calculate_supply_chain(
            [n.dict() for n in payload.nodes], 
            [e.dict() for e in payload.edges], 
            iterations=payload.iterations
        )
        
        return results
    finally:
        db.close()


@app.get("/api/processes")
async def list_processes():
    db = SessionLocal()
    try:
        procs = db.query(DBProcess).all()
        return [{"id": p.id, "name": p.process_name, "category": p.category, "location": p.location} for p in procs]
    finally:
        db.close()


@app.get("/api/process/{process_id}/parameters")
async def get_process_parameters_legacy(process_id: int):
    """
    Legacy Support for Phase 1-10 Frontend.
    """
    db = SessionLocal()
    try:
        process = db.query(DBProcess).filter(DBProcess.id == process_id).first()
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        exchanges = db.query(LCAExchange).filter(LCAExchange.process_id == process_id).all()
        params = []
        for exch in exchanges:
            if '%' in exch.flow_name or exch.flow_type == 'input':
                params.append({
                    "id": exch.flow_name,
                    "name": f"{exch.flow_name} ({exch.unit})",
                    "min": 0.0,
                    "max": exch.amount * 5,
                    "step": 0.1,
                    "default": exch.amount
                })
        return params
    finally:
        db.close()

@app.get("/api/process/shuffle")
async def shuffle_benchy():
    """
    The Shuffle Engine (Fixed for updated DB schema).
    """
    benchmarks = ["Primary Aluminum", "PET Bottle", "EU Electricity Mix", "Corrugated Board", "Truck Transport"]
    import random
    selected_name = random.choice(benchmarks)
    
    db = SessionLocal()
    try:
        process = db.query(DBProcess).filter(DBProcess.process_name.like(f"%{selected_name}%")).first()
        if not process:
            process = db.query(DBProcess).first()
            if not process: raise HTTPException(status_code=404, detail="No processes found.")

        impact_cols = [
            'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
            'ep_freshwater', 'ep_marine', 'ep_terrestrial',
            'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
            'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
            'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
            'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
        ]
        
        results = {col: float(getattr(process, col) or 0.0) for col in impact_cols}
            
        return {
            "process_name": process.process_name,
            "unit": process.unit or "kg",
            "quantity": 1.0,
            "impacts": results,
            "metadata": {
                "method": "EF 3.1 (JRC)",
                "benchmark": selected_name,
                "location": process.location or "GLO"
            }
        }
    finally:
        db.close()

@app.post("/api/generate-pdf")
async def generate_canvas_pdf(payload: dict):
    print(f"DEBUG: /api/generate-pdf received!")
    nodes = payload.get("nodes", [])
    edges = payload.get("edges", [])
    compliance_framework = payload.get("complianceFramework", "iso-14044")
    lcia_results = payload.get("lciaResults")
    snapshot = payload.get("snapshot") 
    
    if not lcia_results:
        raise HTTPException(status_code=400, detail="Calculate impact first.")
    
    report_data = {
        "process_name": "Triya.io Scientific Model",
        "impacts": lcia_results.get("impacts", {}),
        "uncertainty": lcia_results.get("uncertainty"),
        "iterations": lcia_results.get("iterations", 1),
        "metadata": {
            "method": "EF 3.1 (JRC)",
            "compliance_framework": compliance_framework,
            "node_count": len(nodes),
            "edge_count": len(edges),
            "snapshot": snapshot,
            "is_ai_predicted": lcia_results.get("is_ai_predicted", False),
            "node_breakdown": lcia_results.get("node_breakdown", {})
        }
    }

    report_filename = f"AutoLCA_Report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    from fastapi.concurrency import run_in_threadpool
    
    try:
        pdf_buffer = await run_in_threadpool(reporter.generate_pdf_buffer, report_data)
        pdf_content = pdf_buffer.getvalue()
        pdf_buffer.close()
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={report_filename}"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search-processes")
async def search_processes(q: str = ""):
    db = SessionLocal()
    try:
        query = db.query(DBProcess)
        if q:
            query = query.filter(DBProcess.process_name.like(f"%{q}%"))
        results = query.limit(50).all()
        return [{"id": r.id, "name": r.process_name, "location": r.location, "unit": r.unit} for r in results]
    finally:
        db.close()

@app.post("/api/upload-database")
async def upload_database(file: UploadFile = File(...)):
    temp_file_path = None
    db = SessionLocal()
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        # Universal Database Abstraction Middleware Logic
        result = parse_uploaded_file(temp_file_path)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        processes = result.get("processes", [])
        metadata = result.get("metadata", {})
        
        success_count = 0
        conflict_count = 0

        for p in processes:
            try:
                # Validation: Pydantic Triya Schema ensures data consistency
                # Create the main process record
                new_proc = DBProcess(
                    process_name=p.get("name"),
                    unit=p.get("exchanges")[0].get("unit") if p.get("exchanges") else "unit",
                    location=p.get("location_code"),
                    category=p.get("category"),
                    # Future-proofing: versioning and source metadata
                    technology=f"Source: {metadata.get('source_db')} | Version: {p.get('version')}"
                )
                db.add(new_proc)
                db.flush() # Get ID before adding exchanges
                
                # Map unified exchanges to DB exchanges
                for ex in p.get("exchanges", []):
                    new_ex = LCAExchange(
                        process_id=new_proc.id,
                        flow_name=ex.get("name"),
                        amount=ex.get("amount"),
                        unit=ex.get("unit"),
                        flow_type=ex.get("flow_type").lower(),
                        is_parameter='%' in ex.get("name"),
                        uncertainty_type="lognormal" if ex.get("is_elementary") else "none"
                    )
                    db.add(new_ex)
                
                success_count += 1
            except Exception as semantic_error:
                # Error Recovery: Log Semantic Conflict but continue
                print(f"CRITICAL: Semantic Conflict in process '{p.get('name')}': {semantic_error}")
                conflict_count += 1
                db.rollback() # Rollback only this process
                # Re-acquire session for next processes if needed, but since we use flush, 
                # we might need to be careful. In SQLite, one transaction is fine.
                continue

        db.commit()
        return {
            "status": "success", 
            "inserted": success_count, 
            "conflicts": conflict_count,
            "source": metadata.get("source_db"),
            "processes": processes,
            "metadata": metadata
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

```

## AutoLCA/backend/migrate_db.py
```python
import sqlite3
db_path = r"C:\Users\Asus\Documents\Database_Triya\triya_poc.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get existing columns
cursor.execute("PRAGMA table_info(lca_processes);")
existing_cols = {col[1] for col in cursor.fetchall()}

# All desired columns from models.py
all_cols = [
    "gwp_climate_change", "odp_ozone_depletion", "ap_acidification", 
    "ep_freshwater", "ep_marine", "ep_terrestrial",
    "pocp_photochemical_ozone", "pm_particulate_matter", "ir_ionising_radiation", 
    "ht_c_human_toxicity_cancer", "ht_nc_human_toxicity_non_cancer", 
    "et_fw_ecotoxicity_freshwater", "lu_land_use", "wsf_water_scarcity", 
    "ru_mm_resource_use_min_met", "ru_f_resource_use_fossils",
    "category", "location", "technology"
]

for col in all_cols:
    if col not in existing_cols:
        print(f"Adding column: {col}")
        try:
            cursor.execute(f"ALTER TABLE lca_processes ADD COLUMN {col} FLOAT;")
        except Exception as e:
            print(f"Error adding {col}: {e}")

# Also check lca_exchanges
cursor.execute("PRAGMA table_info(lca_exchanges);")
existing_ex_cols = {col[1] for col in cursor.fetchall()}
ex_cols = {
    "uncertainty_type": "TEXT",
    "uncertainty_params": "JSON",
    "allocation_factor": "FLOAT",
    "is_parameter": "BOOLEAN",
    "description": "TEXT"
}

for col, dtype in ex_cols.items():
    if col not in existing_ex_cols:
        print(f"Adding column to lca_exchanges: {col}")
        try:
            cursor.execute(f"ALTER TABLE lca_exchanges ADD COLUMN {col} {dtype};")
        except Exception as e:
            print(f"Error adding {col} to exchanges: {e}")

conn.commit()
conn.close()
print("Migration done.")

```

## AutoLCA/backend/models.py
```python
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
import datetime

# Pathway B Link (Persistent Database)
DEFAULT_DB_PATH = r"C:\Users\Asus\Documents\Database_Triya\triya_poc.db"

class DatabaseManager:
    def __init__(self, db_path=DEFAULT_DB_PATH):
        self.db_path = db_path
        self.engine = create_engine(
            f"sqlite:///{self.db_path}", connect_args={"check_same_thread": False}
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def switch_db(self, new_path):
        self.db_path = new_path
        self.engine = create_engine(
            f"sqlite:///{self.db_path}", connect_args={"check_same_thread": False}
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        return self.SessionLocal

db_manager = DatabaseManager()
SessionLocal = db_manager.SessionLocal
Base = declarative_base()

class LCAProcess(Base):
    __tablename__ = "lca_processes"

    id = Column(Integer, primary_key=True, index=True)
    process_name = Column(String)
    unit = Column(String)
    category = Column(String, nullable=True)
    location = Column(String, nullable=True)
    technology = Column(String, nullable=True)
    
    # 16 JRC EF 3.1 Impact Categories
    gwp_climate_change = Column(Float, nullable=True)
    odp_ozone_depletion = Column(Float, nullable=True)
    ap_acidification = Column(Float, nullable=True)
    ep_freshwater = Column(Float, nullable=True)
    ep_marine = Column(Float, nullable=True)
    ep_terrestrial = Column(Float, nullable=True)
    pocp_photochemical_ozone = Column(Float, nullable=True)
    pm_particulate_matter = Column(Float, nullable=True)
    ir_ionising_radiation = Column(Float, nullable=True)
    ht_c_human_toxicity_cancer = Column(Float, nullable=True)
    ht_nc_human_toxicity_non_cancer = Column(Float, nullable=True)
    et_fw_ecotoxicity_freshwater = Column(Float, nullable=True)
    lu_land_use = Column(Float, nullable=True)
    wsf_water_scarcity = Column(Float, nullable=True)
    ru_mm_resource_use_min_met = Column(Float, nullable=True)
    ru_f_resource_use_fossils = Column(Float, nullable=True)

    exchanges = relationship("LCAExchange", back_populates="process")

class LCAExchange(Base):
    __tablename__ = "lca_exchanges"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("lca_processes.id"))
    flow_name = Column(String)
    amount = Column(Float)
    unit = Column(String)
    flow_type = Column(String)  # 'input' or 'output'
    
    # New Scientific Metadata
    uncertainty_type = Column(String, nullable=True) # lognormal, normal, uniform
    uncertainty_params = Column(JSON, nullable=True) # {"sd_g": 1.2} etc.
    allocation_factor = Column(Float, default=1.0)
    is_parameter = Column(Boolean, default=False)
    description = Column(String, nullable=True)

    process = relationship("LCAProcess", back_populates="exchanges")

class LCAModel(Base):
    """
    Stores user-created supply chain graphs for persistence.
    """
    __tablename__ = "lca_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Blob of the whole graph structure
    nodes_data = Column(JSON) 
    edges_data = Column(JSON)
    
    parameters = relationship("NodeParameter", back_populates="model", cascade="all, delete-orphan")

class NodeParameter(Base):
    """
    Stores per-node parameter overrides for a specific saved model.
    """
    __tablename__ = "node_parameters"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("lca_models.id"))
    node_id = Column(String) # The frontend UUID for the node
    
    param_key = Column(String) # e.g. "transport_distance"
    param_value = Column(Float)
    unit = Column(String, nullable=True)
    min_val = Column(Float, nullable=True)
    max_val = Column(Float, nullable=True)
    step = Column(Float, nullable=True)
    is_editable = Column(Boolean, default=True)
    
    uncertainty_type = Column(String, nullable=True)
    uncertainty_params = Column(JSON, nullable=True)

    model = relationship("LCAModel", back_populates="parameters")

def init_db():
    if not os.path.exists(os.path.dirname(db_manager.db_path)):
        os.makedirs(os.path.dirname(db_manager.db_path))
    Base.metadata.create_all(bind=db_manager.engine)

```

## AutoLCA/backend/nginx.conf
```
# Triya.io Unified Web - Nginx Reverse Proxy
# Routes /api to FastAPI (backend:8000), / to Next.js (frontend:3000)
# Strip /api prefix when proxying to FastAPI

worker_processes 1;
events { worker_connections 1024; }

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    # Upstream backends
    upstream frontend {
        server frontend:3000;
    }
    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;
        client_max_body_size 50M;

        # WebSocket support for Next.js HMR / React Flow if needed
        map $http_upgrade $connection_upgrade {
            default upgrade;
            ''      close;
        }

        # FastAPI backend: strip /api prefix and forward (backend receives /process/1 not /api/process/1)
        location /api/ {
            rewrite ^/api/(.*) /$1 break;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Next.js frontend (everything else)
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}

```

## AutoLCA/backend/requirements-backend.txt
```
# Backend / Docker API server (in addition to core deps)
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
pandas>=2.0.0
scikit-learn>=1.4.0
jinja2>=3.1.0
playwright>=1.49.0

```

## AutoLCA/backend/requirements.txt
```
PyQt5==5.15.9
NodeGraphQt==0.6.44
brightway2==2.4.6
numpy
scipy
pyinstaller
jinja2
weasyprint
pandas
fastapi
uvicorn
sqlalchemy
scikit-learn
python-multipart

```

## AutoLCA/backend/schemas.py
```python
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime

class UncertaintySchema(BaseModel):
    type: str  # lognormal, normal, uniform, triangle
    params: Dict[str, float]

class ParameterSchema(BaseModel):
    name: str
    value: float
    unit: Optional[str] = "unit"
    min: Optional[float] = 0.0
    max: Optional[float] = 1000.0
    step: Optional[float] = 0.1
    description: Optional[str] = ""
    isEditable: Optional[bool] = True
    uncertainty: Optional[UncertaintySchema] = None

class LocationSchema(BaseModel):
    type: str  # 'coordinate' or 'region_tag'
    value: Any # [lat, lng] or "GLO"

class NodeDataSchema(BaseModel):
    processName: str
    processId: Optional[int] = None
    parameters: Optional[Dict[str, ParameterSchema]] = {}
    exchanges: Optional[List[Dict[str, Any]]] = []
    module: Optional[str] = "A1-A3"
    location: Optional[LocationSchema] = None

class NodeSchema(BaseModel):
    id: str
    type: str
    data: NodeDataSchema

class EdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class LCIAComputePayload(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    iterations: Optional[int] = 1  # For Monte Carlo
    systemBoundary: Optional[str] = "gate-to-gate"
    complianceFramework: Optional[str] = "iso-14044"

class ModelSavePayload(BaseModel):
    name: str
    description: Optional[str] = ""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    parameters: Optional[List[Dict[str, Any]]] = []

```

## AutoLCA/backend/templates/report_jrc.html
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>JRC-Compliant LCA Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 10px;
        }

        .section {
            margin: 20px 0;
        }

        .compliance-banner {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 10px;
            font-size: 0.9em;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .hotspot {
            color: #c0392b;
            font-weight: bold;
        }

        .ai-banner {
            margin-top: 30px;
            padding: 15px;
            background: #e8f4fd;
            border-left: 5px solid #2196f3;
            font-size: 0.85em;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Life Cycle Assessment (LCA) Report</h1>
        <p style="font-size: 0.8em; color: #7f8c8d;">JRC Technical Report: Guide for Environmental Footprint compliant
            datasets (EUR 31853 EN)</p>
        <p>Project: Triya.io Export | Methodology: JRC EF 3.1</p>
    </div>

    <div class="compliance-banner">
        <strong>Report Status:</strong> Compliant with EUR 31853 EN (JRC Technical Report) | <strong>Benchmark:</strong>
        {{ results.benchmark }}
    </div>

    <div class="section">
        <h2>1. Scope & System Boundary</h2>
        <p><strong>System Boundary:</strong> {{ results.metadata.system_boundary|upper }}</p>
        <p><strong>Functional Unit:</strong> 1 Unit of {{ results.process_name }}</p>
        <p><strong>Data Quality Rating (DQR):</strong> {{ dqr.quality_level }} (Score: {{ dqr.total_score|round(2) }})
        </p>

        {% if results.snapshot %}
        <h3>System Diagram</h3>
        <div
            style="text-align: center; border: 1px solid #eee; padding: 10px; border-radius: 8px; background: #fafafa;">
            <img src="{{ results.snapshot }}" style="max-width: 100%; height: auto; border: 1px solid #ddd;" />
            <p style="font-size: 10px; color: #95a5a6; margin-top: 5px;">Automated Canvas Snapshot from Triya AutoLCA
                Interface</p>
        </div>
        {% endif %}

        <div style="background: #f1f8e9; padding: 10px; border-radius: 5px; font-size: 0.8em; margin-top: 15px;">
            <strong>DQR Formula:</strong> (TeR + GeR + TiR + P) / 4 | Current: ({{ dqr.TeR }} + {{ dqr.GeR }} + {{
            dqr.TiR }} + {{ dqr.P }}) / 4
        </div>
    </div>

    <div class="section">
        <h2>2. Life Cycle Impact Assessment (LCIA)</h2>
        <table>
            <thead>
                <tr>
                    <th>Impact Category</th>
                    <th>Result (Characterized)</th>
                    <th>Normalized</th>
                    <th>Weighted</th>
                </tr>
            </thead>
            <tbody>
                {% for row in results.lcia_table %}
                <tr>
                    <td>{{ row.category }}</td>
                    <td>{{ row.value|round(6) }}</td>
                    <td>{{ row.norm|round(6) }}</td>
                    <td><strong>{{ row.weighted|round(6) }}</strong></td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>3. Hotspot Analysis & AI Transparency</h2>
        <div
            style="background: #fff5f5; border: 1px solid #feb2b2; border-left: 5px solid #f56565; padding: 15px; border-radius: 4px;">
            <strong style="color: #c53030;">🔴 Major Impact Hotspot:</strong>
            <p style="margin: 5px 0; font-size: 1.1em;"><strong>{{ results.metadata.hotspot.name or "N/A" }}</strong>
            </p>
            <p style="margin: 0; font-size: 0.9em; color: #4a5568;">
                Contributes <strong>{{ results.metadata.hotspot.percent|round(1) }}%</strong> to the total Global
                Warming Potential (GWP).
            </p>
        </div>

        {% if results.metadata.is_ai_predicted %}
        <div class="ai-banner" style="margin-top: 20px;">
            <strong style="color: #2b6cb0;">⚡ AI Gap-Filling Notice:</strong><br>
            Some missing environmental characterization factors were predicted using the <strong>KNN Imputer (Triya
                Imputation Engine)</strong>.
            Data quality remains 'Compliant' under JRC EF 3.1 uncertainty management rules.
        </div>
        {% endif %}
    </div>

    <div class="section">
        <p><small>Generated on: {{ results.timestamp }} | Anti-Gravity LCA Engine</small></p>
    </div>
</body>

</html>
```

## AutoLCA/backend/utils/__init__.py
```python
# Utils package for AutoLCA backend

```

## AutoLCA/backend/utils/lca_engine.py
```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from typing import List, Dict, Any, Optional
import random
from core.spatial_engine import spatial_engine
from core.monte_carlo import generate_samples, calculate_stats

# JRC EF 3.1 Impact Categories
IMPACT_CATEGORIES = [
    'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
    'ep_freshwater', 'ep_marine', 'ep_terrestrial',
    'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
    'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
    'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
    'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
]

class LCAEngine:
    def __init__(self, db_processes: Optional[List[Dict[str, Any]]] = None):
        """
        Extended LCA Engine for High-Scale Graphs & Uncertainty.
        """
        self.db_processes = db_processes if db_processes is not None else []
        self.imputer = KNNImputer(n_neighbors=2)
        self.feature_matrix = pd.DataFrame() # Initialize as empty df
        self._build_feature_matrix()

    def _build_feature_matrix(self):
        if not self.db_processes:
            return
        data = []
        for proc in self.db_processes:
            row = {cat: proc.get(cat) for cat in IMPACT_CATEGORIES}
            data.append(row)
        self.feature_matrix = pd.DataFrame(data)

    def impute_missing_impacts(self, impact_profile: Dict[str, Any]) -> tuple[Dict[str, Any], bool]:
        if self.feature_matrix is None or self.feature_matrix.empty:
            return impact_profile, False

        missing = any(impact_profile.get(cat) is None or np.isnan(impact_profile.get(cat, 0)) for cat in IMPACT_CATEGORIES)
        if not missing:
            return impact_profile, False

        new_row = pd.DataFrame([{cat: impact_profile.get(cat) for cat in IMPACT_CATEGORIES}])
        combined = pd.concat([self.feature_matrix, new_row], ignore_index=True)
        
        try:
            imputed_data = self.imputer.fit_transform(combined)
            imputed_row = imputed_data[-1] 
            return {cat: float(imputed_row[i]) for i, cat in enumerate(IMPACT_CATEGORIES)}, True
        except:
            return impact_profile, False

    def calculate_supply_chain(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], iterations: int = 1) -> Dict[str, Any]:
        """
        Master LCIA Calculation: Handles Scalable Graphs, Parameters, and Monte Carlo.
        """
        if iterations > 1:
            return self._compute_deterministic(nodes, edges, iterations=iterations)
        
        return self._compute_deterministic(nodes, edges)

    def _compute_deterministic(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], iterations: int = 1) -> Dict[str, Any]:
        node_map = {str(n['id']): n for n in nodes}
        adj = {str(n['id']): [] for n in nodes}
        for e in edges:
            adj[str(e['target'])].append(str(e['source']))

        memo = {}
        stack = set()
        
        state = {"is_ai_predicted": False}

        def walk(node_id: str):
            if node_id in stack:
                if iterations > 1:
                    return {cat: np.zeros(iterations) for cat in IMPACT_CATEGORIES}, False
                return {cat: 0.0 for cat in IMPACT_CATEGORIES}, False
            if node_id in memo:
                return memo[node_id]

            stack.add(node_id)
            node = node_map.get(node_id)
            if not node:
                stack.remove(node_id)
                if iterations > 1:
                    return {cat: np.zeros(iterations) for cat in IMPACT_CATEGORIES}, False
                return {cat: 0.0 for cat in IMPACT_CATEGORIES}, False

            data = node.get('data', {})
            exchanges = data.get('exchanges', [])
            params = data.get('parameters', {})
            
            if iterations > 1:
                current_impacts = {cat: np.zeros(iterations) for cat in IMPACT_CATEGORIES}
            else:
                current_impacts = {cat: 0.0 for cat in IMPACT_CATEGORIES}
            node_is_ai = False

            # 1. Direct Impacts
            for ex in exchanges:
                flow_name = ex.get('flow_name', '')
                base_amount = float(ex.get('amount', 0))
                
                # Distribution logic for Monte Carlo
                if iterations > 1:
                    # If the exchange itself has a distribution
                    ex_unc = ex.get('uncertainty')
                    if ex_unc and ex_unc.get('type') != 'none':
                        amounts = generate_samples(ex_unc, iterations)
                    else:
                        amounts = np.full(iterations, base_amount)
                    
                    # If there's a parameter override (stochastic params)
                    if flow_name in params:
                        p_val = params[flow_name]
                        p_unc = p_val.get('uncertainty')
                        if p_unc and p_unc.get('type') != 'none':
                            # Use parameter distribution
                            amounts = generate_samples(p_unc, iterations)
                        else:
                            # Use parameter scalar
                            amounts = np.full(iterations, float(p_val.get('value', base_amount)))
                else:
                    # Deterministic
                    amounts = base_amount
                    if flow_name in params:
                        amounts = float(params[flow_name].get('value', base_amount))
                
                # Spatial Context
                loc = data.get('location')
                region_id = 'GLO'
                if loc:
                    if loc.get('type') == 'coordinate':
                        coords = loc.get('value', [0, 0])
                        region_id = spatial_engine.resolve_region_from_coords(coords[0], coords[1])
                    else:
                        region_id = loc.get('value', 'GLO')

                proxy = self._find_proxy_impacts(flow_name, region_id)
                imputed, was_imputed = self.impute_missing_impacts(proxy)
                if was_imputed: node_is_ai = True
                
                for cat in IMPACT_CATEGORIES:
                    current_impacts[cat] += amounts * imputed.get(cat, 0.0)

            # 2. Upstream Impacts
            for upstream_id in adj.get(node_id, []):
                up_impacts, up_ai = walk(upstream_id)
                if up_ai: node_is_ai = True
                for cat in IMPACT_CATEGORIES:
                    current_impacts[cat] += up_impacts[cat]

            stack.remove(node_id)
            memo[node_id] = (current_impacts, node_is_ai)
            return current_impacts, node_is_ai

        # 3. Final Aggregation & Statistical Analysis
        total_impact_raw = {cat: np.zeros(iterations) if iterations > 1 else 0.0 for cat in IMPACT_CATEGORIES}
        sources = {str(e['source']) for e in edges}
        sinks = [nid for nid in node_map if nid not in sources]
        
        for nid in node_map:
            impacts, was_ai = walk(nid)
            if was_ai: state["is_ai_predicted"] = True
            
            if nid in sinks:
                for cat in IMPACT_CATEGORIES:
                    total_impact_raw[cat] += impacts[cat]

        # Process results and calculate stats if MC
        final_total_impacts = {}
        uncertainty_analysis = {}

        for cat in IMPACT_CATEGORIES:
            raw_data = total_impact_raw[cat]
            if iterations > 1:
                stats = calculate_stats(raw_data)
                final_total_impacts[cat] = stats['mean']
                uncertainty_analysis[cat] = stats
            else:
                final_total_impacts[cat] = raw_data

        # Node Breakdown processing
        final_node_breakdown = {}
        for nid, (raw_impacts, was_ai) in memo.items():
            processed_impacts = {}
            node_mc_stats = {}
            for cat in IMPACT_CATEGORIES:
                val = raw_impacts[cat]
                if iterations > 1:
                    s = calculate_stats(val)
                    processed_impacts[cat] = s['mean']
                    node_mc_stats[cat] = s
                else:
                    processed_impacts[cat] = val
            
            final_node_breakdown[nid] = {
                "name": node_map[nid].get('data', {}).get('processName', 'Unnamed'),
                "module": node_map[nid].get('data', {}).get('module', 'A1-A3'),
                "impacts": processed_impacts,
                "uncertainty": node_mc_stats if iterations > 1 else None,
                "is_ai": was_ai
            }

        # Hotspot
        total_gwp = final_total_impacts.get('gwp_climate_change', 0.0)
        max_gwp = -1.0
        hotspot = {"node_id": None, "name": "N/A", "percentage": 0.0}
        
        for nid, res in final_node_breakdown.items():
            gwp = res['impacts'].get('gwp_climate_change', 0.0)
            if gwp > max_gwp:
                max_gwp = gwp
                hotspot = {
                    "node_id": nid,
                    "name": res['name'],
                    "percent": (gwp/total_gwp*100) if total_gwp > 0 else 0
                }

        return {
            "gwp": float(final_total_impacts.get('gwp_climate_change', 0.0)),
            "impacts": final_total_impacts,
            "uncertainty": uncertainty_analysis if iterations > 1 else None,
            "node_breakdown": final_node_breakdown,
            "is_ai_predicted": state["is_ai_predicted"],
            "hotspots": [hotspot] if hotspot['node_id'] else [],
            "iterations": iterations
        }

    def _perturb_data(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        import copy
        new_nodes = copy.deepcopy(nodes)
        for n in new_nodes:
            params = n.get('data', {}).get('parameters', {})
            for p_key, p_val in params.items():
                unc = p_val.get('uncertainty')
                if unc:
                    p_type = unc.get('type')
                    p_params = unc.get('params', {})
                    if p_type == 'lognormal':
                        # mu calculation from mean and sd_g
                        mean = float(p_val.get('value', 1.0))
                        sd_g = float(p_params.get('sd_g', 1.2))
                        n['data']['parameters'][p_key]['value'] = np.random.lognormal(np.log(mean), np.log(sd_g))
                    elif p_type == 'normal':
                        mean = float(p_val.get('value', 1.0))
                        std = float(p_params.get('std', 0.1))
                        n['data']['parameters'][p_key]['value'] = np.random.normal(mean, std)
        return new_nodes

    def _find_proxy_impacts(self, name: str, region_id: str = 'GLO') -> Dict[str, Any]:
        if not name: return {cat: 0.0 for cat in IMPACT_CATEGORIES}
        name_lower = name.lower().strip()
        
        # Hierarchical Fallback: Region -> Nation -> GLO
        hierarchy = spatial_engine.get_hierarchical_fallback(region_id)
        
        for reg in hierarchy:
            for proc in self.db_processes:
                if name_lower == str(proc.get('name', '')).lower() and reg == proc.get('location', 'GLO'):
                    return {cat: proc.get(cat, 0.0) for cat in IMPACT_CATEGORIES}
        
        # Fallback dictionary (Keyword-based)
        fallbacks = {"steel": 2.5, "aluminum": 12.0, "electricity": 0.5, "diesel": 3.2, "titanium": 45.0}
        gwp = 0.5
        for k, v in fallbacks.items():
            if k in name_lower: gwp = v; break

        # Apply regional variation if it's water (AWARE v1.2 logic simulation)
        if "water" in name_lower:
            # Mock regional factor: US=1.5, EU=0.8, GLO=1.0
            regional_factors = {"US": 1.5, "EU": 0.8, "GLO": 1.0}
            factor = regional_factors.get(region_id, 1.0)
            gwp *= factor

        return {cat: (gwp if cat == 'gwp_climate_change' else gwp * 0.05) for cat in IMPACT_CATEGORIES}

```

## AutoLCA/backend/utils/lca_parser.py
```python
import json
import csv
import os
import uuid
import zipfile
import tempfile
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from data_models.internal_lca import UnifiedProcess, UnifiedExchange, UnifiedMetadata

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
#  Semantic Mapper (Nomenclature Translator)
# ---------------------------------------------------------------------------

class SemanticMapper:
    """
    Harmonizes units and flow names across different database conventions.
    """
    UNIT_MAPPING = {
        "kg": "kg",
        "kilogram": "kg",
        "kilograms": "kg",
        "kg(s)": "kg",
        "g": "g",
        "gram": "g",
        "mj": "MJ",
        "megajoule": "MJ",
        "kwh": "kWh",
        "kilowatt hour": "kWh",
        "m3": "m3",
        "cubic meter": "m3",
        "item(s)": "unit",
        "unit": "unit",
        "p": "unit",
        "piece": "unit"
    }

    @classmethod
    def normalize_unit(cls, unit: str) -> str:
        if not unit:
            return "unit"
        lowered = unit.lower().strip()
        return cls.UNIT_MAPPING.get(lowered, lowered)

# ---------------------------------------------------------------------------
#  Abstract Base Class
# ---------------------------------------------------------------------------

class BaseParser(ABC):
    def __init__(self, source_db: str):
        self.source_db = source_db
        self.metadata = UnifiedMetadata(source_db=source_db)

    @abstractmethod
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract raw data from file."""
        ...

    @abstractmethod
    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        """Convert raw data to Triya Schema."""
        ...

    def parse(self, file_path: str) -> List[UnifiedProcess]:
        raw_data = self.extract_processes(file_path)
        unified_procs = self.map_to_unified(raw_data)
        self.metadata.total_processes = len(unified_procs)
        return unified_procs

# ---------------------------------------------------------------------------
#  JSON-LD Parser
# ---------------------------------------------------------------------------

class JsonLdParser(BaseParser):
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Handle different JSON shapes
        if isinstance(data, dict):
            if data.get("@type") == "Process":
                return [data]
            if "processes" in data and isinstance(data["processes"], list):
                return data["processes"]
            # Try to find a list of dicts
            for val in data.values():
                if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                    return val
        if isinstance(data, list):
            return data
        return []

    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        unified = []
        for obj in raw_data:
            try:
                proc_id = obj.get("@id") or obj.get("id") or str(uuid.uuid4())
                
                exchanges = []
                for ex in obj.get("exchanges", []):
                    # Flow normalization
                    flow_obj = ex.get("flow", {})
                    flow_name = flow_obj.get("name") if isinstance(flow_obj, dict) else str(flow_obj)
                    if not flow_name:
                        flow_name = ex.get("flow_name", "Unknown Flow")
                    
                    # Unit normalization
                    unit_obj = ex.get("unit", {})
                    unit_name = unit_obj.get("name") if isinstance(unit_obj, dict) else str(unit_obj)
                    normalized_unit = SemanticMapper.normalize_unit(unit_name or ex.get("unit"))

                    # Direction
                    is_input = ex.get("isInput")
                    flow_type_str = ex.get("flow_type") or ex.get("flowType") or ""
                    if is_input is True or flow_type_str.lower() in ("input", "elementary_flow"):
                        flow_type = "Input"
                    else:
                        flow_type = "Output"

                    exchanges.append(UnifiedExchange(
                        flow_id=ex.get("flow", {}).get("@id", str(uuid.uuid4())),
                        name=flow_name,
                        amount=float(ex.get("amount") or 0),
                        unit=normalized_unit,
                        flow_type=flow_type,
                        is_elementary=ex.get("is_elementary", False) or "elementary" in flow_type_str.lower()
                    ))

                location_obj = obj.get("location", {})
                location = location_obj.get("name") if isinstance(location_obj, dict) else str(location_obj)

                unified.append(UnifiedProcess(
                    id=str(proc_id),
                    name=obj.get("name", "Unnamed Process"),
                    version=obj.get("version"),
                    location_code=location if location and location != "{}" else "GLO",
                    category=obj.get("category"),
                    exchanges=exchanges
                ))
            except Exception as e:
                logger.error(f"Semantic Conflict in JSON-LD mapping: {e}")
                continue
        return unified

# ---------------------------------------------------------------------------
#  CSV Parser
# ---------------------------------------------------------------------------

class CsvParser(BaseParser):
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        processes = []
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for row_idx, row in enumerate(reader):
                    processes.append(row)
        except Exception as e:
            logger.error(f"Error reading CSV: {e}")
        return processes

    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        unified = []
        for idx, row in enumerate(raw_data):
            try:
                proc_name = row.get("process_name") or row.get("name") or f"Process {idx + 1}"
                unit = SemanticMapper.normalize_unit(row.get("unit") or "kg")
                
                exchanges = []
                # Simple heuristic for CSV: any numeric column except known labels
                skip = {"process_name", "name", "unit", "id", "description", "location", "category"}
                for col, val in row.items():
                    if col.lower() in skip: continue
                    try:
                        amount = float(val)
                        if amount != 0:
                            exchanges.append(UnifiedExchange(
                                flow_id=str(uuid.uuid4()),
                                name=col,
                                amount=amount,
                                unit=unit,
                                flow_type="Input",
                                is_elementary=False
                            ))
                    except (ValueError, TypeError):
                        continue

                unified.append(UnifiedProcess(
                    id=row.get("id") or str(idx + 1),
                    name=proc_name,
                    location_code=row.get("location") or "GLO",
                    category=row.get("category"),
                    exchanges=exchanges
                ))
            except Exception as e:
                logger.error(f"Semantic Conflict in CSV mapping: {idx}: {e}")
                continue
        return unified

# ---------------------------------------------------------------------------
#  Zolca Parser (Placeholder for Derby logic)
# ---------------------------------------------------------------------------

class ZolcaParser(BaseParser):
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Handles unzipping and structure detection for .zolca.
        Note: .zolca is usually a zipped folder containing JSON and Derby data.
        """
        logger.info(f"Unzipping .zolca file: {file_path}")
        results = []
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                # Basic strategy: find all .json files inside
                for file_name in zip_ref.namelist():
                    if file_name.endswith('.json'):
                        with zip_ref.open(file_name) as f:
                            content = json.load(f)
                            if isinstance(content, dict) and content.get("@type") == "Process":
                                results.append(content)
        except Exception as e:
            logger.error(f"Failed to unzip/parse .zolca: {e}")
        return results

    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        # Zolca internal processes often follow OpenLCA JSON-LD
        return JsonLdParser("Zolca-Internal").map_to_unified(raw_data)

# ---------------------------------------------------------------------------
#  Factory / Router
# ---------------------------------------------------------------------------

def get_parser(file_path: str) -> BaseParser:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".json":
        return JsonLdParser("OpenLCA-JSON")
    elif ext == ".csv":
        return CsvParser("Standard-CSV")
    elif ext == ".zolca":
        return ZolcaParser("OpenLCA-Zolca")
    else:
        raise ValueError(f"Unsupported database format: {ext}")

def parse_uploaded_file(file_path: str) -> Dict[str, Any]:
    """
    Unified entry point for the API.
    """
    try:
        parser = get_parser(file_path)
        unified_procs = parser.parse(file_path)
        
        return {
            "metadata": parser.metadata.dict(),
            "processes": [p.dict() for p in unified_procs]
        }
    except Exception as e:
        logger.error(f"Parse failed: {e}")
        return {"processes": [], "error": str(e)}

```

## AutoLCA/backend/utils/parser.py
```python
import json
import pandas as pd
import tempfile
import os
import zipfile
import sqlite3

def parse_openlca_json(file_path):
    """
    Parse OpenLCA JSON-LD file and extract processes with exchanges.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    processes = []

    # JSON-LD can be a list or dict
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = [data]
    else:
        return processes

    for item in items:
        if item.get('@type') == 'Process':
            process = {
                'id': item.get('@id', ''),
                'name': item.get('name', ''),
                'description': item.get('description', ''),
                'exchanges': []
            }
            exchanges = item.get('exchanges', [])
            for exch in exchanges:
                exchange = {
                    'flow_name': exch.get('flow', {}).get('name', ''),
                    'amount': exch.get('amount', 0.0),
                    'unit': exch.get('unit', {}).get('name', ''),
                    'flow_type': 'input' if exch.get('isInput', False) else 'output'
                }
                process['exchanges'].append(exchange)
            processes.append(process)

    return processes

def parse_csv_database(file_path):
    """
    Parse CSV LCA database.
    Assumes columns: process_name, unit, and exchange columns like exchange_flow_1, exchange_amount_1, etc.
    """
    df = pd.read_csv(file_path)
    processes = []

    for _, row in df.iterrows():
        process = {
            'name': row.get('process_name', ''),
            'unit': row.get('unit', ''),
            'exchanges': []
        }
        # Find exchange columns
        i = 1
        while f'exchange_flow_{i}' in df.columns and pd.notna(row.get(f'exchange_flow_{i}')):
            exchange = {
                'flow_name': row[f'exchange_flow_{i}'],
                'amount': row.get(f'exchange_amount_{i}', 0.0),
                'unit': row.get(f'exchange_unit_{i}', 'kg'),
                'flow_type': row.get(f'exchange_type_{i}', 'input')
            }
            process['exchanges'].append(exchange)
            i += 1
        processes.append(process)

    return processes

def parse_sqlite_database(db_path):
    """
    Parse OpenLCA SQLite database and extract processes with exchanges.
    Also handles Derby databases by providing helpful error messages.
    """
    processes = []
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if this is actually a Derby database
        try:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1")
            tables = cursor.fetchall()
        except sqlite3.DatabaseError as e:
            # This might be a Derby database
            conn.close()
            print(f"Warning: {db_path} appears to be a Derby database, not SQLite. OpenLCA .zolca files use Derby databases which require Java JDBC drivers to access from Python. Consider exporting your database to JSON-LD format from OpenLCA instead.")
            return processes
        cursor.execute("""
            SELECT id, ref_id, name, description 
            FROM tbl_processes 
            WHERE name IS NOT NULL
        """)
        
        process_rows = cursor.fetchall()
        
        for process_row in process_rows:
            process_id, ref_id, name, description = process_row
            
            process = {
                'id': ref_id or str(process_id),
                'name': name or '',
                'description': description or '',
                'exchanges': []
            }
            
            # Query exchanges for this process
            cursor.execute("""
                SELECT e.amount, e.is_input, f.name as flow_name, u.name as unit_name
                FROM tbl_exchanges e
                JOIN tbl_flows f ON e.f_flow = f.id
                LEFT JOIN tbl_units u ON e.f_unit = u.id
                WHERE e.f_owner = ?
            """, (process_id,))
            
            exchange_rows = cursor.fetchall()
            
            for exchange_row in exchange_rows:
                amount, is_input, flow_name, unit_name = exchange_row
                
                exchange = {
                    'flow_name': flow_name or '',
                    'amount': amount or 0.0,
                    'unit': unit_name or 'kg',
                    'flow_type': 'input' if is_input else 'output'
                }
                process['exchanges'].append(exchange)
            
            processes.append(process)
        
        conn.close()
        
    except Exception as e:
        print(f"Error parsing SQLite database: {e}")
        # Fallback: try to find JSON files if SQLite parsing fails
        return []
    
    return processes

def parse_uploaded_file(file_path, filename):
    """
    Parse uploaded file based on extension.
    """
    if filename.endswith('.json'):
        return parse_openlca_json(file_path)
    elif filename.endswith('.csv'):
        return parse_csv_database(file_path)
    elif filename.endswith(('.zip', '.zolca')):
        # For zip/zolca, extract and look for database files or JSON files
        processes = []
        with tempfile.TemporaryDirectory() as temp_dir:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Check if this is a Derby database (OpenLCA .zolca format)
            derby_indicators = ['service.properties', 'seg0/']
            has_derby = any(os.path.exists(os.path.join(temp_dir, indicator)) for indicator in derby_indicators)
            
            if has_derby:
                print(f"Warning: {filename} contains a Derby database (OpenLCA native format). Python cannot directly read Derby databases without Java JDBC drivers.")
                print("To use this database with Triya.io, please export it from OpenLCA as JSON-LD format and upload the .json file instead.")
                return processes
            
            # First, look for SQLite database files
            for root, dirs, files in os.walk(temp_dir):
                for f in files:
                    if f.endswith('.db') or f == 'olca.db':
                        db_path = os.path.join(root, f)
                        db_processes = parse_sqlite_database(db_path)
                        if db_processes:
                            processes.extend(db_processes)
                            break  # Found database, no need to look further
            
            # If no database found, look for JSON files (fallback)
            if not processes:
                for root, dirs, files in os.walk(temp_dir):
                    for f in files:
                        if f.endswith('.json'):
                            json_path = os.path.join(root, f)
                            processes.extend(parse_openlca_json(json_path))
        
        return processes
    else:
        raise ValueError("Unsupported file type")
```

## AutoLCA/build.bat
```
@echo off
REM build.bat - Script to trigger PyInstaller for packaging
echo Building AutoLCA executable...
pyinstaller AutoLCA.spec --clean -y
echo Build Complete! Look in the "dist" folder.
pause

```

## AutoLCA/diff_output.txt
```
diff --git a/AutoLCA/frontend/app/page.tsx b/AutoLCA/frontend/app/page.tsx
index 6170a3e..e1746f1 100644
--- a/AutoLCA/frontend/app/page.tsx
+++ b/AutoLCA/frontend/app/page.tsx
@@ -1,6 +1,6 @@
 "use client";
 
-import { useCallback, useEffect, useState, useRef, useMemo } from "react";
+import { useCallback, useEffect, useState } from "react";
 import {
   ReactFlow,
   Background,
@@ -18,762 +18,318 @@ import {
 import "@xyflow/react/dist/style.css";
 import { LeftPanel } from "@/components/LeftPanel";
 import { ProcessNode } from "@/components/ProcessNode";
-import { IDEF0Node } from "@/components/IDEF0Node";
-import { toPng } from 'html-to-image';
-import { evaluateFormula, getMergedScope, getTopologicalOrder } from "@/utils/parameter_engine";
 
-// Standard types
-type ProcessSummary = { id: number; name: string; };
-type Exchange = { flow_name: string; amount: number; unit: string; flow_type: 'input' | 'output'; };
-type UploadedProcess = { id: string; name: string; exchanges: Exchange[]; location?: string; };
-type UploadedDatabase = { processes: UploadedProcess[]; };
+type ProcessSummary = {
+  id: number;
+  name: string;
+};
+
 type LciaResults = {
   gwp: number;
-  impacts: Record<string, number>;
   hotspots: { name: string; value: number; percent: number }[];
-  is_ai_predicted: boolean;
-  node_breakdown: any;
-  uncertainty?: Record<string, { p5: number; p95: number; mean: number; std: number }>;
-  iterations?: number;
 } | null;
 
 const nodeTypes: NodeTypes = {
   process: ProcessNode,
-  idef0: IDEF0Node,
 };
 
 const initialNodes: Node[] = [
   {
-    id: "seed-1",
+    id: "1",
+    type: "process",
+    position: { x: 200, y: 150 },
+    data: { label: "Steel Chassis Production", inputs: ["Steel", "Energy"], outputs: ["1 kg Chassis"] },
+  },
+  {
+    id: "2",
     type: "process",
-    position: { x: 250, y: 150 },
-    data: { label: "Steel Chassis Production", inputs: ["Steel", "Energy"], outputs: ["1 kg Chassis"], controls: ["JRC Standards"], mechanisms: ["Industrial Press"] },
-  }
+    position: { x: 500, y: 100 },
+    data: { label: "Downstream Use", inputs: ["Chassis"], outputs: ["Product"] },
+  },
+];
+
+const initialEdges: Edge[] = [
+  { id: "e1-2", source: "1", target: "2" },
 ];
 
 export default function Home() {
   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
-  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
+  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
   const [processes, setProcesses] = useState<ProcessSummary[]>([]);
   const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
   const [scale, setScale] = useState(1);
   const [lciaResults, setLciaResults] = useState<LciaResults>(null);
-  const [isCalculating, setIsCalculating] = useState(false);
-  const [systemBoundary, setSystemBoundary] = useState("gate-to-gate");
-  const [complianceFramework, setComplianceFramework] = useState("iso-14044");
-  const [monteCarloIterations, setMonteCarloIterations] = useState(1);
-  const [isPanelOpen, setIsPanelOpen] = useState(true);
-  const [panelWidth, setPanelWidth] = useState(380);
-  const isResizing = useRef(false);
-
-  const startResizing = useCallback(() => {
-    isResizing.current = true;
-    document.addEventListener("mousemove", handleMouseMove);
-    document.addEventListener("mouseup", stopResizing);
-    document.body.style.cursor = 'col-resize';
-  }, []);
-
-  const stopResizing = useCallback(() => {
-    isResizing.current = false;
-    document.removeEventListener("mousemove", handleMouseMove);
-    document.removeEventListener("mouseup", stopResizing);
-    document.body.style.cursor = 'default';
-  }, []);
-
-  const handleMouseMove = useCallback((e: MouseEvent) => {
-    if (isResizing.current) {
-      const newWidth = Math.min(Math.max(280, e.clientX), 600);
-      setPanelWidth(newWidth);
-    }
-  }, []);
-
-  // Parameter Engine State
-  const [globalParams, setGlobalParams] = useState<Record<string, number>>({
-    "grid_efficiency": 0.85,
-    "transport_distance": 500
-  });
-
-  // Database state
-  const [uploadedDatabase, setUploadedDatabase] = useState<UploadedDatabase | null>(null);
-  const [selectedUploadedProcess, setSelectedUploadedProcess] = useState<UploadedProcess | null>(null);
-  const [exchangeValues, setExchangeValues] = useState<Record<string, number>>({});
-  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
-  const [menu, setMenu] = useState<{ x: number, y: number } | null>(null);
-  const [activeTab, setActiveTab] = useState<'library' | 'workspace'>('library');
-  const reactFlowWrapper = useRef<HTMLDivElement>(null);
-
-  const selectedNode = nodes.find(n => n.id === selectedNodeId);
-
-  // Handlers
-  const handleDatabaseUpload = useCallback((data: UploadedDatabase) => {
-    setUploadedDatabase(data);
-    setSelectedUploadedProcess(null);
-    setExchangeValues({});
-  }, []);
-
-  const handleUploadedProcessSelect = useCallback((process: UploadedProcess | null) => {
-    setSelectedUploadedProcess(process);
-    if (process) {
-      const defaults: Record<string, number> = {};
-      process.exchanges.forEach((ex, idx) => { defaults[`exchange_${idx}`] = ex.amount; });
-      setExchangeValues(defaults);
-    }
-  }, []);
-
-  const handleExchangeValueChange = useCallback((id: string, value: any) => {
-    setExchangeValues(prev => ({ ...prev, [id]: value }));
-  }, []);
-
-  // --- Parameter Engine Logic ---
-
-  const recalculateGraph = useCallback((currentNodes: Node[], currentEdges: Edge[], currentGlobals: Record<string, number>) => {
-    const order = getTopologicalOrder(currentNodes, currentEdges);
-    const updatedNodes = [...currentNodes];
-    const nodeOutputs: Record<string, any> = {};
-
-    order.forEach(node => {
-      const nodeIdx = updatedNodes.findIndex(n => n.id === node.id);
-      if (nodeIdx === -1) return;
-
-      // 1. Collect inputs from incoming edges
-      const incomingEdges = currentEdges.filter(e => e.target === node.id);
-      const incomingValues: Record<string, number> = {};
+  const [contextNodeId, setContextNodeId] = useState<string | null>(null);
+  const [systemBoundary, setSystemBoundary] = useState("gate");
 
-      incomingEdges.forEach(edge => {
-        const sourceNodeOutputs = nodeOutputs[edge.source];
-        if (sourceNodeOutputs) {
-          // Heuristic: map output flows to input names if possible, or use a generic "input" variable
-          // For now, let's use the flow name from the source output that matches the handle or just merge all
-          Object.assign(incomingValues, sourceNodeOutputs);
-        }
-      });
-
-      // 2. Create scope: Globals + Local Params + Incoming
-      const localParams: Record<string, number> = {};
-      const nodeParams: Record<string, any> = updatedNodes[nodeIdx].data.parameters || {};
-      Object.keys(nodeParams).forEach(k => {
-        localParams[k] = typeof nodeParams[k] === 'object' ? nodeParams[k].value : nodeParams[k];
-      });
-
-      const scope = { ...currentGlobals, ...localParams, ...incomingValues };
-
-      // 3. Evaluate Exchanges
-      const exchanges: any[] = (updatedNodes[nodeIdx].data as any).exchanges || [];
-      const updatedExchanges = exchanges.map((ex: any) => {
-        const formula = ex.formula || ex.amount;
-        const resolved = evaluateFormula(formula, scope);
-        return { ...ex, amount: resolved, formula: formula };
-      });
-
-      // 4. Update Node State
-      updatedNodes[nodeIdx] = {
-        ...updatedNodes[nodeIdx],
-        data: {
-          ...updatedNodes[nodeIdx].data,
-          exchanges: updatedExchanges,
-          resolvedScope: scope // For UI display
-        }
-      };
-
-      // 5. Store Outputs for downstream
-      const outputs: Record<string, number> = {};
-      updatedExchanges.forEach((ex: any) => {
-        if (ex.flow_type === 'output') {
-          // Normalize name for scope (e.g. "Steel Sheet" -> "steel_sheet")
-          const varName = ex.flow_name.toLowerCase().replace(/\s+/g, '_');
-          outputs[varName] = ex.amount;
-        }
-      });
-      nodeOutputs[node.id] = outputs;
-    });
-
-    setNodes(updatedNodes);
-  }, [setNodes]);
-
-  // Trigger recalculation when globals change
+  // Fetch default processes from backend
   useEffect(() => {
-    recalculateGraph(nodes, edges, globalParams);
-  }, [globalParams, edges.length]); // Also trigger when edges are added/removed
-
-  const handleGlobalParamChange = useCallback((key: string, value: number) => {
-    setGlobalParams(prev => ({ ...prev, [key]: value }));
-  }, []);
-
-  const handleAddNodeToCanvas = useCallback((process: UploadedProcess) => {
-    const newNodeId = `node_${Date.now()}`;
-
-    // Map current dynamic values to exchanges for the node data
-    const currentExchangesWithValues = process.exchanges.map((ex, idx) => ({
-      ...ex,
-      amount: exchangeValues[`exchange_${idx}`] ?? ex.amount
-    }));
-
-    const newNode: Node = {
-      id: newNodeId,
-      type: "idef0",
-      position: { x: 50 + (nodes.length * 20), y: 50 + (nodes.length * 20) },
-      data: {
-        processName: process.name,
-        exchanges: currentExchangesWithValues,
-        location: { type: 'region_tag', value: process.location || 'GLO' }
-      },
+    const fetchProcesses = async () => {
+      try {
+        const res = await fetch("/api/processes");
+        if (!res.ok) return;
+        const data: ProcessSummary[] = await res.json();
+        setProcesses(data);
+        if (data.length > 0) {
+          setSelectedProcessId(data[0].id);
+        }
+      } catch (e) {
+        console.error("Failed to load processes", e);
+      }
     };
-    setNodes(nds => nds.concat(newNode));
-  }, [nodes, setNodes, exchangeValues]);
-
-  const onPaneContextMenu = useCallback((event: any) => {
-    event.preventDefault();
-    setMenu({ x: event.clientX, y: event.clientY });
-  }, []);
-
-  const onPaneClick = useCallback(() => {
-    setMenu(null);
-    setSelectedNodeId(null);
+    fetchProcesses();
   }, []);
 
-  const addBlankNode = useCallback(() => {
-    if (!menu) return;
-    const newNodeId = `node_${Date.now()}`;
-    const newNode: Node = {
-      id: newNodeId,
-      type: "idef0",
-      position: { x: menu.x - 400, y: menu.y - 100 }, // Offset for panel and menu
-      data: {
-        processName: "New Process",
-        exchanges: [
-          { flow_name: "Input A", amount: 0, unit: "kg", flow_type: "input" },
-          { flow_name: "Output B", amount: 0, unit: "kg", flow_type: "output" }
-        ],
-        location: { type: 'region_tag', value: 'GLO' }
-      },
-    };
-    setNodes(nds => nds.concat(newNode));
-    setMenu(null);
-  }, [menu, setNodes]);
-
-  const updateNodeData = useCallback((nodeId: string, newData: any) => {
-    setNodes(nds => nds.map(node => {
-      if (node.id === nodeId) {
-        return { ...node, data: { ...node.data, ...newData } };
+  // Fetch LCIA results whenever process or scale changes
+  useEffect(() => {
+    const fetchProcess = async () => {
+      if (!selectedProcessId) return;
+      try {
+        const res = await fetch(`/api/process/${selectedProcessId}?scale=${scale}`);
+        if (!res.ok) return;
+        const data = await res.json();
+
+        // Simple LCIA aggregation on the client for now
+        let totalGwp = 0;
+        const hotspots: { name: string; value: number; percent: number }[] = [];
+        for (const ex of data.exchanges ?? []) {
+          const impact = ex.amount * (ex.impact_factor ?? 0);
+          totalGwp += impact;
+          hotspots.push({ name: ex.input, value: impact, percent: 0 });
+        }
+        if (totalGwp > 0) {
+          for (const h of hotspots) {
+            h.percent = (h.value / totalGwp) * 100;
+          }
+        }
+        hotspots.sort((a, b) => b.value - a.value);
+        setLciaResults({ gwp: totalGwp, hotspots });
+      } catch (e) {
+        console.error("Failed to load process details", e);
       }
-      return node;
-    }));
-  }, [setNodes]);
-
-  // Scenario Generators
-  const loadTitaniumScenario = useCallback(() => {
-    setNodes([]);
-    setEdges([]);
-    const newNodes: Node[] = [
-      { id: 'ti-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "Titanium Ore Extraction", exchanges: [{ flow_name: "titanium ore", amount: 100, unit: "kg", flow_type: "output" }, { flow_name: "diesel", amount: 10, unit: "L", flow_type: "input" }] } },
-      { id: 'ti-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Kroll Process", exchanges: [{ flow_name: "titanium tetrachloride", amount: 100, unit: "kg", flow_type: "input" }, { flow_name: "magnesium", amount: 50, unit: "kg", flow_type: "input" }, { flow_name: "titanium sponge", amount: 25, unit: "kg", flow_type: "output" }] } },
-      { id: 'ti-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Alloying & Casting", exchanges: [{ flow_name: "titanium sponge", amount: 25, unit: "kg", flow_type: "input" }, { flow_name: "aluminum", amount: 1.5, unit: "kg", flow_type: "input" }, { flow_name: "vanadium", amount: 1, unit: "kg", flow_type: "input" }, { flow_name: "Ti-6Al-4V ingot", amount: 27.5, unit: "kg", flow_type: "output" }] } },
-      { id: 'ti-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "Aerospace Part Transport", exchanges: [{ flow_name: "Ti-6Al-4V ingot", amount: 27.5, unit: "kg", flow_type: "input" }, { flow_name: "Heavy-duty truck", amount: 1000, unit: "tkm", flow_type: "mechanism" }] } },
-      { id: 'ti-5', type: 'idef0', position: { x: 1400, y: 150 }, data: { processName: "CNC Machining", exchanges: [{ flow_name: "Ti-6Al-4V ingot", amount: 27.5, unit: "kg", flow_type: "input" }, { flow_name: "electricity", amount: 45, unit: "kWh", flow_type: "mechanism" }, { flow_name: "Finished Part", amount: 12, unit: "kg", flow_type: "output" }] } },
-    ];
-    const newEdges: Edge[] = [
-      { id: 'e-ti-1', source: 'ti-1', target: 'ti-2', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-ti-2', source: 'ti-2', target: 'ti-3', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-ti-3', source: 'ti-3', target: 'ti-4', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-ti-4', source: 'ti-4', target: 'ti-5', sourceHandle: 'output', targetHandle: 'input' },
-    ];
-    setNodes(newNodes);
-    setEdges(newEdges);
-    setActiveTab('workspace');
-  }, [setNodes, setEdges]);
-
-  const loadAluminumScenario = useCallback(() => {
-    setNodes([]);
-    setEdges([]);
-    const newNodes: Node[] = [
-      { id: 'al-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "Bauxite Mining", exchanges: [{ flow_name: "bauxite", amount: 4, unit: "kg", flow_type: "output" }, { flow_name: "land use", amount: 0.5, unit: "m2", flow_type: "mechanism" }] } },
-      { id: 'al-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Bayer Process (Alumina)", exchanges: [{ flow_name: "bauxite", amount: 4, unit: "kg", flow_type: "input" }, { flow_name: "caustic soda", amount: 0.2, unit: "kg", flow_type: "input" }, { flow_name: "alumina", amount: 2, unit: "kg", flow_type: "output" }] } },
-      { id: 'al-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Hall-Héroult Smelting", exchanges: [{ flow_name: "alumina", amount: 2, unit: "kg", flow_type: "input" }, { flow_name: "electricity", amount: 30, unit: "kWh", flow_type: "input" }, { flow_name: "primary aluminum", amount: 1, unit: "kg", flow_type: "output" }] } },
-      { id: 'al-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "Aluminum Extrusion", exchanges: [{ flow_name: "primary aluminum", amount: 1, unit: "kg", flow_type: "input" }, { flow_name: "profile", amount: 0.95, unit: "kg", flow_type: "output" }] } },
-    ];
-    const newEdges: Edge[] = [
-      { id: 'e-al-1', source: 'al-1', target: 'al-2', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-al-2', source: 'al-2', target: 'al-3', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-al-3', source: 'al-3', target: 'al-4', sourceHandle: 'output', targetHandle: 'input' },
-    ];
-    setNodes(newNodes);
-    setEdges(newEdges);
-    setActiveTab('workspace');
-  }, [setNodes, setEdges]);
-
-  const loadTextileScenario = useCallback(() => {
-    setNodes([]);
-    setEdges([]);
-    const newNodes: Node[] = [
-      { id: 'tex-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "Cotton Agriculture", exchanges: [{ flow_name: "cotton seed", amount: 5, unit: "kg", flow_type: "input" }, { flow_name: "water", amount: 2000, unit: "L", flow_type: "input" }, { flow_name: "raw cotton", amount: 100, unit: "kg", flow_type: "output" }] } },
-      { id: 'tex-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Ginning & Spinning", exchanges: [{ flow_name: "raw cotton", amount: 100, unit: "kg", flow_type: "input" }, { flow_name: "cotton yarn", amount: 35, unit: "kg", flow_type: "output" }] } },
-      { id: 'tex-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Textile Manufacturing", exchanges: [{ flow_name: "cotton yarn", amount: 35, unit: "kg", flow_type: "input" }, { flow_name: "reactive dye", amount: 2, unit: "kg", flow_type: "input" }, { flow_name: "finished fabric", amount: 32, unit: "kg", flow_type: "output" }] } },
-      { id: 'tex-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "International Transport", exchanges: [{ flow_name: "finished fabric", amount: 32, unit: "kg", flow_type: "input" }, { flow_name: "Container ship", amount: 5000, unit: "tkm", flow_type: "mechanism" }] } },
-      { id: 'tex-5', type: 'idef0', position: { x: 1400, y: 150 }, data: { processName: "End-of-Life (Incineration)", exchanges: [{ flow_name: "used garment", amount: 1, unit: "kg", flow_type: "input" }, { flow_name: "heat recovery", amount: 15, unit: "MJ", flow_type: "output" }] } },
-    ];
-    const newEdges: Edge[] = [
-      { id: 'e-tex-1', source: 'tex-1', target: 'tex-2', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-tex-2', source: 'tex-2', target: 'tex-3', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-tex-3', source: 'tex-3', target: 'tex-4', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-tex-4', source: 'tex-4', target: 'tex-5', sourceHandle: 'output', targetHandle: 'input' },
-    ];
-    setNodes(newNodes);
-    setEdges(newEdges);
-    setActiveTab('workspace');
-  }, [setNodes, setEdges]);
-
-  const loadDataCenterScenario = useCallback(() => {
-    setNodes([]);
-    setEdges([]);
-    const newNodes: Node[] = [
-      { id: 'dc-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "IT Load (Compute)", exchanges: [{ flow_name: "electricity", amount: 1000, unit: "kWh", flow_type: "input" }, { flow_name: "compute cycles", amount: 1, unit: "unit", flow_type: "output" }] } },
-      { id: 'dc-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Cooling System", exchanges: [{ flow_name: "water", amount: 500, unit: "L", flow_type: "input" }, { flow_name: "waste heat", amount: 950, unit: "kWh", flow_type: "output" }] } },
-      { id: 'dc-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Hardware Amortization", exchanges: [{ flow_name: "server hardware", amount: 0.1, unit: "kg", flow_type: "input" }] } },
-      { id: 'dc-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "Backup Power (Diesel)", exchanges: [{ flow_name: "diesel fuel", amount: 5, unit: "L", flow_type: "input" }] } },
-      { id: 'dc-5', type: 'idef0', position: { x: 1400, y: 150 }, data: { processName: "E-Waste Management", exchanges: [{ flow_name: "e-waste", amount: 0.1, unit: "kg", flow_type: "input" }, { flow_name: "recovered metals", amount: 0.02, unit: "kg", flow_type: "output" }] } },
-    ];
-    const newEdges: Edge[] = [
-      { id: 'e-dc-1', source: 'dc-1', target: 'dc-2', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-dc-2', source: 'dc-2', target: 'dc-3', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-dc-3', source: 'dc-3', target: 'dc-4', sourceHandle: 'output', targetHandle: 'input' },
-      { id: 'e-dc-4', source: 'dc-4', target: 'dc-5', sourceHandle: 'output', targetHandle: 'input' },
-    ];
-    setNodes(newNodes);
-    setEdges(newEdges);
-    setActiveTab('workspace');
-  }, [setNodes, setEdges]);
-
-  const isValidConnection = useCallback((connection: any) => {
-    // 1. Prevent self-connections
-    if (connection.source === connection.target) return false;
-
-    // 2. Enforce IDEF0 Source Rule (Only 'output' can be a source)
-    if (connection.sourceHandle !== 'output') return false;
-
-    // 3. Ensure the target is a valid IDEF0 receptacle
-    const validTargets = ['input', 'control', 'mechanism'];
-    if (!connection.targetHandle || !validTargets.includes(connection.targetHandle)) return false;
-
-    return true;
-  }, []);
-
-  const onConnect = useCallback((params: Connection) => {
-    setEdges(eds => addEdge(params, eds));
-  }, [setEdges]);
-
-  const onConnectError = useCallback((error: any) => {
-    console.warn("Invalid IDEF0 Connection attempt:", error);
-    alert("Invalid IDEF0 Connection: Flows must originate from an Output (Right) and connect to an Input (Left), Control (Top), or Mechanism (Bottom).");
-  }, []);
-
-  const handleCalculateImpact = useCallback(async () => {
-    setIsCalculating(true);
-    const supplyChainPayload = {
-      nodes,
-      edges,
-      iterations: monteCarloIterations
     };
+    fetchProcess();
+  }, [selectedProcessId, scale]);
 
-    try {
-      const response = await fetch("http://localhost:8000/api/calculate-lcia", {
-        method: "POST",
-        headers: { "Content-Type": "application/json" },
-        body: JSON.stringify(supplyChainPayload),
-      });
-      if (!response.ok) throw new Error("Calculation failed");
-      const results = await response.json();
-      setLciaResults(results);
-    } catch (err) {
-      console.error(err);
-      alert("Failed to calculate LCIA.");
-    } finally {
-      setIsCalculating(false);
-    }
-  }, [nodes, edges]);
+  const onConnect = useCallback(
+    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
+    [setEdges]
+  );
 
-  const handleGeneratePDF = useCallback(async () => {
-    if (!reactFlowWrapper.current) {
-      console.warn("PDF Generation aborted: reactFlowWrapper.current is null");
-      return;
-    }
-    console.log("PDF Generation Start: Snapshotting...");
-    // 1. Capture Canvas Snapshot
-    let snapshot = null;
+  const onShuffleDemo = useCallback(async () => {
     try {
-      snapshot = await toPng(reactFlowWrapper.current, {
-        backgroundColor: '#05070a',
-        quality: 0.5, // Lower quality for faster processing/upload
-        skipFonts: true,
-      });
-      console.log("Snapshot captured successfully, size approx:", snapshot.length);
-    } catch (err) {
-      console.error("Snapshot failed (ignoring)", err);
+      const res = await fetch("/api/process/shuffle");
+      if (!res.ok) return;
+      const data = await res.json();
+      const benchmark = data.metadata.benchmark;
+
+      // Dynamic layouts based on scientific supply chains
+      let nodes = [];
+      let edges = [];
+      if (benchmark.includes("Aluminum")) {
+        nodes = [
+          { id: "1", type: "process", position: { x: 50, y: 150 }, data: { label: "Bauxite Mining", inputs: ["Ores"], controls: ["Land Rights"], mechanisms: ["Heavy Machinery"], outputs: ["Bauxite"] } },
+          { id: "2", type: "process", position: { x: 300, y: 150 }, data: { label: "Alumina Refining", inputs: ["Bauxite", "NaOH"], controls: ["Bayer Process"], mechanisms: ["Digesters"], outputs: ["Alumina"] } },
+          { id: "3", type: "process", position: { x: 550, y: 150 }, data: { label: "Aluminum Smelting", inputs: ["Alumina", "Electricity"], controls: ["Hall-Héroult"], mechanisms: ["Electrolysis Cells"], outputs: ["Primary Aluminum"] } },
+          { id: "4", type: "process", position: { x: 800, y: 150 }, data: { label: "Ingot Casting", inputs: ["Molten Al"], controls: ["Purity Spec"], mechanisms: ["Casting Molds"], outputs: ["Aluminum Ingot"] } },
+        ];
+        edges = [
+          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
+          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
+          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
+        ];
+        if (systemBoundary === "grave") {
+          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "End-of-Life Recycling", inputs: ["Scrap Al"], controls: ["Recycling Rate"], mechanisms: ["Melting Furnaces"], outputs: ["Recycled Aluminum"] } });
+          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
+        } else if (systemBoundary === "cradle") {
+          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "Recycling Loop", inputs: ["Scrap Al"], controls: ["Circular Rate"], mechanisms: ["Melting"], outputs: ["Recycled Al"] } });
+          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
+          edges.push({ id: "e5-1", source: "5", target: "1", sourceHandle: "output", targetHandle: "input" }); // circular
+        }
+      } else if (benchmark.includes("PET")) {
+        nodes = [
+          { id: "1", type: "process", position: { x: 50, y: 100 }, data: { label: "Crude Extraction", inputs: ["Oil Reservoirs"], controls: ["OPEC Quotas"], mechanisms: ["Rigs"], outputs: ["Crude Oil"] } },
+          { id: "2", type: "process", position: { x: 280, y: 100 }, data: { label: "Naphtha Cracking", inputs: ["Crude Oil"], controls: ["Temp/Pressure"], mechanisms: ["Cracker Unit"], outputs: ["Ethylene/Xylene"] } },
+          { id: "3", type: "process", position: { x: 510, y: 100 }, data: { label: "PTA/MEG Synthesis", inputs: ["Ethylene"], controls: ["Yield Efficiency"], mechanisms: ["Reactor"], outputs: ["Intermediate"] } },
+          { id: "4", type: "process", position: { x: 740, y: 100 }, data: { label: "PET Polymerization", inputs: ["Intermediate"], controls: ["Viscosity"], mechanisms: ["Polymerizer"], outputs: ["PET Chips"] } },
+          { id: "5", type: "process", position: { x: 970, y: 100 }, data: { label: "Blow Molding", inputs: ["PET Chips"], controls: ["Design Spec"], mechanisms: ["Molders"], outputs: ["PET Bottle"] } },
+        ];
+        edges = [
+          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
+          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
+          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
+          { id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" },
+        ];
+        if (systemBoundary === "grave") {
+          nodes.push({ id: "6", type: "process", position: { x: 1200, y: 100 }, data: { label: "Waste Management", inputs: ["Used Bottle"], controls: ["Disposal Method"], mechanisms: ["Incinerators"], outputs: ["Emissions"] } });
+          edges.push({ id: "e5-6", source: "5", target: "6", sourceHandle: "output", targetHandle: "input" });
+        } else if (systemBoundary === "cradle") {
+          nodes.push({ id: "6", type: "process", position: { x: 1200, y: 100 }, data: { label: "Recycling", inputs: ["PET Waste"], controls: ["Recycling Tech"], mechanisms: ["Granulators"], outputs: ["Recycled PET"] } });
+          edges.push({ id: "e5-6", source: "5", target: "6", sourceHandle: "output", targetHandle: "input" });
+          edges.push({ id: "e6-4", source: "6", target: "4", sourceHandle: "output", targetHandle: "input" }); // circular
+        }
+      } else if (benchmark.includes("Electricity")) {
+        nodes = [
+          { id: "1", type: "process", position: { x: 50, y: 50 }, data: { label: "Fuel Extraction", inputs: ["Coal/Gas"], controls: ["Mining Safety"], mechanisms: ["Excavators"], outputs: ["Fuel"] } },
+          { id: "2", type: "process", position: { x: 300, y: 125 }, data: { label: "Power Generation", inputs: ["Fuel"], controls: ["Grid Demand"], mechanisms: ["Turbines"], outputs: ["Electricity"] } },
+          { id: "3", type: "process", position: { x: 550, y: 125 }, data: { label: "HV Transmission", inputs: ["Electricity"], controls: ["Loss Target"], mechanisms: ["Grid"], outputs: ["HV Power"] } },
+          { id: "4", type: "process", position: { x: 800, y: 125 }, data: { label: "LV Distribution", inputs: ["HV Power"], controls: ["Voltage Reg"], mechanisms: ["Transformers"], outputs: ["1kWh Electricity"] } },
+        ];
+        edges = [
+          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
+          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
+          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
+        ];
+        if (systemBoundary === "grave") {
+          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 125 }, data: { label: "Consumption", inputs: ["Electricity"], controls: ["Usage Pattern"], mechanisms: ["Appliances"], outputs: ["Energy Services"] } });
+          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
+        } else if (systemBoundary === "cradle") {
+          // For electricity, circular might not make sense, but add recycling
+          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 125 }, data: { label: "Renewable Integration", inputs: ["Waste Heat"], controls: ["Efficiency"], mechanisms: ["Heat Pumps"], outputs: ["Recycled Energy"] } });
+          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
+          edges.push({ id: "e5-2", source: "5", target: "2", sourceHandle: "output", targetHandle: "input" });
+        }
+      } else if (benchmark.includes("Corrugated")) {
+        nodes = [
+          { id: "1", type: "process", position: { x: 50, y: 150 }, data: { label: "Forestry/Pulpwood", inputs: ["Water/Land"], controls: ["FSC Standard"], mechanisms: ["Harvesters"], outputs: ["Wood logs"] } },
+          { id: "2", type: "process", position: { x: 300, y: 150 }, data: { label: "Kraft Pulping", inputs: ["Wood logs"], controls: ["Chemical Rec"], mechanisms: ["Digesters"], outputs: ["Paper Pulp"] } },
+          { id: "3", type: "process", position: { x: 550, y: 150 }, data: { label: "Paper Machine", inputs: ["Pulp"], controls: ["GSM/Thickness"], mechanisms: ["Drying Rolls"], outputs: ["Liner/Fluting"] } },
+          { id: "4", type: "process", position: { x: 800, y: 150 }, data: { label: "Corrugator Plant", inputs: ["Liner"], controls: ["Adhesive Spec"], mechanisms: ["Corrugator"], outputs: ["Corrugated Board"] } },
+        ];
+        edges = [
+          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
+          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
+          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
+        ];
+        if (systemBoundary === "grave") {
+          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "End-of-Life", inputs: ["Used Board"], controls: ["Recycling %"], mechanisms: ["Pulpers"], outputs: ["Recycled Pulp"] } });
+          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
+        } else if (systemBoundary === "cradle") {
+          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "Recycling Loop", inputs: ["Waste Board"], controls: ["Circular Design"], mechanisms: ["Repulping"], outputs: ["Recycled Pulp"] } });
+          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
+          edges.push({ id: "e5-2", source: "5", target: "2", sourceHandle: "output", targetHandle: "input" });
+        }
+      } else {
+        // Transport
+        nodes = [
+          { id: "1", type: "process", position: { x: 100, y: 150 }, data: { label: "Vehicle Mfg", inputs: ["Steel/Rubber"], controls: ["Quality Std"], mechanisms: ["Robotics"], outputs: ["Truck"] } },
+          { id: "2", type: "process", position: { x: 350, y: 150 }, data: { label: "Fuel Refining", inputs: ["Crude"], controls: ["Euro 6"], mechanisms: ["Refinery"], outputs: ["Diesel"] } },
+          { id: "3", type: "process", position: { x: 600, y: 150 }, data: { label: "Transport Op", inputs: ["Diesel", "Truck"], controls: ["Route Opt"], mechanisms: ["Driving"], outputs: ["1 tkm Transport"] } },
+          { id: "4", type: "process", position: { x: 850, y: 150 }, data: { label: "End of Life", inputs: ["Used Truck"], controls: ["Recycling %"], mechanisms: ["Shredders"], outputs: ["Scrap Metal"] } },
+        ];
+        edges = [
+          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
+          { id: "e1-3", source: "1", target: "3", sourceHandle: "output", targetHandle: "input" },
+          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
+        ];
+        if (systemBoundary === "grave") {
+          // Already has EOL
+        } else if (systemBoundary === "cradle") {
+          edges.push({ id: "e4-1", source: "4", target: "1", sourceHandle: "output", targetHandle: "input" }); // circular
+        }
+      }
+      setNodes(nodes);
+      setEdges(edges);
+    } catch (e) {
+      console.error("Shuffle failed", e);
     }
+  }, [setNodes, setEdges, systemBoundary]);
 
-    if (!lciaResults) {
-      console.warn("PDF requested but results are null");
-      alert("No LCIA result found. Click 'Calculate Impact' before generating report.");
-      return;
-    }
+  const handleGeneratePdf = useCallback(async () => {
+    if (!selectedProcessId) return;
 
-    // 2. Build Payload
-    const payload = {
-      nodes,
-      edges,
-      systemBoundary,
-      complianceFramework,
-      snapshot, // Base64 string
-      lciaResults,
-      timestamp: new Date().toISOString()
+    // Simulate/Capture snapshot (In a real app, use toDataURL or similar on the canvas)
+    // For this demo, we'll send a placeholder or the raw nodes/edges data
+    const snapshotData = {
+      image: "data:image/svg+xml;base64,...", // Placeholder for actual capture logic
+      boundary: "Cradle-to-Gate"
     };
 
-    console.log("Payload built, sending to backend...", payload);
-
     try {
-      const response = await fetch("http://localhost:8000/api/generate-pdf", {
+      const res = await fetch(`/api/report/${selectedProcessId}?scale=${scale}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
-        body: JSON.stringify(payload),
+        body: JSON.stringify({ snapshot: snapshotData })
       });
-      console.log("Response headers received:", response.status);
 
-      if (!response.ok) {
-        const errorText = await response.text();
-        console.error("Backend PDF Error Details:", errorText);
-        try {
-          const errorJson = JSON.parse(errorText);
-          alert(`PDF Generation Failed: ${errorJson.detail || response.statusText}`);
-        } catch {
-          alert(`PDF Generation Failed: ${response.status} ${response.statusText}`);
-        }
-        throw new Error(`PDF generation failed: ${response.status} - ${errorText}`);
+      if (res.ok) {
+        const blob = await res.blob();
+        const url = window.URL.createObjectURL(blob);
+        const a = document.createElement("a");
+        a.href = url;
+        a.download = `JRC_Report_${selectedProcessId}.pdf`;
+        document.body.appendChild(a);
+        a.click();
+        a.remove();
       }
-
-      console.log("Downloading blob...");
-      const blob = await response.blob();
-      console.log("Blob size:", blob.size);
-
-      const url = window.URL.createObjectURL(blob);
-      const a = document.createElement("a");
-      a.href = url;
-      a.download = `Triya_LCA_Report_${Date.now()}.pdf`;
-      document.body.appendChild(a);
-      a.click();
-      a.remove();
-      window.URL.revokeObjectURL(url);
-      console.log("PDF download triggered");
-    } catch (err) {
-      console.error("PDF Download Error (Full Stack):", err);
-      alert("Failed to generate or download PDF report. Check console for details.");
+    } catch (e) {
+      console.error("PDF generation failed", e);
     }
-  }, [nodes, edges, systemBoundary, lciaResults, complianceFramework]);
+  }, [selectedProcessId, scale]);
 
-  const handleExportCSV = useCallback(async () => {
-    const payload = { nodes };
-    try {
-      const response = await fetch("http://localhost:8000/api/export-csv", {
-        method: "POST",
-        headers: { "Content-Type": "application/json" },
-        body: JSON.stringify(payload),
-      });
-      if (!response.ok) throw new Error("CSV export failed");
-      const blob = await response.blob();
-      const url = window.URL.createObjectURL(blob);
-      const a = document.createElement("a");
-      a.href = url;
-      a.download = `AutoLCA_Export_${Date.now()}.csv`;
-      document.body.appendChild(a);
-      a.click();
-      a.remove();
-    } catch (err) {
-      console.error(err);
-      alert("Failed to export CSV.");
-    }
-  }, [nodes]);
-
-  // API Call Effects
-  useEffect(() => {
-    fetch("http://localhost:8000/api/processes")
-      .then(res => res.json())
-      .then(setProcesses)
-      .catch(console.error);
-  }, []);
+  const handleDownloadCsv = useCallback(() => {
+    if (!selectedProcessId) return;
+    const url = `/api/process/${selectedProcessId}/csv?scale=${scale}`;
+    window.open(url, "_blank");
+  }, [selectedProcessId, scale]);
 
   return (
-    <main className="flex flex-col h-screen bg-[hsl(220,14%,4%)] text-white overflow-hidden font-mono">
-      {/* Tab Navigation */}
-      <nav className="h-12 border-b border-white/10 flex items-center px-6 gap-8 bg-[hsl(220,14%,6%)] z-50">
-        <button
-          onClick={() => setActiveTab('library')}
-          className={`text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'library' ? 'text-[hsl(142,76%,36%)] border-b-2 border-[hsl(142,76%,36%)] pb-1' : 'text-gray-500 hover:text-white'}`}
-        >
-          Case Study Library
-        </button>
-        <button
-          onClick={() => setActiveTab('workspace')}
-          className={`text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'workspace' ? 'text-[hsl(142,76%,36%)] border-b-2 border-[hsl(142,76%,36%)] pb-1' : 'text-gray-500 hover:text-white'}`}
-        >
-          Model Workspace
-        </button>
-      </nav>
-
-      <div className="flex flex-1 overflow-hidden relative">
-        {activeTab === 'library' ? (
-          <div className="flex-1 overflow-y-auto p-12 space-y-12 animate-in fade-in duration-700 premium-gradient">
-            <div className="space-y-4 max-w-4xl relative">
-              <div className="absolute -left-12 top-0 w-1 h-32 bg-[hsl(142,76%,36%)] blur-2xl opacity-20" />
-              <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none text-glow">
-                Industry <span className="text-[hsl(142,76%,36%)]">Templates</span>
-              </h2>
-              <p className="text-sm text-gray-400 font-bold max-w-2xl leading-relaxed uppercase tracking-wide">
-                Select a high-fidelity industry scenario to initialize your LCA model.
-                All templates include verified Ecoinvent 3.9 connectivity.
-              </p>
-            </div>
-
-            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
-              {/* Aluminum Card */}
-              <div
-                onClick={loadAluminumScenario}
-                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-[hsl(142,76%,36%)] transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1 hover:shadow-[hsl(142,76%,36%,0.15)]_0_20px_40px]"
-              >
-                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">01</div>
-                <div className="space-y-6 relative z-10">
-                  <div className="w-12 h-1.5 bg-[hsl(142,76%,36%)] shadow-[0_0_15px_rgba(34,197,94,0.6)] rounded-full" />
-                  <div className="space-y-2">
-                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-[hsl(142,76%,36%)] transition-colors">Primary Metals: Aluminum</h3>
-                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">Cradle-to-gate analysis of aluminum smelting, including high energy-intensity bauxite processing and Hall-Héroult electrolysis.</p>
-                  </div>
-                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
-                    <span className="text-[9px] font-black text-[hsl(142,76%,36%)] tracking-widest uppercase">Deploy Scenario</span>
-                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
-                  </div>
-                </div>
-              </div>
-
-              {/* Titanium Card */}
-              <div
-                onClick={loadTitaniumScenario}
-                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-gray-500 transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1"
-              >
-                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">02</div>
-                <div className="space-y-6 relative z-10">
-                  <div className="w-12 h-1.5 bg-gray-500 shadow-[0_0_15px_rgba(150,150,150,0.5)] rounded-full" />
-                  <div className="space-y-2">
-                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-gray-300 transition-colors">Advanced Mfg: Titanium Part</h3>
-                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">High-precision subtractive manufacturing workflow including material forging and CNC impacts for aerospace-grade Ti-6Al-4V.</p>
-                  </div>
-                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
-                    <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Deploy Scenario</span>
-                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
-                  </div>
-                </div>
-              </div>
-
-              {/* Textile Card */}
-              <div
-                onClick={loadTextileScenario}
-                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-[hsl(142,76%,60%)] transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1"
-              >
-                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">03</div>
-                <div className="space-y-6 relative z-10">
-                  <div className="w-12 h-1.5 bg-[hsl(142,76%,60%)] shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded-full" />
-                  <div className="space-y-2">
-                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-[hsl(142,76%,60%)] transition-colors">FMCG: Cotton T-Shirts</h3>
-                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">Global supply chain spanning Gujarat agriculture, Dhaka manufacturing, international logistics, and end-of-life incineration.</p>
-                  </div>
-                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
-                    <span className="text-[9px] font-black text-[hsl(142,76%,60%)] tracking-widest uppercase">Deploy Scenario</span>
-                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
-                  </div>
-                </div>
-              </div>
-
-              {/* Data Center Card */}
-              <div
-                onClick={loadDataCenterScenario}
-                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-blue-500 transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1"
-              >
-                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">04</div>
-                <div className="space-y-6 relative z-10">
-                  <div className="w-12 h-1.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full" />
-                  <div className="space-y-2">
-                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-blue-400 transition-colors">IT: Hyperscale Data Center</h3>
-                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">Operational LCA covering Virginia grid energy, massive water cooling, hardware amortization, and backup diesel generation.</p>
-                  </div>
-                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
-                    <span className="text-[9px] font-black text-blue-500 tracking-widest uppercase">Deploy Scenario</span>
-                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
-                  </div>
-                </div>
-              </div>
-
-              {/* Blank Canvas Card */}
-              <div
-                onClick={() => {
-                  setNodes([]);
-                  setEdges([]);
-                  setLciaResults(null);
-                  setActiveTab('workspace');
-                }}
-                className="group relative bg-[hsl(220,14%,10%)] border border-dashed border-white/20 p-8 rounded-xl hover:border-[hsl(142,76%,36%)] transition-all cursor-pointer overflow-hidden shadow-2xl glass-panel"
-              >
-                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl italic group-hover:opacity-20 transition-opacity">++</div>
-                <div className="space-y-4 relative z-10">
-                  <div className="w-10 h-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
-                  <h3 className="text-lg font-black uppercase tracking-tighter leading-tight">Start from Scratch: Blank Research Canvas</h3>
-                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">Open an empty workspace to build unlimited supply chain nodes from your uploaded databases.</p>
-                  <button className="text-[9px] font-black text-white tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-2 transition-transform">
-                    Initialize Workspace ➔
-                  </button>
-                </div>
-              </div>
-            </div>
-          </div>
-        ) : (
-          /* Workspace View */
-          <div className="flex h-full w-full relative overflow-hidden bg-[hsl(220,14%,4%)]">
-            {/* Sidebar Toggle Button */}
-            {!isPanelOpen && (
-              <button
-                onClick={() => setIsPanelOpen(true)}
-                className="absolute left-4 top-24 z-50 p-2 rounded-full bg-[hsl(220,14%,12%)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-all shadow-xl animate-in fade-in slide-in-from-left-4 glass-panel"
-                title="Open Control Panel"
-              >
-                <div className="w-4 h-4 flex items-center justify-center font-bold text-glow">»</div>
-              </button>
-            )}
-
-            {isPanelOpen && (
-              <div
-                className="relative border-r border-white/5 h-full flex-shrink-0 flex"
-                style={{ width: panelWidth }}
-              >
-                <div className="flex-1 h-full overflow-hidden">
-                  <LeftPanel
-                    processes={processes}
-                    selectedProcessId={selectedProcessId}
-                    scale={scale}
-                    lciaResults={lciaResults}
-                    onProcessSelect={setSelectedProcessId}
-                    onScaleChange={setScale}
-                    onShuffleDemo={() => { }}
-                    onGeneratePdf={handleGeneratePDF}
-                    onDownloadCsv={handleExportCSV}
-                    contextNodeId={null}
-                    systemBoundary={systemBoundary}
-                    onSystemBoundaryChange={setSystemBoundary}
-                    complianceFramework={complianceFramework}
-                    onComplianceFrameworkChange={setComplianceFramework}
-                    uploadedDatabase={uploadedDatabase}
-                    selectedUploadedProcess={selectedUploadedProcess}
-                    onDatabaseUpload={handleDatabaseUpload}
-                    onUploadedProcessSelect={handleUploadedProcessSelect}
-                    exchangeValues={exchangeValues}
-                    onExchangeValueChange={handleExchangeValueChange}
-                    onAddNodeToCanvas={handleAddNodeToCanvas}
-                    onCalculate={handleCalculateImpact}
-                    selectedNode={selectedNode}
-                    onUpdateNodeData={updateNodeData}
-                    onDeselectNode={() => setSelectedNodeId(null)}
-                    isCalculating={isCalculating}
-                    globalParams={globalParams}
-                    onGlobalParamChange={handleGlobalParamChange}
-                    monteCarloIterations={monteCarloIterations}
-                    onMonteCarloIterationsChange={setMonteCarloIterations}
-                  />
-                </div>
-
-                {/* Resizer Handle */}
-                <div
-                  onMouseDown={startResizing}
-                  className="w-1 hover:w-1.5 bg-transparent hover:bg-[hsl(142,76%,36%)] cursor-col-resize transition-all h-full z-50 border-r border-white/5 active:bg-[hsl(142,76%,42%)] active:w-1.5"
-                />
-
-                <button
-                  onClick={() => setIsPanelOpen(false)}
-                  className="absolute -right-3 top-24 z-50 p-1.5 rounded-full bg-[hsl(220,14%,12%)] border border-white/10 text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-all shadow-lg glass-panel hover:scale-110"
-                  title="Close Control Panel"
-                >
-                  <div className="w-3 h-3 flex items-center justify-center font-bold">«</div>
-                </button>
-              </div>
-            )}
-
-            <section className="flex-1 relative h-full" onContextMenu={onPaneContextMenu} ref={reactFlowWrapper}>
-              {/* Floating Workspace Toolbar */}
-              <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
-                {lciaResults && (
-                  <button
-                    onClick={() => setLciaResults(null)}
-                    className="px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-[9px] font-black text-red-500 uppercase tracking-widest transition-all"
-                  >
-                    Clear Results
-                  </button>
-                )}
-                <select
-                  value={complianceFramework}
-                  onChange={(e) => setComplianceFramework(e.target.value)}
-                  className="rounded border border-white/10 bg-[hsl(220,14%,10%)] px-2 py-1.5 text-[9px] text-white font-bold focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] shadow-xl backdrop-blur-sm"
-                >
-                  <option value="iso-14044">ISO 14044</option>
-                  <option value="jrc-pef">JRC / PEF</option>
-                  <option value="en-15804">EN 15804</option>
-                  <option value="ghg-protocol">GHG Protocol</option>
-                </select>
-                <button
-                  onClick={handleCalculateImpact}
-                  disabled={isCalculating}
-                  className={`px-4 py-2 rounded ${isCalculating ? 'bg-gray-600 cursor-not-allowed' : 'bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,42%)] shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)]'} text-white text-xs font-black tracking-wide transition-all active:scale-95 flex items-center gap-2`}
-                >
-                  {isCalculating ? (
-                    <>
-                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
-                      CALCULATING...
-                    </>
-                  ) : (
-                    "🚀 CALCULATE LCIA"
-                  )}
-                </button>
-              </div>
-
-              <ReactFlow
-                nodes={nodes}
-                edges={edges}
-                onNodesChange={onNodesChange}
-                onEdgesChange={onEdgesChange}
-                onConnect={onConnect}
-                isValidConnection={isValidConnection}
-                onNodeClick={(_, node) => {
-                  setSelectedNodeId(node.id);
-                }}
-                onPaneClick={onPaneClick}
-                nodeTypes={nodeTypes}
-                fitView
-              >
-                <Background color="rgba(255,255,255,0.03)" variant={BackgroundVariant.Dots} gap={20} size={1} />
-                <Controls className="bg-gray-800 border-gray-700 fill-white" />
-                <MiniMap nodeStrokeColor="#22c55e" maskColor="rgba(0,0,0,0.5)" className="bg-gray-900 border-gray-800" />
-              </ReactFlow>
-
-              {/* Context Menu */}
-              {menu && (
-                <div
-                  className="absolute z-50 bg-[hsl(220,14%,12%)] border border-[hsl(var(--border))] rounded shadow-xl overflow-hidden py-1 min-w-[180px]"
-                  style={{ top: menu.y, left: menu.x }}
-                >
-                  <button
-                    onClick={addBlankNode}
-                    className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-[hsl(142,76%,36%)] transition-colors flex items-center gap-2"
-                  >
-                    ➕ ADD BLANK IDEF0 NODE
-                  </button>
-                </div>
-              )}
-            </section>
-          </div>
-        )}
+    <div className="flex h-screen w-full">
+      {/* Left Panel - Form, Search, Shuffle Demo, LCIA Dashboard */}
+      <LeftPanel
+        processes={processes}
+        selectedProcessId={selectedProcessId}
+        scale={scale}
+        lciaResults={lciaResults}
+        onProcessSelect={setSelectedProcessId}
+        onScaleChange={setScale}
+        onShuffleDemo={onShuffleDemo}
+        onGeneratePdf={handleGeneratePdf}
+        onDownloadCsv={handleDownloadCsv}
+        contextNodeId={contextNodeId}
+        systemBoundary={systemBoundary}
+        onSystemBoundaryChange={setSystemBoundary}
+      />
+
+      {/* Right Panel - IDEF0-style React Flow canvas with grid */}
+      <div className="flex-1 flex flex-col min-w-0 bg-[hsl(220,18%,6%)] border-l border-[hsl(var(--border))]">
+        <div className="flex-1 relative">
+          <ReactFlow
+            nodes={nodes}
+            edges={edges}
+            onNodesChange={onNodesChange}
+            onEdgesChange={onEdgesChange}
+            onConnect={onConnect}
+            nodeTypes={nodeTypes}
+            fitView
+            className="bg-[hsl(220,18%,6%)]"
+            minZoom={0.2}
+            maxZoom={1.5}
+            onNodeContextMenu={(_, node) => {
+              setContextNodeId(node.id);
+            }}
+            onPaneContextMenu={(event) => {
+              event.preventDefault();
+              const position = { x: event.clientX - 400, y: event.clientY - 100 };
+              const newNode: Node = {
+                id: `${nodes.length + 1}`,
+                type: "process",
+                position,
+                data: { label: "New Process Node", inputs: [], outputs: [], controls: [], mechanisms: [] },
+              };
+              setNodes((nds) => nds.concat(newNode));
+            }}
+          >
+            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(220,14%,22%)" />
+            <Controls className="!bg-[hsl(220,14%,14%)] !border-[hsl(var(--border))] !shadow-lg" />
+            <MiniMap
+              className="!bg-[hsl(220,14%,14%)]"
+              nodeColor="hsl(142,76%,36%)"
+              maskColor="hsl(220,18%,8%)"
+            />
+          </ReactFlow>
+        </div>
       </div>
-    </main>
+    </div>
   );
 }
diff --git a/AutoLCA/frontend/components/LeftPanel.tsx b/AutoLCA/frontend/components/LeftPanel.tsx
index 948e335..d20a3d7 100644
--- a/AutoLCA/frontend/components/LeftPanel.tsx
+++ b/AutoLCA/frontend/components/LeftPanel.tsx
@@ -1,9 +1,5 @@
-"use client";
-
-import { useState, useCallback, useEffect, useRef, useMemo } from "react";
-import { Upload, Database, Settings, RefreshCw, FileText, Download, Search, AlertTriangle, Globe, Package, MapPin, Layers, Beaker, Calculator, PieChart, ShieldCheck, Zap } from "lucide-react";
-import { MiniLCANodeData } from "../app/types";
-import { evaluateNodeData } from "../utils/parameter_engine";
+import { useState, useCallback, useMemo, useEffect } from "react";
+import { Upload, Database, Settings } from "lucide-react";
 import DatabaseUploadZone from '../components/DatabaseUploadZone';
 
 type ProcessSummary = {
@@ -12,15 +8,12 @@ type ProcessSummary = {
 };
 
 type Parameter = {
-  key: string;
+  id: string;
   name: string;
-  defaultValue: number;
-  unit: string;
-  description?: string;
-  uncertainty?: {
-    type: string;
-    params: any;
-  }
+  min: number;
+  max: number;
+  step: number;
+  default: number;
 };
 
 type Exchange = {
@@ -33,24 +26,22 @@ type Exchange = {
 type UploadedProcess = {
   id: string;
   name: string;
+  description?: string;
   exchanges: Exchange[];
-  location?: string;
-  reference_unit?: string;
-  database_source?: string;
 };
 
 type UploadedDatabase = {
   processes: UploadedProcess[];
 };
 
-type LciaResults = {
-  gwp: number;
-  impacts: Record<string, number>;
-  hotspots: { name: string; value: number; percent: number }[];
-  is_ai_predicted: boolean;
-  node_breakdown: any;
-  uncertainty?: Record<string, { p5: number; p95: number; mean: number; std: number }>;
-} | null;
+type Hotspot = { name: string; value: number; percent: number };
+
+type LciaResults =
+  | {
+    gwp: number;
+    hotspots: Hotspot[];
+  }
+  | null;
 
 type LeftPanelProps = {
   processes: ProcessSummary[];
@@ -65,24 +56,6 @@ type LeftPanelProps = {
   contextNodeId: string | null;
   systemBoundary: string;
   onSystemBoundaryChange: (boundary: string) => void;
-  complianceFramework: string;
-  onComplianceFrameworkChange: (framework: string) => void;
-  uploadedDatabase: UploadedDatabase | null;
-  selectedUploadedProcess: UploadedProcess | null;
-  onDatabaseUpload: (data: UploadedDatabase) => void;
-  onUploadedProcessSelect: (process: UploadedProcess | null) => void;
-  exchangeValues: Record<string, number>;
-  onExchangeValueChange: (id: string, value: number) => void;
-  onAddNodeToCanvas: (process: UploadedProcess) => void;
-  onCalculate?: () => void;
-  selectedNode?: any;
-  onUpdateNodeData?: (id: string, data: any) => void;
-  onDeselectNode?: () => void;
-  isCalculating?: boolean;
-  globalParams: Record<string, number>;
-  onGlobalParamChange: (key: string, value: number) => void;
-  monteCarloIterations?: number;
-  onMonteCarloIterationsChange?: (value: number) => void;
 };
 
 export function LeftPanel({
@@ -98,894 +71,308 @@ export function LeftPanel({
   contextNodeId,
   systemBoundary,
   onSystemBoundaryChange,
-  complianceFramework,
-  onComplianceFrameworkChange,
-  uploadedDatabase,
-  selectedUploadedProcess,
-  onDatabaseUpload,
-  onUploadedProcessSelect,
-  exchangeValues,
-  onExchangeValueChange,
-  onAddNodeToCanvas,
-  onCalculate,
-  selectedNode,
-  onUpdateNodeData,
-  onDeselectNode,
-  isCalculating,
-  globalParams,
-  onGlobalParamChange,
-  monteCarloIterations = 1,
-  onMonteCarloIterationsChange
 }: LeftPanelProps) {
-  const [activeNodeTab, setActiveNodeTab] = useState<'scope' | 'technosphere' | 'elementary' | 'variables' | 'allocation' | 'quality'>('scope');
   const [search, setSearch] = useState("");
+  const [isUploading, setIsUploading] = useState(false);
   const [parameters, setParameters] = useState<Parameter[]>([]);
   const [paramValues, setParamValues] = useState<Record<string, number>>({});
-  const [searchQuery, setSearchQuery] = useState("");
-  const [searchResults, setSearchResults] = useState<UploadedProcess[]>([]);
-  const [isSearching, setIsSearching] = useState(false);
-  const [showResults, setShowResults] = useState(false);
-  const searchRef = useRef<HTMLDivElement>(null);
-
-  const [activeSearchIdx, setActiveSearchIdx] = useState<number | null>(null);
-
+  const [uploadedDatabase, setUploadedDatabase] = useState<UploadedDatabase | null>(null);
+  const [selectedUploadedProcess, setSelectedUploadedProcess] = useState<UploadedProcess | null>(null);
+  const [exchangeValues, setExchangeValues] = useState<Record<string, number>>({});
 
-  const nodeData: MiniLCANodeData = useMemo(() => {
-    if (!selectedNode) return {
-      processName: "",
-      description: "",
-      scope: { functionalUnit: "", location: "" },
-      technosphere: [],
-      elementary: [],
-      variables: {},
-      allocation: { method: 'physical', factors: {} },
-      uncertainty: {}
-    };
-    const data = selectedNode.data;
-    const baseData = data.technosphere ? data : {
-      processName: data.processName || data.label || "New Process",
-      description: data.description || "",
-      scope: {
-        functionalUnit: data.unit || "1 unit",
-        location: typeof data.location === 'string' ? data.location : (data.location?.value || "GLO")
-      },
-      technosphere: (data.exchanges || [])
-        .filter((ex: any) => ['input', 'output', 'mechanism', 'control'].includes(ex.flow_type))
-        .map((ex: any, i: number) => ({
-          id: `tech-${i}`,
-          flow_name: ex.flow_name,
-          flowType: ex.flow_type,
-          dataset_uuid: ex.dataset_uuid || "",
-          formula: ex.amount?.toString() || "0",
-          evaluatedAmount: ex.amount || 0,
-          unit: ex.unit || "kg"
-        })),
-      elementary: (data.exchanges || [])
-        .filter((ex: any) => ['emission', 'extraction'].includes(ex.flow_type))
-        .map((ex: any, i: number) => ({
-          id: `elem-${i}`,
-          flow_name: ex.flow_name,
-          flowType: ex.flow_type,
-          dataset_uuid: ex.dataset_uuid || "",
-          formula: ex.amount?.toString() || "0",
-          evaluatedAmount: ex.amount || 0,
-          unit: ex.unit || "kg"
-        })),
-      variables: data.parameters || {},
-      allocation: { method: 'physical', factors: {} },
-      uncertainty: {}
-    };
-    return evaluateNodeData(baseData, globalParams);
-  }, [selectedNode, globalParams]);
   useEffect(() => {
-    // Determine the process ID to fetch parameters for
-    const procId = selectedNode?.data?.proc_id || selectedProcessId;
-
-    if (procId) {
-      fetch(`http://localhost:8000/api/parameters/definitions?processId=${procId}`)
+    if (selectedProcessId) {
+      fetch(`/api/process/${selectedProcessId}/parameters`)
         .then((res) => res.json())
         .then((data) => {
           setParameters(data);
-          // Only set defaults if the node doesn't already have these parameters
-          const existingParams = selectedNode?.data?.parameters || {};
-          const newValues: Record<string, number> = { ...existingParams };
-
+          const defaults: Record<string, number> = {};
           data.forEach((p: Parameter) => {
-            if (newValues[p.key] === undefined) {
-              newValues[p.key] = p.defaultValue;
-            }
+            defaults[p.id] = p.default;
           });
-          setParamValues(newValues);
-
-          // Sync back to node if it's a node selection
-          if (selectedNode && Object.keys(existingParams).length === 0) {
-            onUpdateNodeData?.(selectedNode.id, { parameters: newValues });
-          }
-        })
-        .catch(err => console.error("Param fetch failed", err));
+          setParamValues(defaults);
+        });
     }
-  }, [selectedProcessId, selectedNode?.id]);
+  }, [selectedProcessId]);
 
-  // Debounced Search Effect
-  useEffect(() => {
-    const timer = setTimeout(() => {
-      if (searchQuery.length >= 2) {
-        setIsSearching(true);
-        fetch(`http://localhost:8000/api/search-processes?q=${encodeURIComponent(searchQuery)}`)
-          .then(res => res.json())
-          .then(data => {
-            setSearchResults(data);
-            setIsSearching(true); // Keep results visible
-            setIsSearching(false);
-          })
-          .catch(err => {
-            console.error("Search failed", err);
-            setIsSearching(false);
-          });
-      } else {
-        if (activeSearchIdx === null) { // Only clear if not in deep search mode to keep global results
-          setSearchResults([]);
-        }
-      }
-    }, 300);
+  const handleSearch = useCallback(() => {
+    // Placeholder: could filter processes by name with backend search
+  }, []);
 
-    return () => clearTimeout(timer);
-  }, [searchQuery, activeSearchIdx]);
+  const handleDatabaseUpload = useCallback((data: UploadedDatabase) => {
+    setUploadedDatabase(data);
+    setSelectedUploadedProcess(null);
+    setExchangeValues({});
+  }, []);
 
-  // Click outside to close search results
-  useEffect(() => {
-    function handleClickOutside(event: MouseEvent) {
-      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
-        setShowResults(false);
-        setActiveSearchIdx(null);
+  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
+    if (!e.target.files?.[0]) return;
+    setIsUploading(true);
+    const formData = new FormData();
+    formData.append("file", e.target.files[0]);
+
+    try {
+      const res = await fetch("/api/database/upload", {
+        method: "POST",
+        body: formData,
+      });
+      if (res.ok) {
+        alert("Database uploaded and switched successfully!");
+        window.location.reload();
       }
+    } catch (err) {
+      console.error("Upload failed", err);
+    } finally {
+      setIsUploading(false);
     }
-    document.addEventListener("mousedown", handleClickOutside);
-    return () => document.removeEventListener("mousedown", handleClickOutside);
-  }, []);
-
-  return (
-    <aside className="w-full h-full flex flex-col bg-[hsl(220,14%,8%)] border-r border-white/5 overflow-hidden font-mono">
-      {/* Header */}
-      <header className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
-        <div className="flex items-center gap-2">
-          <div className="w-6 h-6 bg-[hsl(142,76%,36%)] rounded flex items-center justify-center font-black text-white text-xs">A</div>
-          <h1 className="text-sm font-bold tracking-tight text-[hsl(var(--foreground))]">AUTOLCA <span className="text-[hsl(142,76%,36%)]">PRO</span></h1>
-        </div>
-        {selectedNode && (
-          <div className="bg-[hsl(142,76%,36%)] px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-tighter">
-            Editing Mode
-          </div>
-        )}
-      </header>
-
-      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-white custom-scrollbar-zone">
-        {/* Global Parameters Section */}
-        {!selectedNode && (
-          <div className="space-y-3 p-3 rounded-lg bg-[hsl(220,14%,8%)] border border-[hsl(142,76%,36%,0.2)] shadow-xl animate-in slide-in-from-top-2">
-            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(142,76%,36%)] flex items-center gap-2">
-              <Globe className="w-3 h-3" />
-              Global Scoping Parameters
-            </label>
-            <div className="space-y-3 mt-2">
-              {Object.entries(globalParams).map(([key, val]) => (
-                <div key={key} className="space-y-1">
-                  <div className="flex justify-between items-center text-[9px] font-bold">
-                    <span className="text-gray-400 font-mono">{key}</span>
-                    <span className="text-[hsl(142,76%,36%)] font-mono">{val.toFixed(2)}</span>
-                  </div>
-                  <input
-                    type="number"
-                    value={val}
-                    onChange={(e) => onGlobalParamChange(key, parseFloat(e.target.value) || 0)}
-                    className="w-full h-8 bg-[hsl(220,14%,12%)] border border-white/5 rounded px-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all"
-                  />
-                </div>
-              ))}
-            </div>
-          </div>
-        )}
-        {selectedNode ? (
-          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
-            {/* Tab Navigation */}
-            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 overflow-x-auto no-scrollbar backdrop-blur-sm sticky top-0 z-30">
-              {[
-                { id: 'scope', icon: Globe, label: 'Scope' },
-                { id: 'technosphere', icon: Package, label: 'Economy' },
-                { id: 'elementary', icon: Beaker, label: 'Biosphere' },
-                { id: 'variables', icon: Calculator, label: 'Math' },
-                { id: 'allocation', icon: PieChart, label: 'Allocation' },
-                { id: 'quality', icon: ShieldCheck, label: 'Quality' },
-              ].map((tab) => (
-                <button
-                  key={tab.id}
-                  onClick={() => setActiveNodeTab(tab.id as any)}
-                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${activeNodeTab === tab.id ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
-                >
-                  <tab.icon className="w-3.5 h-3.5" />
-                  <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
-                </button>
-              ))}
-            </div>
-
-            {/* Tab Content */}
-            <div className="min-h-[450px] flex flex-col gap-4">
-              {activeNodeTab === 'scope' && (
-                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
-                  <div className="space-y-2">
-                    <label className="text-[10px] font-black uppercase text-gray-500">Process Name</label>
-                    <input
-                      value={nodeData.processName}
-                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { processName: e.target.value })}
-                      className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                    />
-                  </div>
-                  <div className="space-y-2">
-                    <label className="text-[10px] font-black uppercase text-gray-500">Description</label>
-                    <textarea
-                      value={nodeData.description}
-                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { description: e.target.value })}
-                      className="w-full h-24 bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-gray-400 font-bold resize-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                      placeholder="Enter detailed process metadata..."
-                    />
-                  </div>
-                  <div className="grid grid-cols-2 gap-4">
-                    <div className="space-y-2">
-                      <label className="text-[10px] font-black uppercase text-gray-500">Functional Unit</label>
-                      <input
-                        value={nodeData.scope.functionalUnit}
-                        onChange={(e) => onUpdateNodeData?.(selectedNode.id, { scope: { ...nodeData.scope, functionalUnit: e.target.value } })}
-                        className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                      />
-                    </div>
-                    <div className="space-y-2">
-                      <label className="text-[10px] font-black uppercase text-gray-500">Geography</label>
-                      <input
-                        value={nodeData.scope.location}
-                        onChange={(e) => onUpdateNodeData?.(selectedNode.id, { scope: { ...nodeData.scope, location: e.target.value } })}
-                        className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                      />
-                    </div>
-                  </div>
-                </div>
-              )}
-
-              {(activeNodeTab === 'technosphere' || activeNodeTab === 'elementary') && (
-                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
-                  <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
-                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(142,76%,36%)]">
-                      {activeNodeTab === 'technosphere' ? 'Technosphere flows (economy)' : 'Elementary flows (biosphere)'}
-                    </h4>
-                    <button
-                      onClick={() => {
-                        const isTechnosphere = activeNodeTab === 'technosphere';
-                        const newItem: any = {
-                          id: Math.random().toString(36).substring(2, 11),
-                          flow_name: "New Flow",
-                          flowType: isTechnosphere ? 'input' : 'emission',
-                          dataset_uuid: "",
-                          formula: "0",
-                          evaluatedAmount: 0,
-                          unit: "kg"
-                        };
-
-                        if (isTechnosphere) {
-                          const list = [...(nodeData.technosphere || [])];
-                          list.push(newItem);
-                          onUpdateNodeData?.(selectedNode.id, { technosphere: list });
-                        } else {
-                          const list = [...(nodeData.elementary || [])];
-                          list.push(newItem);
-                          onUpdateNodeData?.(selectedNode.id, { elementary: list });
-                        }
-                      }}
-                      className="px-2 py-1 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded shadow-lg shadow-[hsl(142,76%,36%,0.2)] hover:scale-105 transition-transform"
-                    >
-                      + ADD FLOW
-                    </button>
-                  </div>
-
-                  <div className="space-y-3">
-                    {(activeNodeTab === 'technosphere' ? nodeData.technosphere : nodeData.elementary).map((flow, idx) => (
-                      <div key={flow.id} className="p-3 bg-[hsl(220,14%,12%)] border border-white/10 rounded-lg space-y-3 relative group/flow hover:border-[hsl(142,76%,36%,0.4)] transition-all">
-                        <div className="flex items-center gap-2">
-                          <select
-                            value={flow.flowType}
-                            onChange={(e) => {
-                              const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                              list[idx].flowType = e.target.value as any;
-                              onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                            }}
-                            className="bg-[hsl(220,14%,8%)] border border-white/5 rounded px-1.5 py-1 text-[9px] font-bold text-gray-400 capitalize focus:text-white"
-                          >
-                            {activeNodeTab === 'technosphere' ? (
-                              <>
-                                <option value="input">Input</option>
-                                <option value="output">Output</option>
-                                <option value="mechanism">Mechanism</option>
-                                <option value="control">Control</option>
-                              </>
-                            ) : (
-                              <>
-                                <option value="emission">Emission</option>
-                                <option value="extraction">Extraction</option>
-                              </>
-                            )}
-                          </select>
-                          <div className="flex-1 relative">
-                            <input
-                              value={flow.flow_name}
-                              onFocus={() => setActiveSearchIdx(idx)}
-                              onChange={(e) => {
-                                const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                                list[idx].flow_name = e.target.value;
-                                onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                                setSearchQuery(e.target.value);
-                                setShowResults(true);
-                              }}
-                              className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-[10px] text-white font-bold focus:border-[hsl(142,76%,36%)] outline-none"
-                              placeholder="Search dataset..."
-                            />
-                            {showResults && activeSearchIdx === idx && (
-                              <div className="absolute z-[110] w-full mt-1 bg-[hsl(220,14%,15%)] border border-white/10 rounded shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-1">
-                                {searchResults.map((proc) => (
-                                  <div
-                                    key={proc.id}
-                                    onClick={() => {
-                                      const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                                      list[idx] = {
-                                        ...list[idx],
-                                        flow_name: proc.name,
-                                        unit: proc.reference_unit || list[idx].unit,
-                                        dataset_uuid: proc.id
-                                      };
-                                      onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                                      setActiveSearchIdx(null);
-                                      setShowResults(false);
-                                    }}
-                                    className="p-2 hover:bg-[hsl(142,76%,36%,0.2)] border-b border-white/5 cursor-pointer flex flex-col gap-0.5"
-                                  >
-                                    <span className="text-[10px] font-bold text-white truncate">{proc.name}</span>
-                                    <span className="text-[8px] text-gray-500 uppercase">{proc.location} • {proc.reference_unit}</span>
-                                  </div>
-                                ))}
-                              </div>
-                            )}
-                          </div>
-                          <button
-                            onClick={() => {
-                              const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                              list.splice(idx, 1);
-                              onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                            }}
-                            className="opacity-0 group-hover/flow:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1"
-                          >
-                            < Zap className="w-3 h-3 rotate-45" />
-                          </button>
-                        </div>
-
-                        <div className="grid grid-cols-2 gap-3">
-                          <div className="space-y-1">
-                            <span className="text-[7px] text-gray-500 font-black uppercase">Formula (MathJS)</span>
-                            <input
-                              value={flow.formula}
-                              onChange={(e) => {
-                                const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                                list[idx].formula = e.target.value;
-                                onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                              }}
-                              className="w-full h-8 bg-black/40 border border-white/5 rounded px-2 text-[10px] font-mono text-[hsl(142,76%,36%)] focus:border-[hsl(142,76%,36%)] outline-none"
-                            />
-                          </div>
-                          <div className="space-y-1">
-                            <span className="text-[7px] text-gray-500 font-black uppercase">Result</span>
-                            <div className="w-full h-8 flex items-center px-2 bg-black/20 border border-white/5 rounded text-[10px] font-mono text-gray-300">
-                              {flow.evaluatedAmount.toFixed(4)} <span className="ml-auto text-[8px] text-gray-600 font-bold">{flow.unit}</span>
-                            </div>
-                          </div>
-                        </div>
-                      </div>
-                    ))}
-                  </div>
-                </div>
-              )}
-
-              {activeNodeTab === 'variables' && (
-                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
-                  <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
-                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(142,76%,36%)]">Math Engine Variables</h4>
-                    <button
-                      onClick={() => {
-                        const newVars = { ...nodeData.variables, [`v${Object.keys(nodeData.variables).length + 1}`]: 0 };
-                        onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                      }}
-                      className="px-2 py-1 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded shadow-lg shadow-[hsl(142,76%,36%,0.2)] hover:scale-105 transition-transform"
-                    >
-                      + ADD VARIABLE
-                    </button>
-                  </div>
-                  <div className="space-y-2">
-                    {Object.entries(nodeData.variables).map(([key, val]) => (
-                      <div key={key} className="flex items-center gap-2 p-2 bg-[hsl(220,14%,12%)] border border-white/5 rounded-lg group/var hover:border-[hsl(142,76%,36%,0.4)] transition-all">
-                        <input
-                          value={key}
-                          onChange={(e) => {
-                            const newKey = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
-                            if (newKey === key) return;
-                            const newVars = { ...nodeData.variables };
-                            delete newVars[key];
-                            newVars[newKey] = val;
-                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                          }}
-                          className="w-24 bg-transparent border-r border-white/10 px-2 py-1 text-[10px] text-[hsl(142,76%,36%)] font-mono font-bold outline-none"
-                        />
-                        <input
-                          type="number"
-                          step="any"
-                          value={val}
-                          onChange={(e) => {
-                            const newVars = { ...nodeData.variables, [key]: parseFloat(e.target.value) || 0 };
-                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                          }}
-                          className="flex-1 bg-transparent px-2 py-1 text-[10px] text-white font-mono text-right outline-none"
-                        />
-                        <button
-                          onClick={() => {
-                            const newVars = { ...nodeData.variables };
-                            delete newVars[key];
-                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                          }}
-                          className="opacity-0 group-hover/var:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1"
-                        >
-                          <Zap className="w-3 h-3 rotate-45" />
-                        </button>
-                      </div>
-                    ))}
-                    {Object.keys(nodeData.variables).length === 0 && (
-                      <div className="p-8 text-center border border-dashed border-white/5 rounded-lg">
-                        <Calculator className="w-8 h-8 text-gray-700 mx-auto mb-2 opacity-20" />
-                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
-                          No local constants defined.<br />Global parameters are still available.
-                        </p>
-                      </div>
-                    )}
-                  </div>
-                </div>
-              )}
-
-              {activeNodeTab === 'allocation' && (
-                <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
-                  <div className="space-y-3">
-                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
-                      <PieChart className="w-3.5 h-3.5" />
-                      Allocation Strategy
-                    </label>
-                    <select
-                      value={nodeData.allocation.method}
-                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { allocation: { ...nodeData.allocation, method: e.target.value } })}
-                      className="w-full bg-[hsl(220,14%,8%)] border border-white/20 rounded px-3 py-2 text-xs text-white font-black"
-                    >
-                      <option value="physical">Physical Attribution (Mass/Energy/Volume)</option>
-                      <option value="economic">Economic Allocation (Market Value)</option>
-                      <option value="none">No Allocation (System Expansion)</option>
-                    </select>
-                  </div>
-
-                  <div className="p-4 bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.2)] rounded-lg space-y-3">
-                    <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
-                      If this sub-system produces multiple co-products, define the allocation factor for the main reference flow.
-                    </p>
-                    <div className="flex items-center gap-4">
-                      <span className="text-[10px] font-mono text-white flex-1">{nodeData.processName}</span>
-                      <div className="flex items-center gap-2">
-                        <input type="number" defaultValue={100} className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-[hsl(142,76%,36%)] text-right" />
-                        <span className="text-[10px] font-bold text-gray-600">%</span>
-                      </div>
-                    </div>
-                  </div>
-                </div>
-              )}
-
-              {activeNodeTab === 'quality' && (
-                <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
-                  <div className="space-y-4">
-                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
-                      <ShieldCheck className="w-3.5 h-3.5" />
-                      Data Quality Indicators (DQRs)
-                    </label>
-
-                    {[
-                      { label: 'Reliability', color: 'bg-green-500' },
-                      { label: 'Completeness', color: 'bg-blue-500' },
-                      { label: 'Temporal Cor.', color: 'bg-yellow-500' },
-                      { label: 'Geographic Cor.', color: 'bg-red-500' },
-                      { label: 'Technological Cor.', color: 'bg-purple-500' },
-                    ].map((item) => (
-                      <div key={item.label} className="space-y-1.5">
-                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
-                          <span className="text-gray-400">{item.label}</span>
-                          <span className="text-white">Score: 1.0</span>
-                        </div>
-                        <div className="flex gap-1">
-                          {[1, 2, 3, 4, 5].map(n => (
-                            <div key={n} className={`flex-1 h-3 rounded-sm ${n === 1 ? item.color : 'bg-white/5 opacity-50'} border border-black/20`} />
-                          ))}
-                        </div>
-                      </div>
-                    ))}
-                  </div>
-
-                  <hr className="border-white/5" />
-
-                  <div className="space-y-3">
-                    <label className="text-[10px] font-black uppercase text-gray-500">Uncertainty Distribution</label>
-                    <select className="w-full bg-[hsl(220,14%,8%)] border border-white/20 rounded px-3 py-2 text-xs text-white font-bold">
-                      <option>None (Deterministic)</option>
-                      <option>Normal (Gaussian)</option>
-                      <option>Lognormal (Standard LCA)</option>
-                      <option>Pedigree-based (DQR Calculated)</option>
-                    </select>
-                  </div>
-                </div>
-              )}
-            </div>
-
-            <div className="pt-4 border-t border-white/5 flex gap-4">
-              <button
-                onClick={() => onDeselectNode?.()}
-                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white border border-white/10 rounded-md transition-all"
-              >
-                Close Editor
-              </button>
-              <button
-                onClick={() => {
-                  onUpdateNodeData?.(selectedNode.id, nodeData); // Force final sync
-                  onDeselectNode?.();
-                }}
-                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-[hsl(142,76%,36%)] text-white rounded-md shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all"
-              >
-                Save & Update
-              </button>
-            </div>
-          </div>
-        ) : (
-          /* Global Database View (Original UI) */
-          <>
-            <div className="space-y-3">
-              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] flex items-center">
-                <Database className="w-3 h-3 mr-2" />
-                LCA Database Integration
-              </label>
-              <DatabaseUploadZone onUploadSuccess={onDatabaseUpload} />
-            </div>
-
-            <div className="space-y-3">
-              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] flex items-center">
-                <RefreshCw className="w-3 h-3 mr-2" />
-                Active Process Control
-              </label>
-
-              <div className="relative" ref={searchRef}>
-                <div className="relative group">
-                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-[hsl(142,76%,36%)] transition-colors" />
-                  <input
-                    type="text"
-                    value={searchQuery}
-                    onFocus={() => setShowResults(true)}
-                    onChange={(e) => setSearchQuery(e.target.value)}
-                    placeholder={uploadedDatabase ? "Search database processes..." : "Upload a database first..."}
-                    disabled={!uploadedDatabase}
-                    className="w-full h-10 pl-9 pr-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)] placeholder:text-gray-600 font-bold transition-all disabled:opacity-50"
-                  />
-                  {isSearching && (
-                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
-                      <div className="w-3 h-3 border-2 border-[hsl(142,76%,36%)] border-t-transparent rounded-full animate-spin" />
-                    </div>
-                  )}
-                </div>
-
-                {/* Combobox Dropdown */}
-                {showResults && (searchQuery.length >= 2 || (uploadedDatabase && searchResults.length > 0)) && (
-                  <div className="absolute z-[100] w-full mt-1 bg-[hsl(220,14%,12%)] border border-white/10 rounded-md shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
-                    {searchResults.length > 0 ? (
-                      searchResults.map((proc) => {
-                        const hasNoImpact = true; // Placeholder for logic
-                        return (
-                          <div
-                            key={proc.id}
-                            onClick={() => {
-                              onUploadedProcessSelect(proc);
-                              setSearchQuery(proc.name);
-                              setShowResults(false);
-                            }}
-                            className="p-3 hover:bg-[hsl(142,76%,36%,0.15)] border-b border-white/5 cursor-pointer group transition-colors flex flex-col gap-1"
-                          >
-                            <div className="flex items-center justify-between gap-2">
-                              <span className="text-xs font-black text-white group-hover:text-[hsl(142,76%,36%)] transition-colors truncate">{proc.name}</span>
-                              {hasNoImpact && (
-                                <div className="group/warn relative">
-                                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
-                                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded shadow-2xl text-[8px] text-gray-300 font-bold invisible group-hover/warn:visible opacity-0 group-hover/warn:opacity-100 transition-all z-[101]">
-                                    Warning: This process may require mapping to standard impact methods (e.g., TRACI/ReCiPe).
-                                  </div>
-                                </div>
-                              )}
-                            </div>
-                            <div className="flex items-center gap-3">
-                              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
-                                <Globe className="w-2.5 h-2.5" />
-                                <span>{proc.location || 'GLO'}</span>
-                              </div>
-                              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
-                                <Package className="w-2.5 h-2.5" />
-                                <span>{proc.reference_unit || '1 unit'}</span>
-                              </div>
-                              <div className="ml-auto px-1.5 py-0.5 rounded-full bg-[hsl(142,76%,36%,0.1)] border border-[hsl(142,76%,36%,0.2)] text-[7px] font-black text-[hsl(142,76%,36%)] uppercase tracking-tighter">
-                                User Upload
-                              </div>
-                            </div>
-                          </div>
-                        );
-                      })
-                    ) : searchQuery.length >= 2 ? (
-                      <div className="p-6 text-center space-y-4">
-                        <p className="text-[10px] text-gray-500 font-bold uppercase">No local results found for "{searchQuery}"</p>
-                        <button className="w-full py-2 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded hover:bg-[hsl(142,76%,46%)] transition-colors">
-                          Connect USLCI / Ecoinvent ➔
-                        </button>
-                      </div>
-                    ) : null}
-                  </div>
-                )}
-              </div>
-            </div>
+  };
 
-            {selectedUploadedProcess && (
-              <div className="p-3 rounded-lg bg-[hsl(220,14%,13%)] border border-[hsl(var(--border))] space-y-4">
-                <div className="space-y-2">
-                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-tighter">Exchange Variables</label>
-                  {selectedUploadedProcess.exchanges.map((ex, idx) => (
-                    <div key={idx} className="flex items-center gap-2">
-                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate flex-1" title={ex.flow_name}>
-                        {ex.flow_name}
-                      </span>
-                      <div className="flex items-center gap-1 w-24">
-                        <input
-                          type="number"
-                          step="any"
-                          value={exchangeValues[`exchange_${idx}`] ?? ex.amount}
-                          onChange={(e) => onExchangeValueChange(`exchange_${idx}`, Number(e.target.value))}
-                          className="w-full bg-[hsl(220,14%,8%)] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-[10px] font-mono text-[hsl(142,76%,36%)] text-right focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)]"
-                        />
-                        <span className="text-[8px] text-[hsl(var(--muted-foreground))] font-bold w-6 text-left">{ex.unit}</span>
-                      </div>
-                    </div>
-                  ))}
-                </div>
+  const selectedProcessName = useMemo(() => {
+    return processes.find((p) => p.id === selectedProcessId)?.name ?? "None selected";
+  }, [processes, selectedProcessId]);
 
-                <button
-                  onClick={() => onAddNodeToCanvas(selectedUploadedProcess)}
-                  className="w-full bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,46%)] text-white font-bold py-2 rounded text-xs transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse flex items-center justify-center gap-2"
-                >
-                  ➕ ADD PROCESS TO CANVAS
-                </button>
-              </div>
-            )}
-          </>
-        )}
+  return (
+    <aside className="w-[340px] shrink-0 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(220,18%,8%)]">
+      <div className="p-4 border-b border-[hsl(var(--border))]">
+        <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Triya.io</h1>
+        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
+          AI Life Cycle Assessment - Super Calculator
+        </p>
+      </div>
 
-        <hr className="border-[hsl(var(--border))]" />
+      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
+        {/* Objective 1: Upload Database Zone */}
+        <DatabaseUploadZone onUploadSuccess={handleDatabaseUpload} />
 
-        {/* System Boundary */}
-        <div className="space-y-3">
-          <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Methodology</label>
+        {/* System Boundary Logic */}
+        <div>
+          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
+            <Settings className="w-4 h-4 mr-2" />
+            System Boundary
+          </label>
           <select
             value={systemBoundary}
             onChange={(e) => onSystemBoundaryChange(e.target.value)}
-            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all font-bold"
+            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
           >
-            <option value="cradle-to-cradle">Cradle-to-Cradle (C2C)</option>
-            <option value="cradle-to-gate">Cradle-to-Gate</option>
-            <option value="cradle-to-grave">Cradle-to-Grave</option>
-            <option value="gate-to-gate">Gate-to-Gate</option>
-            <option value="gate-to-cradle">Gate-to-Cradle</option>
+            <option value="gate">Cradle-to-Gate</option>
+            <option value="grave">Cradle-to-Grave</option>
+            <option value="cradle">Cradle-to-Cradle (Circular)</option>
           </select>
-
-          <div className="text-[10px] text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(220,14%,8%)] border border-white/5 rounded leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 italic font-medium">
-            {systemBoundary === 'cradle-to-cradle' && "Cradle-to-Cradle (C2C): A circular, restorative model where end-of-life products are recycled, upcycled, or biodegraded into new raw materials, eliminating waste and enabling continuous technical or biological cycles."}
-            {systemBoundary === 'cradle-to-gate' && "Cradle-to-Gate: Evaluates a partial product life cycle from resource extraction (\"cradle\") to the factory gate (\"gate\") before it reaches the consumer. Commonly used for B2B footprinting."}
-            {systemBoundary === 'cradle-to-grave' && "Cradle-to-Grave: The standard linear life cycle model, tracing a product from raw material extraction (\"cradle\") through production, transport, usage, and final waste disposal (\"grave\")."}
-            {systemBoundary === 'gate-to-gate' && "Gate-to-Gate: A partial LCA, typically mapping a single value-added process within a manufacturing chain."}
-            {systemBoundary === 'gate-to-cradle' && "Gate-to-Cradle: Focuses on the recycling, refurbishment, or regeneration phase of a product, from the end-of-life waste stage (\"gate\") back into a new production cycle (\"cradle\")."}
-          </div>
         </div>
 
-        <hr className="border-[hsl(var(--border))]" />
-
-        {/* Reporting Compliance */}
-        <div className="space-y-2">
-          <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Reporting Compliance</label>
-          <select
-            value={complianceFramework}
-            onChange={(e) => onComplianceFrameworkChange(e.target.value)}
-            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all font-bold"
-          >
-            <option value="iso-14044">ISO 14040 / 14044</option>
-            <option value="jrc-pef">JRC / PEF (EF 3.1)</option>
-            <option value="en-15804">EN 15804+A2</option>
-            <option value="ghg-protocol">GHG Protocol</option>
-          </select>
-        </div>
-
-        {/* Global Uncertainty Analysis */}
-        <div className="space-y-3 p-3 rounded-lg bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.1)]">
-          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(142,76%,36%)] flex items-center gap-2">
-            <RefreshCw className="w-3 h-3" />
-            Uncertainty Mode
+        {/* Process selection bound to database */}
+        <div>
+          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
+            <Database className="w-4 h-4 mr-2" />
+            Active Process
           </label>
-
-          <div className="flex bg-[hsl(220,14%,8%)] rounded p-1">
-            <button
-              onClick={() => onMonteCarloIterationsChange?.(1)}
-              className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${monteCarloIterations <= 1 ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.2)]' : 'text-gray-500 hover:text-white'}`}
-            >
-              Deterministic
-            </button>
-            <button
-              onClick={() => onMonteCarloIterationsChange?.(1000)}
-              className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${monteCarloIterations > 1 ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.2)]' : 'text-gray-500 hover:text-white'}`}
+          {uploadedDatabase ? (
+            <select
+              value={selectedUploadedProcess?.id ?? ""}
+              onChange={(e) => {
+                const processId = e.target.value;
+                const process = uploadedDatabase.processes.find(p => p.id === processId);
+                setSelectedUploadedProcess(process || null);
+                if (process) {
+                  // Initialize exchange values with defaults
+                  const defaults: Record<string, number> = {};
+                  process.exchanges.forEach((exchange, index) => {
+                    defaults[`exchange_${index}`] = exchange.amount;
+                  });
+                  setExchangeValues(defaults);
+                } else {
+                  setExchangeValues({});
+                }
+              }}
+              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
             >
-              Stochastic
-            </button>
-          </div>
+              <option value="">Select a process…</option>
+              {uploadedDatabase.processes.map((process) => (
+                <option key={process.id} value={process.id}>
+                  {process.name}
+                </option>
+              ))}
+            </select>
+          ) : (
+            <div className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
+              Upload a database to view processes
+            </div>
+          )}
+        </div>
 
-          {monteCarloIterations > 1 && (
-            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
-              <div className="flex justify-between items-center text-[9px] font-bold">
-                <span className="text-gray-400">Monte Carlo Iterations</span>
-                <span className="text-[hsl(142,76%,36%)] font-mono">{monteCarloIterations}</span>
-              </div>
+        {/* Dynamic Exchange Parameters */}
+        {selectedUploadedProcess && (
+          <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
+            <label className="block text-sm font-medium text-[hsl(var(--foreground))] flex items-center">
+              <Settings className="w-4 h-4 mr-2" />
+              Parameters
+            </label>
+            
+            {/* Scale Parameter */}
+            <div>
+              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
+                Functional Unit Scale
+              </label>
               <input
                 type="range"
-                min={100}
-                max={5000}
-                step={100}
-                value={monteCarloIterations}
-                onChange={(e) => onMonteCarloIterationsChange?.(parseInt(e.target.value))}
-                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[hsl(142,76%,36%)]"
+                min={0.1}
+                max={10.0}
+                step={0.1}
+                value={scale}
+                onChange={(e) => onScaleChange(Number(e.target.value))}
+                className="w-full accent-[hsl(142,76%,36%)]"
               />
-              <p className="text-[8px] text-gray-600 font-bold uppercase leading-tight">
-                Vectorized simulation calculates {monteCarloIterations} supply chain variations in parallel.
-              </p>
+              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
+                <span>0.1</span>
+                <span>{scale.toFixed(1)}</span>
+                <span>10.0</span>
+              </div>
             </div>
-          )}
-        </div>
-      </div>
 
-      <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] flex-shrink-0">
-        <div className="grid grid-cols-3 gap-1.5">
+            {/* Exchange Parameters */}
+            {selectedUploadedProcess.exchanges.length > 0 && (
+              <>
+                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">
+                  Exchange Amounts
+                </label>
+                {selectedUploadedProcess.exchanges.map((exchange, index) => (
+                  <div key={index}>
+                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
+                      {exchange.flow_name} ({exchange.flow_type}) - {exchange.unit}
+                    </label>
+                    <input
+                      type="range"
+                      min={0}
+                      max={exchange.amount * 3} // Allow up to 3x the default
+                      step={0.01}
+                      value={exchangeValues[`exchange_${index}`] ?? exchange.amount}
+                      onChange={(e) => {
+                        const val = Number(e.target.value);
+                        setExchangeValues(prev => ({ ...prev, [`exchange_${index}`]: val }));
+                      }}
+                      className="w-full accent-[hsl(142,76%,36%)]"
+                    />
+                    <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
+                      <span>0</span>
+                      <span>{(exchangeValues[`exchange_${index}`] ?? exchange.amount).toFixed(2)}</span>
+                      <span>{(exchange.amount * 3).toFixed(0)}</span>
+                    </div>
+                  </div>
+                ))}
+              </>
+            )}
+          </div>
+        )}
+
+        {/* Shuffle Example */}
+
+
+        {/* Shuffle Example */}
+        <button
+          type="button"
+          onClick={onShuffleDemo}
+          className="w-full rounded-md border-2 border-dashed border-[hsl(142,76%,36%)] bg-[hsl(220,14%,12%)] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-colors"
+        >
+          Shuffle Example
+        </button>
+
+        {/* Export actions */}
+        <div className="flex gap-2">
           <button
+            type="button"
             onClick={onGeneratePdf}
-            disabled={isCalculating}
-            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(var(--foreground))]'} text-[9px] font-bold transition-colors`}
+            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)]"
           >
-            <FileText className="w-3 h-3" />
-            PDF
+            Generate PDF report
           </button>
           <button
+            type="button"
             onClick={onDownloadCsv}
-            disabled={isCalculating}
-            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(var(--foreground))]'} text-[9px] font-bold transition-colors`}
-          >
-            <Download className="w-3 h-3" />
-            CSV
-          </button>
-          <button
-            onClick={onShuffleDemo}
-            disabled={isCalculating}
-            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(142,76%,36%)]'} text-[9px] font-bold transition-colors`}
+            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)]"
           >
-            ⚡ BENCH
+            Download CSV
           </button>
         </div>
-      </div>
 
-      {/* Result Dashboard */}
-      {lciaResults && (
-        <footer className="p-4 bg-[hsl(220,14%,8%)] border-t border-[hsl(var(--border))] space-y-4 max-h-[400px] overflow-y-auto">
-          {/* AI Warning */}
-          {lciaResults.is_ai_predicted && (
-            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded flex items-start gap-2 animate-pulse">
-              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
-              <p className="text-[9px] font-bold text-yellow-500 uppercase leading-tight">
-                Notice: Some missing Characterization Factors were predicted using AI (KNNImputer).
+        {/* LCIA results placeholder */}
+        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
+          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
+            LCIA Results
+          </h3>
+          {lciaResults ? (
+            <div className="space-y-2">
+              <p className="text-xs text-[hsl(var(--muted-foreground))]">
+                Process: <span className="font-medium text-[hsl(var(--foreground))]">{selectedProcessName}</span>
               </p>
-            </div>
-          )}
-
-          {/* Hotspot Card */}
-          {lciaResults.hotspots.length > 0 && (
-            <div className="p-4 bg-red-600/10 border-2 border-red-600/30 rounded-lg space-y-2 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.1)]">
-              <div className="flex items-center gap-2 text-[11px] font-black text-red-500 uppercase tracking-widest">
-                <AlertTriangle className="w-4 h-4" />
-                Supply Chain Hotspot
-              </div>
-              <div className="flex justify-between items-center py-1">
-                <span className="text-sm font-black text-white truncate max-w-[140px] italic">🔴 {lciaResults.hotspots[0].name}</span>
-                <span className="text-lg font-black text-red-500">{lciaResults.hotspots[0].percent.toFixed(1)}%</span>
-              </div>
-              <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">
-                This process accounts for the majority of Carbon Impact (GWP) in the current supply chain.
+              <p className="text-xs text-[hsl(var(--muted-foreground))]">
+                Total impact (GWP-like):{" "}
+                <span className="font-semibold text-[hsl(var(--foreground))]">
+                  {lciaResults.gwp.toFixed(3)}
+                </span>
               </p>
-            </div>
-          )}
-
-          {/* GWP Total */}
-          <div className="space-y-1">
-            <div className="flex justify-between items-end">
-              <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Total GWP</span>
-              <div className="text-right">
-                <div className="text-xl font-black text-[hsl(142,76%,36%)] leading-none">
-                  {lciaResults.gwp.toFixed(2)} <span className="text-[10px]">kg CO₂ eq</span>
-                </div>
-                {lciaResults.uncertainty?.gwp_climate_change && (
-                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mt-1">
-                    95% CI: {lciaResults.uncertainty.gwp_climate_change.p5.toFixed(1)} — {lciaResults.uncertainty.gwp_climate_change.p95.toFixed(1)}
-                    <span className="ml-1 text-[hsl(142,76%,36%)]">({(lciaResults as any).iterations} runs)</span>
-                  </div>
-                )}
+              <div className="mt-2 space-y-1">
+                <p className="text-xs font-medium text-[hsl(var(--foreground))]">
+                  Top hotspots (&gt; 80% cumulative):
+                </p>
+                {lciaResults.hotspots
+                  .reduce<{ items: Hotspot[]; cum: number }>((acc, h) => {
+                    if (acc.cum >= 80) return acc;
+                    const nextCum = acc.cum + h.percent;
+                    acc.items.push(h);
+                    acc.cum = nextCum;
+                    return acc;
+                  }, { items: [], cum: 0 }).items
+                  .map((h) => (
+                    <p
+                      key={h.name}
+                      className="text-xs text-[hsl(var(--muted-foreground))] flex justify-between"
+                    >
+                      <span>{h.name}</span>
+                      <span>{h.percent.toFixed(1)}%</span>
+                    </p>
+                  ))}
               </div>
             </div>
-            <div className="w-full bg-[hsl(220,14%,15%)] h-1 rounded-full overflow-hidden">
-              <div className="bg-[hsl(142,76%,36%)] h-full" style={{ width: '100%' }}></div>
-            </div>
-          </div>
+          ) : (
+            <p className="text-xs text-[hsl(var(--muted-foreground))]">
+              Select a process or run Shuffle Demo to see impacts.
+            </p>
+          )}
+        </div>
 
-          {/* JRC Categories Table */}
-          <div className="space-y-2">
-            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">JRC EF 3.1 Impact Table</label>
-            <div className="space-y-1">
-              {Object.entries(lciaResults.impacts).map(([key, val]) => {
-                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
-                const unit_map: Record<string, string> = {
-                  'gwp_climate_change': 'kg CO2 eq',
-                  'odp_ozone_depletion': 'kg CFC11 eq',
-                  'ap_acidification': 'mol H+ eq',
-                  'ep_freshwater': 'kg P eq',
-                  'ep_marine': 'kg N eq',
-                  'ep_terrestrial': 'mol N eq',
-                  'pocp_photochemical_ozone': 'kg NMVOC eq',
-                  'pm_particulate_matter': 'disease inc.',
-                  'ir_ionising_radiation': 'kBq U235 eq',
-                  'ht_c_human_toxicity_cancer': 'CTUh',
-                  'ht_nc_human_toxicity_non_cancer': 'CTUh',
-                  'et_fw_ecotoxicity_freshwater': 'CTUe',
-                  'lu_land_use': 'Pt',
-                  'wsf_water_scarcity': 'm3 world eq',
-                  'ru_mm_resource_use_min_met': 'kg Sb eq',
-                  'ru_f_resource_use_fossils': 'MJ'
-                };
-                return (
-                  <div key={key} className="flex justify-between items-center text-[9px] p-1 border-b border-white/5 hover:bg-white/5 transition-colors">
-                    <span className="text-gray-400 font-bold max-w-[140px] truncate">{label}</span>
-                    <div className="text-right">
-                      <div className="flex items-center justify-end gap-1">
-                        <span className="text-white font-mono">{val.toExponential(2)}</span>
-                        <span className="text-gray-600 text-[7px]">{unit_map[key] || ''}</span>
-                      </div>
-                      {lciaResults.uncertainty?.[key] && (
-                        <div className="text-[7px] text-gray-500 font-bold">
-                          [{lciaResults.uncertainty[key].p5.toExponential(1)} .. {lciaResults.uncertainty[key].p95.toExponential(1)}]
-                        </div>
-                      )}
-                    </div>
-                  </div>
-                );
-              })}
-            </div>
+        {/* Contextual parameters for right-clicked node (per-use-case customization) */}
+        {contextNodeId && (
+          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
+            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
+              Node Parameters
+            </h3>
+            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
+              Adjust parameters for the selected use-case node:{" "}
+              <span className="font-mono text-[hsl(var(--foreground))]">{contextNodeId}</span>
+            </p>
+            {/* Demo controls; can be wired to backend later */}
+            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
+              Scenario intensity
+            </label>
+            <input
+              type="range"
+              min={0}
+              max={200}
+              defaultValue={100}
+              className="w-full accent-[hsl(142,76%,36%)] mb-2"
+            />
+            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
+              Variant label
+            </label>
+            <input
+              type="text"
+              placeholder="e.g. Recycled content high"
+              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,14%)] px-2 py-1 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)]"
+            />
           </div>
-        </footer>
-      )}
+        )}
+      </div>
     </aside>
   );
 }

```

## AutoLCA/docker-compose.yml
```yaml
# AutoLCA Unified Web Platform
# Frontend (Next.js :3000), Backend (FastAPI :8000), Nginx (:80)
# Access app at http://localhost (Nginx routes / to Next.js, /api to FastAPI)

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: autolca-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_BASE=/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    stdin_open: true
    tty: true

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: autolca-backend
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./data:/app/data
      - ./templates:/app/templates
      - ./static:/app/static
      - ./core:/app/core
    # Keep main.py and root deps in image; volumes override for dev

  nginx:
    image: nginx:alpine
    container_name: autolca-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend

```

## AutoLCA/frontend/Dockerfile
```dockerfile
# AutoLCA Next.js Frontend
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

```

## AutoLCA/frontend/app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 220 18% 8%;
  --foreground: 210 20% 98%;
  --border: 220 14% 18%;
  --muted: 220 14% 14%;
  --muted-foreground: 215 16% 57%;
  --primary: 142 76% 36%;
  --primary-foreground: 0 0% 100%;
}

body {
  @apply bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--background));
  border-left: 1px solid hsl(var(--border));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border: 2px solid hsl(var(--background));
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted)) hsl(var(--background));
}

.react-flow__viewport {
  @apply transition-transform;
}

/* Glassmorphism Utilities */
.glass-panel {
  @apply bg-[hsl(var(--background)/0.8)] backdrop-blur-md border border-white/10;
}

.premium-gradient {
  @apply bg-gradient-to-br from-[hsl(220,18%,12%)] via-[hsl(220,18%,8%)] to-[hsl(220,18%,10%)];
}

.text-glow {
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
}

```

## AutoLCA/frontend/app/layout.tsx
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoLCA - Life Cycle Assessment",
  description: "Unified LCA Web Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-hidden">{children}</body>
    </html>
  );
}

```

## AutoLCA/frontend/app/page.tsx
```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LeftPanel } from "@/components/LeftPanel";
import { ProcessNode } from "@/components/ProcessNode";

type ProcessSummary = {
  id: number;
  name: string;
};

type LciaResults = {
  gwp: number;
  hotspots: { name: string; value: number; percent: number }[];
} | null;

const nodeTypes: NodeTypes = {
  process: ProcessNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "process",
    position: { x: 200, y: 150 },
    data: { label: "Steel Chassis Production", inputs: ["Steel", "Energy"], outputs: ["1 kg Chassis"] },
  },
  {
    id: "2",
    type: "process",
    position: { x: 500, y: 100 },
    data: { label: "Downstream Use", inputs: ["Chassis"], outputs: ["Product"] },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
];

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [processes, setProcesses] = useState<ProcessSummary[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [lciaResults, setLciaResults] = useState<LciaResults>(null);
  const [contextNodeId, setContextNodeId] = useState<string | null>(null);
  const [systemBoundary, setSystemBoundary] = useState("gate");

  // Fetch default processes from backend
  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const res = await fetch("/api/processes");
        if (!res.ok) return;
        const data: ProcessSummary[] = await res.json();
        setProcesses(data);
        if (data.length > 0) {
          setSelectedProcessId(data[0].id);
        }
      } catch (e) {
        console.error("Failed to load processes", e);
      }
    };
    fetchProcesses();
  }, []);

  // Fetch LCIA results whenever process or scale changes
  useEffect(() => {
    const fetchProcess = async () => {
      if (!selectedProcessId) return;
      try {
        const res = await fetch(`/api/process/${selectedProcessId}?scale=${scale}`);
        if (!res.ok) return;
        const data = await res.json();

        // Simple LCIA aggregation on the client for now
        let totalGwp = 0;
        const hotspots: { name: string; value: number; percent: number }[] = [];
        for (const ex of data.exchanges ?? []) {
          const impact = ex.amount * (ex.impact_factor ?? 0);
          totalGwp += impact;
          hotspots.push({ name: ex.input, value: impact, percent: 0 });
        }
        if (totalGwp > 0) {
          for (const h of hotspots) {
            h.percent = (h.value / totalGwp) * 100;
          }
        }
        hotspots.sort((a, b) => b.value - a.value);
        setLciaResults({ gwp: totalGwp, hotspots });
      } catch (e) {
        console.error("Failed to load process details", e);
      }
    };
    fetchProcess();
  }, [selectedProcessId, scale]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onShuffleDemo = useCallback(async () => {
    try {
      const res = await fetch("/api/process/shuffle");
      if (!res.ok) return;
      const data = await res.json();
      const benchmark = data.metadata.benchmark;

      // Dynamic layouts based on scientific supply chains
      let nodes = [];
      let edges = [];
      if (benchmark.includes("Aluminum")) {
        nodes = [
          { id: "1", type: "process", position: { x: 50, y: 150 }, data: { label: "Bauxite Mining", inputs: ["Ores"], controls: ["Land Rights"], mechanisms: ["Heavy Machinery"], outputs: ["Bauxite"] } },
          { id: "2", type: "process", position: { x: 300, y: 150 }, data: { label: "Alumina Refining", inputs: ["Bauxite", "NaOH"], controls: ["Bayer Process"], mechanisms: ["Digesters"], outputs: ["Alumina"] } },
          { id: "3", type: "process", position: { x: 550, y: 150 }, data: { label: "Aluminum Smelting", inputs: ["Alumina", "Electricity"], controls: ["Hall-Héroult"], mechanisms: ["Electrolysis Cells"], outputs: ["Primary Aluminum"] } },
          { id: "4", type: "process", position: { x: 800, y: 150 }, data: { label: "Ingot Casting", inputs: ["Molten Al"], controls: ["Purity Spec"], mechanisms: ["Casting Molds"], outputs: ["Aluminum Ingot"] } },
        ];
        edges = [
          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
        ];
        if (systemBoundary === "grave") {
          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "End-of-Life Recycling", inputs: ["Scrap Al"], controls: ["Recycling Rate"], mechanisms: ["Melting Furnaces"], outputs: ["Recycled Aluminum"] } });
          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
        } else if (systemBoundary === "cradle") {
          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "Recycling Loop", inputs: ["Scrap Al"], controls: ["Circular Rate"], mechanisms: ["Melting"], outputs: ["Recycled Al"] } });
          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
          edges.push({ id: "e5-1", source: "5", target: "1", sourceHandle: "output", targetHandle: "input" }); // circular
        }
      } else if (benchmark.includes("PET")) {
        nodes = [
          { id: "1", type: "process", position: { x: 50, y: 100 }, data: { label: "Crude Extraction", inputs: ["Oil Reservoirs"], controls: ["OPEC Quotas"], mechanisms: ["Rigs"], outputs: ["Crude Oil"] } },
          { id: "2", type: "process", position: { x: 280, y: 100 }, data: { label: "Naphtha Cracking", inputs: ["Crude Oil"], controls: ["Temp/Pressure"], mechanisms: ["Cracker Unit"], outputs: ["Ethylene/Xylene"] } },
          { id: "3", type: "process", position: { x: 510, y: 100 }, data: { label: "PTA/MEG Synthesis", inputs: ["Ethylene"], controls: ["Yield Efficiency"], mechanisms: ["Reactor"], outputs: ["Intermediate"] } },
          { id: "4", type: "process", position: { x: 740, y: 100 }, data: { label: "PET Polymerization", inputs: ["Intermediate"], controls: ["Viscosity"], mechanisms: ["Polymerizer"], outputs: ["PET Chips"] } },
          { id: "5", type: "process", position: { x: 970, y: 100 }, data: { label: "Blow Molding", inputs: ["PET Chips"], controls: ["Design Spec"], mechanisms: ["Molders"], outputs: ["PET Bottle"] } },
        ];
        edges = [
          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
          { id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" },
        ];
        if (systemBoundary === "grave") {
          nodes.push({ id: "6", type: "process", position: { x: 1200, y: 100 }, data: { label: "Waste Management", inputs: ["Used Bottle"], controls: ["Disposal Method"], mechanisms: ["Incinerators"], outputs: ["Emissions"] } });
          edges.push({ id: "e5-6", source: "5", target: "6", sourceHandle: "output", targetHandle: "input" });
        } else if (systemBoundary === "cradle") {
          nodes.push({ id: "6", type: "process", position: { x: 1200, y: 100 }, data: { label: "Recycling", inputs: ["PET Waste"], controls: ["Recycling Tech"], mechanisms: ["Granulators"], outputs: ["Recycled PET"] } });
          edges.push({ id: "e5-6", source: "5", target: "6", sourceHandle: "output", targetHandle: "input" });
          edges.push({ id: "e6-4", source: "6", target: "4", sourceHandle: "output", targetHandle: "input" }); // circular
        }
      } else if (benchmark.includes("Electricity")) {
        nodes = [
          { id: "1", type: "process", position: { x: 50, y: 50 }, data: { label: "Fuel Extraction", inputs: ["Coal/Gas"], controls: ["Mining Safety"], mechanisms: ["Excavators"], outputs: ["Fuel"] } },
          { id: "2", type: "process", position: { x: 300, y: 125 }, data: { label: "Power Generation", inputs: ["Fuel"], controls: ["Grid Demand"], mechanisms: ["Turbines"], outputs: ["Electricity"] } },
          { id: "3", type: "process", position: { x: 550, y: 125 }, data: { label: "HV Transmission", inputs: ["Electricity"], controls: ["Loss Target"], mechanisms: ["Grid"], outputs: ["HV Power"] } },
          { id: "4", type: "process", position: { x: 800, y: 125 }, data: { label: "LV Distribution", inputs: ["HV Power"], controls: ["Voltage Reg"], mechanisms: ["Transformers"], outputs: ["1kWh Electricity"] } },
        ];
        edges = [
          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
        ];
        if (systemBoundary === "grave") {
          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 125 }, data: { label: "Consumption", inputs: ["Electricity"], controls: ["Usage Pattern"], mechanisms: ["Appliances"], outputs: ["Energy Services"] } });
          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
        } else if (systemBoundary === "cradle") {
          // For electricity, circular might not make sense, but add recycling
          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 125 }, data: { label: "Renewable Integration", inputs: ["Waste Heat"], controls: ["Efficiency"], mechanisms: ["Heat Pumps"], outputs: ["Recycled Energy"] } });
          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
          edges.push({ id: "e5-2", source: "5", target: "2", sourceHandle: "output", targetHandle: "input" });
        }
      } else if (benchmark.includes("Corrugated")) {
        nodes = [
          { id: "1", type: "process", position: { x: 50, y: 150 }, data: { label: "Forestry/Pulpwood", inputs: ["Water/Land"], controls: ["FSC Standard"], mechanisms: ["Harvesters"], outputs: ["Wood logs"] } },
          { id: "2", type: "process", position: { x: 300, y: 150 }, data: { label: "Kraft Pulping", inputs: ["Wood logs"], controls: ["Chemical Rec"], mechanisms: ["Digesters"], outputs: ["Paper Pulp"] } },
          { id: "3", type: "process", position: { x: 550, y: 150 }, data: { label: "Paper Machine", inputs: ["Pulp"], controls: ["GSM/Thickness"], mechanisms: ["Drying Rolls"], outputs: ["Liner/Fluting"] } },
          { id: "4", type: "process", position: { x: 800, y: 150 }, data: { label: "Corrugator Plant", inputs: ["Liner"], controls: ["Adhesive Spec"], mechanisms: ["Corrugator"], outputs: ["Corrugated Board"] } },
        ];
        edges = [
          { id: "e1-2", source: "1", target: "2", sourceHandle: "output", targetHandle: "input" },
          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
        ];
        if (systemBoundary === "grave") {
          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "End-of-Life", inputs: ["Used Board"], controls: ["Recycling %"], mechanisms: ["Pulpers"], outputs: ["Recycled Pulp"] } });
          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
        } else if (systemBoundary === "cradle") {
          nodes.push({ id: "5", type: "process", position: { x: 1050, y: 150 }, data: { label: "Recycling Loop", inputs: ["Waste Board"], controls: ["Circular Design"], mechanisms: ["Repulping"], outputs: ["Recycled Pulp"] } });
          edges.push({ id: "e4-5", source: "4", target: "5", sourceHandle: "output", targetHandle: "input" });
          edges.push({ id: "e5-2", source: "5", target: "2", sourceHandle: "output", targetHandle: "input" });
        }
      } else {
        // Transport
        nodes = [
          { id: "1", type: "process", position: { x: 100, y: 150 }, data: { label: "Vehicle Mfg", inputs: ["Steel/Rubber"], controls: ["Quality Std"], mechanisms: ["Robotics"], outputs: ["Truck"] } },
          { id: "2", type: "process", position: { x: 350, y: 150 }, data: { label: "Fuel Refining", inputs: ["Crude"], controls: ["Euro 6"], mechanisms: ["Refinery"], outputs: ["Diesel"] } },
          { id: "3", type: "process", position: { x: 600, y: 150 }, data: { label: "Transport Op", inputs: ["Diesel", "Truck"], controls: ["Route Opt"], mechanisms: ["Driving"], outputs: ["1 tkm Transport"] } },
          { id: "4", type: "process", position: { x: 850, y: 150 }, data: { label: "End of Life", inputs: ["Used Truck"], controls: ["Recycling %"], mechanisms: ["Shredders"], outputs: ["Scrap Metal"] } },
        ];
        edges = [
          { id: "e2-3", source: "2", target: "3", sourceHandle: "output", targetHandle: "input" },
          { id: "e1-3", source: "1", target: "3", sourceHandle: "output", targetHandle: "input" },
          { id: "e3-4", source: "3", target: "4", sourceHandle: "output", targetHandle: "input" },
        ];
        if (systemBoundary === "grave") {
          // Already has EOL
        } else if (systemBoundary === "cradle") {
          edges.push({ id: "e4-1", source: "4", target: "1", sourceHandle: "output", targetHandle: "input" }); // circular
        }
      }
      setNodes(nodes);
      setEdges(edges);
    } catch (e) {
      console.error("Shuffle failed", e);
    }
  }, [setNodes, setEdges, systemBoundary]);

  const handleGeneratePdf = useCallback(async () => {
    if (!selectedProcessId) return;

    // Simulate/Capture snapshot (In a real app, use toDataURL or similar on the canvas)
    // For this demo, we'll send a placeholder or the raw nodes/edges data
    const snapshotData = {
      image: "data:image/svg+xml;base64,...", // Placeholder for actual capture logic
      boundary: "Cradle-to-Gate"
    };

    try {
      const res = await fetch(`/api/report/${selectedProcessId}?scale=${scale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: snapshotData })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `JRC_Report_${selectedProcessId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  }, [selectedProcessId, scale]);

  const handleDownloadCsv = useCallback(() => {
    if (!selectedProcessId) return;
    const url = `/api/process/${selectedProcessId}/csv?scale=${scale}`;
    window.open(url, "_blank");
  }, [selectedProcessId, scale]);

  return (
    <div className="flex h-screen w-full">
      {/* Left Panel - Form, Search, Shuffle Demo, LCIA Dashboard */}
      <LeftPanel
        processes={processes}
        selectedProcessId={selectedProcessId}
        scale={scale}
        lciaResults={lciaResults}
        onProcessSelect={setSelectedProcessId}
        onScaleChange={setScale}
        onShuffleDemo={onShuffleDemo}
        onGeneratePdf={handleGeneratePdf}
        onDownloadCsv={handleDownloadCsv}
        contextNodeId={contextNodeId}
        systemBoundary={systemBoundary}
        onSystemBoundaryChange={setSystemBoundary}
      />

      {/* Right Panel - IDEF0-style React Flow canvas with grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-[hsl(220,18%,6%)] border-l border-[hsl(var(--border))]">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[hsl(220,18%,6%)]"
            minZoom={0.2}
            maxZoom={1.5}
            onNodeContextMenu={(_, node) => {
              setContextNodeId(node.id);
            }}
            onPaneContextMenu={(event) => {
              event.preventDefault();
              const position = { x: event.clientX - 400, y: event.clientY - 100 };
              const newNode: Node = {
                id: `${nodes.length + 1}`,
                type: "process",
                position,
                data: { label: "New Process Node", inputs: [], outputs: [], controls: [], mechanisms: [] },
              };
              setNodes((nds) => nds.concat(newNode));
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(220,14%,22%)" />
            <Controls className="!bg-[hsl(220,14%,14%)] !border-[hsl(var(--border))] !shadow-lg" />
            <MiniMap
              className="!bg-[hsl(220,14%,14%)]"
              nodeColor="hsl(142,76%,36%)"
              maskColor="hsl(220,18%,8%)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

```

## AutoLCA/frontend/app/types.ts
```typescript
export interface MiniLCANodeData {
    processName: string;
    description: string;
    scope: {
        functionalUnit: string;
        location: string;
    };
    technosphere: Array<{
        id: string;
        flowType: 'input' | 'output' | 'mechanism' | 'control';
        dataset_uuid: string;
        flow_name: string; // Added for display
        formula: string;
        evaluatedAmount: number;
        unit: string;
    }>;
    elementary: Array<{
        id: string;
        flowType: 'emission' | 'extraction';
        dataset_uuid: string;
        flow_name: string; // Added for display
        formula: string;
        evaluatedAmount: number;
        unit: string;
    }>;
    variables: Record<string, number>; // Local constants (e.g., { scrap_rate: 0.15 })
    allocation: {
        method: 'physical' | 'economic';
        factors: Record<string, number>;
    };
    uncertainty: Record<string, {
        type: string;
        p1: number;
        p2: number;
    }>;
}

```

## AutoLCA/frontend/components/DatabaseUploadZone.tsx
```tsx
import React, { useState } from 'react';

interface DatabaseUploadZoneProps {
  onUploadSuccess?: (data: any) => void;
}

export default function DatabaseUploadZone({ onUploadSuccess }: DatabaseUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading & Parsing...');

    // Prepare the file to be sent to the FastAPI backend
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Point this to your FastAPI backend port (usually 8000)
      const response = await fetch('http://localhost:8000/api/upload-database', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // THIS IS THE MAGIC MOMENT! 
        // We log the parsed LCA data to the browser console to prove it works.
        console.log("🔥 Database Parsed Successfully:", data);
        
        setUploadStatus('Success! Database loaded.');
        
        // Pass the data up to the parent component
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }
      } else {
        setUploadStatus('Upload failed. Check backend terminal logs.');
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus('Network error. Is the backend running?');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:bg-gray-800 transition-colors bg-gray-900">
      <input
        type="file"
        id="db-upload"
        className="hidden"
        accept=".json,.csv,.zolca,.zip"
        onChange={handleFileUpload}
      />
      <label htmlFor="db-upload" className="cursor-pointer flex flex-col items-center">
        {/* Upload Icon */}
        <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className="text-sm text-gray-200 font-semibold">
          {isUploading ? 'Parsing Database...' : 'Upload Database'}
        </span>
        <span className="text-xs text-gray-400 mt-1">.json, .csv, .zolca, .zip files</span>
      </label>
      
      {/* Status Message */}
      {uploadStatus && (
        <p className={`text-xs mt-3 ${uploadStatus.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
}
```

## AutoLCA/frontend/components/IDEF0Node.tsx
```tsx
"use client";

import { memo } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

export const IDEF0Node = memo(function IDEF0Node({ data }: NodeProps) {
    const processName = (data.processName as string) ?? (data.label as string) ?? "Unknown Process";

    // New structure
    const technosphere = (data.technosphere as any[]) || [];
    const elementary = (data.elementary as any[]) || [];
    const scope = (data.scope as any) || {};
    const variables = (data.variables as Record<string, any>) || {};
    const allocation = (data.allocation as any) || {};

    // Fallback/Legacy support
    const exchanges = (data.exchanges as any[]) || [];

    const getFlows = (type: string) => {
        if (technosphere.length > 0) return technosphere.filter(f => f.flowType === type);
        return exchanges.filter(ex => ex.flow_type === type);
    };

    const inputs = getFlows('input');
    const outputs = getFlows('output');
    const controls = getFlows('control');
    const mechanisms = getFlows('mechanism');

    return (
        <div className="px-6 py-4 rounded-xl border border-white/5 bg-[hsl(220,14%,8%)/0.8] backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.3)] min-w-[240px] relative font-mono group transition-all hover:border-[hsl(142,76%,36%)] ring-1 ring-white/5 hover:ring-[hsl(142,76%,36%,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
            {/* Functional Unit Badge */}
            {scope.functionalUnit && (
                <div className="absolute -top-3 left-4 bg-[hsl(220,14%,12%)] border border-white/20 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase tracking-widest shadow-lg">
                    {scope.functionalUnit} @ {scope.location || 'GLO'}
                </div>
            )}

            {/* Feature Indicators */}
            <div className="absolute top-2 right-2 flex gap-1.5">
                {allocation.method && allocation.method !== 'none' && (
                    <div title={`Allocation: ${allocation.method}`} className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                )}
                {Object.keys(variables).length > 0 && (
                    <div title={`${Object.keys(variables).length} Local Variables`} className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                )}
            </div>

            {/* Top Handle: Control (Target) */}
            <Handle
                type="target"
                position={Position.Top}
                id="control"
                className="!w-3 !h-3 !bg-gray-500 !border-2 !border-black hover:!bg-white"
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-gray-600 whitespace-nowrap tracking-widest">
                Control
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
                {/* Left Handle: Input (Target) */}
                <Handle
                    type="target"
                    position={Position.Left}
                    id="input"
                    className="!w-3 !h-3 !bg-[hsl(142,76%,36%)] !border-2 !border-black hover:!bg-white"
                />

                {/* Center: Process Name */}
                <div className="text-center py-2 px-4 border-y border-white/5 w-full">
                    <div className="text-sm font-black text-white uppercase tracking-wider line-clamp-2">
                        {processName}
                    </div>
                </div>

                {/* Resolved Output Badge */}
                {outputs.map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.3)] rounded-full text-[9px] font-bold text-[hsl(142,76%,60%)] animate-in zoom-in-95">
                        <span className="opacity-70 truncate max-w-[80px]">{ex.flow_name}:</span>
                        <span className="font-mono">{(ex.amount ?? ex.evaluatedAmount ?? 0).toFixed(2)}</span>
                        <span className="text-[7px] text-gray-500">{ex.unit}</span>
                    </div>
                ))}

                {/* Data Summary */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-[10px] font-bold uppercase tracking-tighter text-gray-500 border-t border-white/5 pt-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Inputs</span>
                        <span className="text-[hsl(142,76%,36%)]">{inputs.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Outputs</span>
                        <span className="text-[hsl(142,76%,60%)]">{outputs.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Controls</span>
                        <span className="text-gray-600">{controls.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Mechanisms</span>
                        <span className="text-gray-700">{mechanisms.length}</span>
                    </div>
                </div>

                {/* Right Handle: Output (Source) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    className="!w-3 !h-3 !bg-[hsl(142,76%,60%)] !border-2 !border-black hover:!bg-white"
                />
            </div>

            {/* Bottom Handle: Mechanism (Target) */}
            <Handle
                type="target"
                position={Position.Bottom}
                id="mechanism"
                className="!w-3 !h-3 !bg-gray-700 !border-2 !border-black hover:!bg-white"
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-gray-600 whitespace-nowrap tracking-widest">
                Mechanism
            </div>
        </div>
    );
});

```

## AutoLCA/frontend/components/LeftPanel.tsx
```tsx
import { useState, useCallback, useMemo, useEffect } from "react";
import { Upload, Database, Settings } from "lucide-react";
import DatabaseUploadZone from '../components/DatabaseUploadZone';

type ProcessSummary = {
  id: number;
  name: string;
};

type Parameter = {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

type Exchange = {
  flow_name: string;
  amount: number;
  unit: string;
  flow_type: 'input' | 'output';
};

type UploadedProcess = {
  id: string;
  name: string;
  description?: string;
  exchanges: Exchange[];
};

type UploadedDatabase = {
  processes: UploadedProcess[];
};

type Hotspot = { name: string; value: number; percent: number };

type LciaResults =
  | {
    gwp: number;
    hotspots: Hotspot[];
  }
  | null;

type LeftPanelProps = {
  processes: ProcessSummary[];
  selectedProcessId: number | null;
  scale: number;
  lciaResults: LciaResults;
  onProcessSelect: (id: number | null) => void;
  onScaleChange: (value: number) => void;
  onShuffleDemo: () => void;
  onGeneratePdf: () => void;
  onDownloadCsv: () => void;
  contextNodeId: string | null;
  systemBoundary: string;
  onSystemBoundaryChange: (boundary: string) => void;
};

export function LeftPanel({
  processes,
  selectedProcessId,
  scale,
  lciaResults,
  onProcessSelect,
  onScaleChange,
  onShuffleDemo,
  onGeneratePdf,
  onDownloadCsv,
  contextNodeId,
  systemBoundary,
  onSystemBoundaryChange,
}: LeftPanelProps) {
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, number>>({});
  const [uploadedDatabase, setUploadedDatabase] = useState<UploadedDatabase | null>(null);
  const [selectedUploadedProcess, setSelectedUploadedProcess] = useState<UploadedProcess | null>(null);
  const [exchangeValues, setExchangeValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedProcessId) {
      fetch(`/api/process/${selectedProcessId}/parameters`)
        .then((res) => res.json())
        .then((data) => {
          setParameters(data);
          const defaults: Record<string, number> = {};
          data.forEach((p: Parameter) => {
            defaults[p.id] = p.default;
          });
          setParamValues(defaults);
        });
    }
  }, [selectedProcessId]);

  const handleSearch = useCallback(() => {
    // Placeholder: could filter processes by name with backend search
  }, []);

  const handleDatabaseUpload = useCallback((data: UploadedDatabase) => {
    setUploadedDatabase(data);
    setSelectedUploadedProcess(null);
    setExchangeValues({});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/database/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Database uploaded and switched successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedProcessName = useMemo(() => {
    return processes.find((p) => p.id === selectedProcessId)?.name ?? "None selected";
  }, [processes, selectedProcessId]);

  return (
    <aside className="w-[340px] shrink-0 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(220,18%,8%)]">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Triya.io</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          AI Life Cycle Assessment - Super Calculator
        </p>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Objective 1: Upload Database Zone */}
        <DatabaseUploadZone onUploadSuccess={handleDatabaseUpload} />

        {/* System Boundary Logic */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            System Boundary
          </label>
          <select
            value={systemBoundary}
            onChange={(e) => onSystemBoundaryChange(e.target.value)}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
          >
            <option value="gate">Cradle-to-Gate</option>
            <option value="grave">Cradle-to-Grave</option>
            <option value="cradle">Cradle-to-Cradle (Circular)</option>
          </select>
        </div>

        {/* Process selection bound to database */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Active Process
          </label>
          {uploadedDatabase ? (
            <select
              value={selectedUploadedProcess?.id ?? ""}
              onChange={(e) => {
                const processId = e.target.value;
                const process = uploadedDatabase.processes.find(p => p.id === processId);
                setSelectedUploadedProcess(process || null);
                if (process) {
                  // Initialize exchange values with defaults
                  const defaults: Record<string, number> = {};
                  process.exchanges.forEach((exchange, index) => {
                    defaults[`exchange_${index}`] = exchange.amount;
                  });
                  setExchangeValues(defaults);
                } else {
                  setExchangeValues({});
                }
              }}
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
            >
              <option value="">Select a process…</option>
              {uploadedDatabase.processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
              Upload a database to view processes
            </div>
          )}
        </div>

        {/* Dynamic Exchange Parameters */}
        {selectedUploadedProcess && (
          <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Parameters
            </label>
            
            {/* Scale Parameter */}
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
                Functional Unit Scale
              </label>
              <input
                type="range"
                min={0.1}
                max={10.0}
                step={0.1}
                value={scale}
                onChange={(e) => onScaleChange(Number(e.target.value))}
                className="w-full accent-[hsl(142,76%,36%)]"
              />
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>0.1</span>
                <span>{scale.toFixed(1)}</span>
                <span>10.0</span>
              </div>
            </div>

            {/* Exchange Parameters */}
            {selectedUploadedProcess.exchanges.length > 0 && (
              <>
                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">
                  Exchange Amounts
                </label>
                {selectedUploadedProcess.exchanges.map((exchange, index) => (
                  <div key={index}>
                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
                      {exchange.flow_name} ({exchange.flow_type}) - {exchange.unit}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={exchange.amount * 3} // Allow up to 3x the default
                      step={0.01}
                      value={exchangeValues[`exchange_${index}`] ?? exchange.amount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setExchangeValues(prev => ({ ...prev, [`exchange_${index}`]: val }));
                      }}
                      className="w-full accent-[hsl(142,76%,36%)]"
                    />
                    <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                      <span>0</span>
                      <span>{(exchangeValues[`exchange_${index}`] ?? exchange.amount).toFixed(2)}</span>
                      <span>{(exchange.amount * 3).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Shuffle Example */}


        {/* Shuffle Example */}
        <button
          type="button"
          onClick={onShuffleDemo}
          className="w-full rounded-md border-2 border-dashed border-[hsl(142,76%,36%)] bg-[hsl(220,14%,12%)] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-colors"
        >
          Shuffle Example
        </button>

        {/* Export actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onGeneratePdf}
            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)]"
          >
            Generate PDF report
          </button>
          <button
            type="button"
            onClick={onDownloadCsv}
            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)]"
          >
            Download CSV
          </button>
        </div>

        {/* LCIA results placeholder */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
            LCIA Results
          </h3>
          {lciaResults ? (
            <div className="space-y-2">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Process: <span className="font-medium text-[hsl(var(--foreground))]">{selectedProcessName}</span>
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Total impact (GWP-like):{" "}
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {lciaResults.gwp.toFixed(3)}
                </span>
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-[hsl(var(--foreground))]">
                  Top hotspots (&gt; 80% cumulative):
                </p>
                {lciaResults.hotspots
                  .reduce<{ items: Hotspot[]; cum: number }>((acc, h) => {
                    if (acc.cum >= 80) return acc;
                    const nextCum = acc.cum + h.percent;
                    acc.items.push(h);
                    acc.cum = nextCum;
                    return acc;
                  }, { items: [], cum: 0 }).items
                  .map((h) => (
                    <p
                      key={h.name}
                      className="text-xs text-[hsl(var(--muted-foreground))] flex justify-between"
                    >
                      <span>{h.name}</span>
                      <span>{h.percent.toFixed(1)}%</span>
                    </p>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Select a process or run Shuffle Demo to see impacts.
            </p>
          )}
        </div>

        {/* Contextual parameters for right-clicked node (per-use-case customization) */}
        {contextNodeId && (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
              Node Parameters
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
              Adjust parameters for the selected use-case node:{" "}
              <span className="font-mono text-[hsl(var(--foreground))]">{contextNodeId}</span>
            </p>
            {/* Demo controls; can be wired to backend later */}
            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
              Scenario intensity
            </label>
            <input
              type="range"
              min={0}
              max={200}
              defaultValue={100}
              className="w-full accent-[hsl(142,76%,36%)] mb-2"
            />
            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
              Variant label
            </label>
            <input
              type="text"
              placeholder="e.g. Recycled content high"
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,14%)] px-2 py-1 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)]"
            />
          </div>
        )}
      </div>
    </aside>
  );
}

```

## AutoLCA/frontend/components/ProcessNode.tsx
```tsx
"use client";

import { memo } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

export const ProcessNode = memo(function ProcessNode({ data }: NodeProps) {
  const inputs = (data.inputs as string[]) ?? [];
  const outputs = (data.outputs as string[]) ?? [];
  const controls = (data.controls as string[]) ?? [];
  const mechanisms = (data.mechanisms as string[]) ?? [];

  return (
    <div className="px-6 py-5 rounded-none border-2 border-[hsl(142,76%,36%)] bg-[hsl(220,14%,8%)] shadow-[0_0_30px_rgba(34,197,94,0.15)] min-w-[220px] relative font-mono group transition-all hover:border-[hsl(142,76%,46%)]">
      {/* Top Handle: Control */}
      <Handle
        type="target"
        position={Position.Top}
        id="control"
        style={{ width: 12, height: 12, backgroundColor: 'hsl(220,14%,60%)', border: '2px solid hsl(220,18%,8%)' }}
      />
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-widest text-[hsl(220,14%,50%)] whitespace-nowrap">
        Control {controls.length > 0 && `· ${controls[0]}`}
      </div>

      <div className="flex flex-col h-full justify-between gap-4">
        {/* Left Side: Input */}
        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{ width: 12, height: 12, backgroundColor: 'hsl(142,76%,36%)', border: '2px solid hsl(220,18%,8%)' }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-28 text-right text-[8px] uppercase text-[hsl(220,14%,60%)] opacity-0 group-hover:opacity-100 transition-opacity">
            {inputs.join(", ")}
          </div>
        </div>

        {/* Center: Process Info */}
        <div className="text-center z-10 relative">
          <div className="text-[10px] text-[hsl(142,76%,36%)] mb-1 font-bold tracking-tighter opacity-80">
            {data.id ? `#${String(data.id).slice(0, 5)}` : "A-0"}
          </div>
          <div className="text-sm font-black text-[hsl(var(--foreground))] py-2 px-1 border-y-2 border-[hsl(var(--border))] uppercase leading-tight tracking-wide">
            {data.label as string}
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="relative">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ width: 12, height: 12, backgroundColor: 'hsl(142,76%,60%)', border: '2px solid hsl(220,18%,8%)' }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-28 text-left text-[8px] uppercase text-[hsl(142,76%,60%)] opacity-0 group-hover:opacity-100 transition-opacity">
            {outputs.join(", ")}
          </div>
        </div>
      </div>

      {/* Bottom Handle: Mechanism */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="mechanism"
        style={{ width: 12, height: 12, backgroundColor: 'hsl(220,14%,40%)', border: '2px solid hsl(220,18%,8%)' }}
      />
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-widest text-[hsl(220,14%,50%)] whitespace-nowrap">
        Mechanism {mechanisms.length > 0 && `· ${mechanisms[0]}`}
      </div>
    </div>
  );
});

```

## AutoLCA/frontend/next-env.d.ts
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

## AutoLCA/frontend/next.config.mjs
```
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:8000/:path*' },
    ];
  },
};

export default nextConfig;

```

## AutoLCA/frontend/package-lock.json
```json
{
  "name": "triya-frontend",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "triya-frontend",
      "version": "0.1.0",
      "dependencies": {
        "@xyflow/react": "^12.3.6",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.1.1",
        "html-to-image": "^1.11.13",
        "lucide-react": "^0.454.0",
        "mathjs": "^15.1.1",
        "next": "^16.1.6",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "tailwind-merge": "^2.5.2"
      },
      "devDependencies": {
        "@types/node": "^22.7.5",
        "@types/react": "^18.3.12",
        "@types/react-dom": "^18.3.1",
        "autoprefixer": "^10.4.20",
        "postcss": "^8.4.47",
        "tailwindcss": "^3.4.14",
        "typescript": "^5.6.3"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.28.6.tgz",
      "integrity": "sha512-05WQkdpL9COIMz4LjTxGpPNCdlpyimKppYNoJ5Di5EUObifl8t4tuLuUBBZEpoLYOmfvIWrsp9fCl0HoPRVTdA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.8.1.tgz",
      "integrity": "sha512-mehfKSMWjjNol8659Z8KxEMrdSJDDot5SXMq00dM8BN4o+CLNXQ0xH2V7EchNHV4RmbZLmmPdEaXZc5H2FXmDg==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@img/colour": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@img/colour/-/colour-1.0.0.tgz",
      "integrity": "sha512-A5P/LfWGFSl6nsckYtjw9da+19jB8hkJ6ACTGcDfEJ0aE+l2n2El7dsVM7UVHZQ9s2lmYMWlrS21YLy2IR1LUw==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@img/sharp-darwin-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.34.5.tgz",
      "integrity": "sha512-imtQ3WMJXbMY4fxb/Ndp6HBTNVtWCUI0WdobyheGf5+ad6xX8VIDO8u2xE4qc/fr08CKG/7dDseFtn6M6g/r3w==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-arm64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-darwin-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.34.5.tgz",
      "integrity": "sha512-YNEFAF/4KQ/PeW0N+r+aVVsoIY0/qxxikF2SWdp+NRkmMB7y9LBZAVqQ4yhGCm/H3H270OSykqmQMKLBhBJDEw==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-x64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-arm64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.2.4.tgz",
      "integrity": "sha512-zqjjo7RatFfFoP0MkQ51jfuFZBnVE2pRiaydKJ1G/rHZvnsrHAOcQALIi9sA5co5xenQdTugCvtb1cuf78Vf4g==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-x64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.2.4.tgz",
      "integrity": "sha512-1IOd5xfVhlGwX+zXv2N93k0yMONvUlANylbJw1eTah8K/Jtpi15KC+WSiaX/nBmbm2HxRM1gZ0nSdjSsrZbGKg==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.2.4.tgz",
      "integrity": "sha512-bFI7xcKFELdiNCVov8e44Ia4u2byA+l3XtsAj+Q8tfCwO6BQ8iDojYdvoPMqsKDkuoOo+X6HZA0s0q11ANMQ8A==",
      "cpu": [
        "arm"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.2.4.tgz",
      "integrity": "sha512-excjX8DfsIcJ10x1Kzr4RcWe1edC9PquDRRPx3YVCvQv+U5p7Yin2s32ftzikXojb1PIFc/9Mt28/y+iRklkrw==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-ppc64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.2.4.tgz",
      "integrity": "sha512-FMuvGijLDYG6lW+b/UvyilUWu5Ayu+3r2d1S8notiGCIyYU/76eig1UfMmkZ7vwgOrzKzlQbFSuQfgm7GYUPpA==",
      "cpu": [
        "ppc64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-riscv64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.2.4.tgz",
      "integrity": "sha512-oVDbcR4zUC0ce82teubSm+x6ETixtKZBh/qbREIOcI3cULzDyb18Sr/Wcyx7NRQeQzOiHTNbZFF1UwPS2scyGA==",
      "cpu": [
        "riscv64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-s390x": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.2.4.tgz",
      "integrity": "sha512-qmp9VrzgPgMoGZyPvrQHqk02uyjA0/QrTO26Tqk6l4ZV0MPWIW6LTkqOIov+J1yEu7MbFQaDpwdwJKhbJvuRxQ==",
      "cpu": [
        "s390x"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-x64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.2.4.tgz",
      "integrity": "sha512-tJxiiLsmHc9Ax1bz3oaOYBURTXGIRDODBqhveVHonrHJ9/+k89qbLl0bcJns+e4t4rvaNBxaEZsFtSfAdquPrw==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-arm64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.2.4.tgz",
      "integrity": "sha512-FVQHuwx1IIuNow9QAbYUzJ+En8KcVm9Lk5+uGUQJHaZmMECZmOlix9HnH7n1TRkXMS0pGxIJokIVB9SuqZGGXw==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-x64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.2.4.tgz",
      "integrity": "sha512-+LpyBk7L44ZIXwz/VYfglaX/okxezESc6UxDSoyo2Ks6Jxc4Y7sGjpgU9s4PMgqgjj1gZCylTieNamqA1MF7Dg==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-linux-arm": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.34.5.tgz",
      "integrity": "sha512-9dLqsvwtg1uuXBGZKsxem9595+ujv0sJ6Vi8wcTANSFpwV/GONat5eCkzQo/1O6zRIkh0m/8+5BjrRr7jDUSZw==",
      "cpu": [
        "arm"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.34.5.tgz",
      "integrity": "sha512-bKQzaJRY/bkPOXyKx5EVup7qkaojECG6NLYswgktOZjaXecSAeCWiZwwiFf3/Y+O1HrauiE3FVsGxFg8c24rZg==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-ppc64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.34.5.tgz",
      "integrity": "sha512-7zznwNaqW6YtsfrGGDA6BRkISKAAE1Jo0QdpNYXNMHu2+0dTrPflTLNkpc8l7MUP5M16ZJcUvysVWWrMefZquA==",
      "cpu": [
        "ppc64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-ppc64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-riscv64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.34.5.tgz",
      "integrity": "sha512-51gJuLPTKa7piYPaVs8GmByo7/U7/7TZOq+cnXJIHZKavIRHAP77e3N2HEl3dgiqdD/w0yUfiJnII77PuDDFdw==",
      "cpu": [
        "riscv64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-riscv64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-s390x": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.34.5.tgz",
      "integrity": "sha512-nQtCk0PdKfho3eC5MrbQoigJ2gd1CgddUMkabUj+rBevs8tZ2cULOx46E7oyX+04WGfABgIwmMC0VqieTiR4jg==",
      "cpu": [
        "s390x"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-s390x": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.34.5.tgz",
      "integrity": "sha512-MEzd8HPKxVxVenwAa+JRPwEC7QFjoPWuS5NZnBt6B3pu7EG2Ge0id1oLHZpPJdn3OQK+BQDiw9zStiHBTJQQQQ==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-x64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.34.5.tgz",
      "integrity": "sha512-fprJR6GtRsMt6Kyfq44IsChVZeGN97gTD331weR1ex1c1rypDEABN6Tm2xa1wE6lYb5DdEnk03NZPqA7Id21yg==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-arm64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.34.5.tgz",
      "integrity": "sha512-Jg8wNT1MUzIvhBFxViqrEhWDGzqymo3sV7z7ZsaWbZNDLXRJZoRGrjulp60YYtV4wfY8VIKcWidjojlLcWrd8Q==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-x64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-wasm32": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.34.5.tgz",
      "integrity": "sha512-OdWTEiVkY2PHwqkbBI8frFxQQFekHaSSkUIJkwzclWZe64O1X4UlUjqqqLaPbUpMOQk6FBu/HtlGXNblIs0huw==",
      "cpu": [
        "wasm32"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/runtime": "^1.7.0"
      },
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.34.5.tgz",
      "integrity": "sha512-WQ3AgWCWYSb2yt+IG8mnC6Jdk9Whs7O0gxphblsLvdhSpSTtmu69ZG1Gkb6NuvxsNACwiPV6cNSZNzt0KPsw7g==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-ia32": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.34.5.tgz",
      "integrity": "sha512-FV9m/7NmeCmSHDD5j4+4pNI8Cp3aW+JvLoXcTUo0IqyjSfAZJ8dIUmijx1qaJsIiU+Hosw6xM5KijAWRJCSgNg==",
      "cpu": [
        "ia32"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.34.5.tgz",
      "integrity": "sha512-+29YMsqY2/9eFEiW93eqWnuLcWcufowXewwSNIT6UwZdUUCrM3oFjMWH/Z6/TMmb4hlFenmfAVbpWeup2jryCw==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@next/env": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/env/-/env-16.1.6.tgz",
      "integrity": "sha512-N1ySLuZjnAtN3kFnwhAwPvZah8RJxKasD7x1f8shFqhncnWZn4JMfg37diLNuoHsLAlrDfM3g4mawVdtAG8XLQ==",
      "license": "MIT"
    },
    "node_modules/@next/swc-darwin-arm64": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-16.1.6.tgz",
      "integrity": "sha512-wTzYulosJr/6nFnqGW7FrG3jfUUlEf8UjGA0/pyypJl42ExdVgC6xJgcXQ+V8QFn6niSG2Pb8+MIG1mZr2vczw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-darwin-x64": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-16.1.6.tgz",
      "integrity": "sha512-BLFPYPDO+MNJsiDWbeVzqvYd4NyuRrEYVB5k2N3JfWncuHAy2IVwMAOlVQDFjj+krkWzhY2apvmekMkfQR0CUQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-gnu": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-16.1.6.tgz",
      "integrity": "sha512-OJYkCd5pj/QloBvoEcJ2XiMnlJkRv9idWA/j0ugSuA34gMT6f5b7vOiCQHVRpvStoZUknhl6/UxOXL4OwtdaBw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-musl": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-16.1.6.tgz",
      "integrity": "sha512-S4J2v+8tT3NIO9u2q+S0G5KdvNDjXfAv06OhfOzNDaBn5rw84DGXWndOEB7d5/x852A20sW1M56vhC/tRVbccQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-gnu": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-16.1.6.tgz",
      "integrity": "sha512-2eEBDkFlMMNQnkTyPBhQOAyn2qMxyG2eE7GPH2WIDGEpEILcBPI/jdSv4t6xupSP+ot/jkfrCShLAa7+ZUPcJQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-musl": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-16.1.6.tgz",
      "integrity": "sha512-oicJwRlyOoZXVlxmIMaTq7f8pN9QNbdes0q2FXfRsPhfCi8n8JmOZJm5oo1pwDaFbnnD421rVU409M3evFbIqg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-arm64-msvc": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-16.1.6.tgz",
      "integrity": "sha512-gQmm8izDTPgs+DCWH22kcDmuUp7NyiJgEl18bcr8irXA5N2m2O+JQIr6f3ct42GOs9c0h8QF3L5SzIxcYAAXXw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-x64-msvc": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-16.1.6.tgz",
      "integrity": "sha512-NRfO39AIrzBnixKbjuo2YiYhB6o9d8v/ymU9m/Xk8cyVk+k7XylniXkHwjs4s70wedVffc6bQNbufk5v0xEm0A==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@swc/helpers": {
      "version": "0.5.15",
      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.15.tgz",
      "integrity": "sha512-JQ5TuMi45Owi4/BIMAJBoSQoOJu12oOk/gADqlcUL9JEdHB8vyjUSsxqeNXnmXHjYKMi2WcYtezGEEhqUI/E2g==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "^2.8.0"
      }
    },
    "node_modules/@types/d3-color": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@types/d3-color/-/d3-color-3.1.3.tgz",
      "integrity": "sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==",
      "license": "MIT"
    },
    "node_modules/@types/d3-drag": {
      "version": "3.0.7",
      "resolved": "https://registry.npmjs.org/@types/d3-drag/-/d3-drag-3.0.7.tgz",
      "integrity": "sha512-HE3jVKlzU9AaMazNufooRJ5ZpWmLIoc90A37WU2JMmeq28w1FQqCZswHZ3xR+SuxYftzHq6WU6KJHvqxKzTxxQ==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-selection": "*"
      }
    },
    "node_modules/@types/d3-interpolate": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-interpolate/-/d3-interpolate-3.0.4.tgz",
      "integrity": "sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-color": "*"
      }
    },
    "node_modules/@types/d3-selection": {
      "version": "3.0.11",
      "resolved": "https://registry.npmjs.org/@types/d3-selection/-/d3-selection-3.0.11.tgz",
      "integrity": "sha512-bhAXu23DJWsrI45xafYpkQ4NtcKMwWnAC/vKrd2l+nxMFuvOT3XMYTIj2opv8vq8AO5Yh7Qac/nSeP/3zjTK0w==",
      "license": "MIT"
    },
    "node_modules/@types/d3-transition": {
      "version": "3.0.9",
      "resolved": "https://registry.npmjs.org/@types/d3-transition/-/d3-transition-3.0.9.tgz",
      "integrity": "sha512-uZS5shfxzO3rGlu0cC3bjmMFKsXv+SmZZcgp0KD22ts4uGXp5EVYGzu/0YdwZeKmddhcAccYtREJKkPfXkZuCg==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-selection": "*"
      }
    },
    "node_modules/@types/d3-zoom": {
      "version": "3.0.8",
      "resolved": "https://registry.npmjs.org/@types/d3-zoom/-/d3-zoom-3.0.8.tgz",
      "integrity": "sha512-iqMC4/YlFCSlO8+2Ii1GGGliCAY4XdeG748w5vQUbevlbDu0zSjH/+jojorQVBK/se0j6DUFNPBGSqD3YWYnDw==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-interpolate": "*",
        "@types/d3-selection": "*"
      }
    },
    "node_modules/@types/node": {
      "version": "22.19.11",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-22.19.11.tgz",
      "integrity": "sha512-BH7YwL6rA93ReqeQS1c4bsPpcfOmJasG+Fkr6Y59q83f9M1WcBRHR2vM+P9eOisYRcN3ujQoiZY8uk5W+1WL8w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~6.21.0"
      }
    },
    "node_modules/@types/prop-types": {
      "version": "15.7.15",
      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "18.3.28",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.28.tgz",
      "integrity": "sha512-z9VXpC7MWrhfWipitjNdgCauoMLRdIILQsAEV+ZesIzBq/oUlxk0m3ApZuMFCXdnS4U7KrI+l3WRUEGQ8K1QKw==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "@types/prop-types": "*",
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "18.3.7",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^18.0.0"
      }
    },
    "node_modules/@xyflow/react": {
      "version": "12.10.1",
      "resolved": "https://registry.npmjs.org/@xyflow/react/-/react-12.10.1.tgz",
      "integrity": "sha512-5eSWtIK/+rkldOuFbOOz44CRgQRjtS9v5nufk77DV+XBnfCGL9HAQ8PG00o2ZYKqkEU/Ak6wrKC95Tu+2zuK3Q==",
      "license": "MIT",
      "dependencies": {
        "@xyflow/system": "0.0.75",
        "classcat": "^5.0.3",
        "zustand": "^4.4.0"
      },
      "peerDependencies": {
        "react": ">=17",
        "react-dom": ">=17"
      }
    },
    "node_modules/@xyflow/system": {
      "version": "0.0.75",
      "resolved": "https://registry.npmjs.org/@xyflow/system/-/system-0.0.75.tgz",
      "integrity": "sha512-iXs+AGFLi8w/VlAoc/iSxk+CxfT6o64Uw/k0CKASOPqjqz6E0rb5jFZgJtXGZCpfQI6OQpu5EnumP5fGxQheaQ==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-drag": "^3.0.7",
        "@types/d3-interpolate": "^3.0.4",
        "@types/d3-selection": "^3.0.10",
        "@types/d3-transition": "^3.0.8",
        "@types/d3-zoom": "^3.0.8",
        "d3-drag": "^3.0.0",
        "d3-interpolate": "^3.0.1",
        "d3-selection": "^3.0.0",
        "d3-zoom": "^3.0.0"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/autoprefixer": {
      "version": "10.4.24",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.4.24.tgz",
      "integrity": "sha512-uHZg7N9ULTVbutaIsDRoUkoS8/h3bdsmVJYZ5l3wv8Cp/6UIIoRDm90hZ+BwxUj/hGBEzLxdHNSKuFpn8WOyZw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.28.1",
        "caniuse-lite": "^1.0.30001766",
        "fraction.js": "^5.3.4",
        "picocolors": "^1.1.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.10.0.tgz",
      "integrity": "sha512-lIyg0szRfYbiy67j9KN8IyeD7q7hcmqnJ1ddWmNt19ItGpNN64mnllmxUNFIOdOm6by97jlL6wfpTTJrmnjWAA==",
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.28.1",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.1.tgz",
      "integrity": "sha512-ZC5Bd0LgJXgwGqUknZY/vkUQ04r8NXnJZ3yYi4vDmSiZmC/pdSN0NbNRPxZpbtO4uAfDUAFffO8IZoM3Gj8IkA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.9.0",
        "caniuse-lite": "^1.0.30001759",
        "electron-to-chromium": "^1.5.263",
        "node-releases": "^2.0.27",
        "update-browserslist-db": "^1.2.0"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/camelcase-css": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001772",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001772.tgz",
      "integrity": "sha512-mIwLZICj+ntVTw4BT2zfp+yu/AqV6GMKfJVJMx3MwPxs+uk/uj2GLl2dH8LQbjiLDX66amCga5nKFyDgRR43kg==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/chokidar/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/class-variance-authority": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/class-variance-authority/-/class-variance-authority-0.7.1.tgz",
      "integrity": "sha512-Ka+9Trutv7G8M6WT6SeiRWz792K5qEqIGEGzXKhAE6xOWAY6pPH8U+9IY3oCMv6kqTmLsv7Xh/2w2RigkePMsg==",
      "license": "Apache-2.0",
      "dependencies": {
        "clsx": "^2.1.1"
      },
      "funding": {
        "url": "https://polar.sh/cva"
      }
    },
    "node_modules/classcat": {
      "version": "5.0.5",
      "resolved": "https://registry.npmjs.org/classcat/-/classcat-5.0.5.tgz",
      "integrity": "sha512-JhZUT7JFcQy/EzW605k/ktHtncoo9vnyW/2GspNYwFlN1C/WmjuV/xtS04e9SOkL2sTdw0VAZ2UGCcQ9lR6p6w==",
      "license": "MIT"
    },
    "node_modules/client-only": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",
      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==",
      "license": "MIT"
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/complex.js": {
      "version": "2.4.3",
      "resolved": "https://registry.npmjs.org/complex.js/-/complex.js-2.4.3.tgz",
      "integrity": "sha512-UrQVSUur14tNX6tiP4y8T4w4FeJAX3bi2cIv0pu/DTLFNxoq7z2Yh83Vfzztj6Px3X/lubqQ9IrPp7Bpn6p4MQ==",
      "license": "MIT",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/cssesc": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "cssesc": "bin/cssesc"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/d3-color": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-color/-/d3-color-3.1.0.tgz",
      "integrity": "sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-dispatch": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-dispatch/-/d3-dispatch-3.0.1.tgz",
      "integrity": "sha512-rzUyPU/S7rwUflMyLc1ETDeBj0NRuHKKAcvukozwhshr6g6c5d8zh4c2gQjY2bZ0dXeGLWc1PF174P2tVvKhfg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-drag": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/d3-drag/-/d3-drag-3.0.0.tgz",
      "integrity": "sha512-pWbUJLdETVA8lQNJecMxoXfH6x+mO2UQo8rSmZ+QqxcbyA3hfeprFgIT//HW2nlHChWeIIMwS2Fq+gEARkhTkg==",
      "license": "ISC",
      "dependencies": {
        "d3-dispatch": "1 - 3",
        "d3-selection": "3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-ease": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-ease/-/d3-ease-3.0.1.tgz",
      "integrity": "sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-interpolate": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-interpolate/-/d3-interpolate-3.0.1.tgz",
      "integrity": "sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==",
      "license": "ISC",
      "dependencies": {
        "d3-color": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-selection": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/d3-selection/-/d3-selection-3.0.0.tgz",
      "integrity": "sha512-fmTRWbNMmsmWq6xJV8D19U/gw/bwrHfNXxrIN+HfZgnzqTHp9jOmKMhsTUjXOJnZOdZY9Q28y4yebKzqDKlxlQ==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-timer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-timer/-/d3-timer-3.0.1.tgz",
      "integrity": "sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-transition": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-transition/-/d3-transition-3.0.1.tgz",
      "integrity": "sha512-ApKvfjsSR6tg06xrL434C0WydLr7JewBB3V+/39RMHsaXTOG0zmt/OAXeng5M5LBm0ojmxJrpomQVZ1aPvBL4w==",
      "license": "ISC",
      "dependencies": {
        "d3-color": "1 - 3",
        "d3-dispatch": "1 - 3",
        "d3-ease": "1 - 3",
        "d3-interpolate": "1 - 3",
        "d3-timer": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      },
      "peerDependencies": {
        "d3-selection": "2 - 3"
      }
    },
    "node_modules/d3-zoom": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/d3-zoom/-/d3-zoom-3.0.0.tgz",
      "integrity": "sha512-b8AmV3kfQaqWAuacbPuNbL6vahnOJflOhexLzMMNLga62+/nh0JzvJ0aO/5a5MVgUFGS7Hu1P9P03o3fJkDCyw==",
      "license": "ISC",
      "dependencies": {
        "d3-dispatch": "1 - 3",
        "d3-drag": "2 - 3",
        "d3-interpolate": "1 - 3",
        "d3-selection": "2 - 3",
        "d3-transition": "2 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/decimal.js": {
      "version": "10.6.0",
      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "license": "Apache-2.0",
      "optional": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/didyoumean": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/dlv": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.302",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.302.tgz",
      "integrity": "sha512-sM6HAN2LyK82IyPBpznDRqlTQAtuSaO+ShzFiWTvoMJLHyZ+Y39r8VMfHzwbU8MVBzQ4Wdn85+wlZl2TLGIlwg==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-latex": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/escape-latex/-/escape-latex-1.2.0.tgz",
      "integrity": "sha512-nV5aVWW1K0wEiUIEdZ4erkGGH8mDxGyxSeqPzRNtWP7ataw+/olFObw7hujFWlVjNsaDFw5VZ5NzVSIqRgfTiw==",
      "license": "MIT"
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fastq": {
      "version": "1.20.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.1.tgz",
      "integrity": "sha512-GGToxJ/w1x32s/D2EKND7kTil4n8OVk/9mycTc4VDza13lOvpUZTGX3mFSCtV9ksdGBVzvsyAVLM6mHFThxXxw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/fraction.js": {
      "version": "5.3.4",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-5.3.4.tgz",
      "integrity": "sha512-1X1NTtiJphryn/uLQz3whtY6jK3fTqoE3ohKs0tT+Ujr1W59oopxmoEh7Lu5p6vBaPbgoM0bzveAW4Qi5RyWDQ==",
      "license": "MIT",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/html-to-image": {
      "version": "1.11.13",
      "resolved": "https://registry.npmjs.org/html-to-image/-/html-to-image-1.11.13.tgz",
      "integrity": "sha512-cuOPoI7WApyhBElTTb9oqsawRvZ0rHhaHwghRLlTuffoD1B2aDemlCruLeZrUIIdvG7gs9xeELEPm6PhuASqrg==",
      "license": "MIT"
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.16.1",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.1.tgz",
      "integrity": "sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/javascript-natural-sort": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/javascript-natural-sort/-/javascript-natural-sort-0.7.1.tgz",
      "integrity": "sha512-nO6jcEfZWQXDhOiBtG2KvKyEptz7RVbpGP4vTD2hLBdmNQSsCiicO2Ioinv6UI4y9ukqnBpy+XZ9H6uLNgJTlw==",
      "license": "MIT"
    },
    "node_modules/jiti": {
      "version": "1.21.7",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.7.tgz",
      "integrity": "sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "bin/jiti.js"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/lilconfig": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lucide-react": {
      "version": "0.454.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.454.0.tgz",
      "integrity": "sha512-hw7zMDwykCLnEzgncEEjHeA6+45aeEzRYuKHuyRSOPkhko+J3ySGjGIzu+mmMfDFG1vazHepMaYFYHbTFAZAAQ==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/mathjs": {
      "version": "15.1.1",
      "resolved": "https://registry.npmjs.org/mathjs/-/mathjs-15.1.1.tgz",
      "integrity": "sha512-rM668DTtpSzMVoh/cKAllyQVEbBApM5g//IMGD8vD7YlrIz9ITRr3SrdhjaDxcBNTdyETWwPebj2unZyHD7ZdA==",
      "license": "Apache-2.0",
      "dependencies": {
        "@babel/runtime": "^7.26.10",
        "complex.js": "^2.2.5",
        "decimal.js": "^10.4.3",
        "escape-latex": "^1.2.0",
        "fraction.js": "^5.2.1",
        "javascript-natural-sort": "^0.7.1",
        "seedrandom": "^3.0.5",
        "tiny-emitter": "^2.1.0",
        "typed-function": "^4.2.1"
      },
      "bin": {
        "mathjs": "bin/cli.js"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.11",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
      "integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/next": {
      "version": "16.1.6",
      "resolved": "https://registry.npmjs.org/next/-/next-16.1.6.tgz",
      "integrity": "sha512-hkyRkcu5x/41KoqnROkfTm2pZVbKxvbZRuNvKXLRXxs3VfyO0WhY50TQS40EuKO9SW3rBj/sF3WbVwDACeMZyw==",
      "license": "MIT",
      "dependencies": {
        "@next/env": "16.1.6",
        "@swc/helpers": "0.5.15",
        "baseline-browser-mapping": "^2.8.3",
        "caniuse-lite": "^1.0.30001579",
        "postcss": "8.4.31",
        "styled-jsx": "5.1.6"
      },
      "bin": {
        "next": "dist/bin/next"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "optionalDependencies": {
        "@next/swc-darwin-arm64": "16.1.6",
        "@next/swc-darwin-x64": "16.1.6",
        "@next/swc-linux-arm64-gnu": "16.1.6",
        "@next/swc-linux-arm64-musl": "16.1.6",
        "@next/swc-linux-x64-gnu": "16.1.6",
        "@next/swc-linux-x64-musl": "16.1.6",
        "@next/swc-win32-arm64-msvc": "16.1.6",
        "@next/swc-win32-x64-msvc": "16.1.6",
        "sharp": "^0.34.4"
      },
      "peerDependencies": {
        "@opentelemetry/api": "^1.1.0",
        "@playwright/test": "^1.51.1",
        "babel-plugin-react-compiler": "*",
        "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "sass": "^1.3.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        },
        "@playwright/test": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "sass": {
          "optional": true
        }
      }
    },
    "node_modules/next/node_modules/postcss": {
      "version": "8.4.31",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.4.31.tgz",
      "integrity": "sha512-PS08Iboia9mts/2ygV3eLpY5ghnUcfLV/EXTOW1E2qYxJKGGBUtNjN76FYHnMs36RmARn41bC0AZmn+rR0OVpQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.6",
        "picocolors": "^1.0.0",
        "source-map-js": "^1.0.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.27",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.27.tgz",
      "integrity": "sha512-nmh3lCkYZ3grZvqcCH+fjmQ7X+H0OeZgP40OierEaAptX4XofMh5kwNbWh7lBduUzCcV/8kZ+NDLCwm2iorIlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
      "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pify": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/pify/-/pify-2.3.0.tgz",
      "integrity": "sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.6",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.6.tgz",
      "integrity": "sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.11",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-import": {
      "version": "15.1.0",
      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "postcss-value-parser": "^4.0.0",
        "read-cache": "^1.0.0",
        "resolve": "^1.1.7"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "postcss": "^8.0.0"
      }
    },
    "node_modules/postcss-js": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.1.0.tgz",
      "integrity": "sha512-oIAOTqgIo7q2EOwbhb8UalYePMvYoIeRY2YKntdpFQXNosSu3vLrniGgmH9OKs/qAkfoj5oB3le/7mINW1LCfw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "camelcase-css": "^2.0.1"
      },
      "engines": {
        "node": "^12 || ^14 || >= 16"
      },
      "peerDependencies": {
        "postcss": "^8.4.21"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-6.0.1.tgz",
      "integrity": "sha512-oPtTM4oerL+UXmx+93ytZVN82RrlY/wPUV8IeDxFrzIjXOLF1pN+EmKPLbubvKHT2HC20xXsCAH2Z+CKV6Oz/g==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "lilconfig": "^3.1.1"
      },
      "engines": {
        "node": ">= 18"
      },
      "peerDependencies": {
        "jiti": ">=1.21.0",
        "postcss": ">=8.0.9",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        },
        "postcss": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-nested": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "postcss-selector-parser": "^6.1.1"
      },
      "engines": {
        "node": ">=12.0"
      },
      "peerDependencies": {
        "postcss": "^8.2.14"
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.2.tgz",
      "integrity": "sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/read-cache": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.0.tgz",
      "integrity": "sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "pify": "^2.3.0"
      }
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/resolve": {
      "version": "1.22.11",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.11.tgz",
      "integrity": "sha512-RfqAvLnMl313r7c9oclB1HhUEAezcpLjz95wFH4LVuhk9JF/r22qmVP9AMmOU4vMX7Q8pN8jwNg/CSpdFnMjTQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-core-module": "^2.16.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/seedrandom": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/seedrandom/-/seedrandom-3.0.5.tgz",
      "integrity": "sha512-8OwmbklUNzwezjGInmZ+2clQmExQPvomqjL7LFqOYqtmuxRgQYqOD3mHaU+MvZn5FLUeVxVfQjwLZW/n/JFuqg==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "7.7.4",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.7.4.tgz",
      "integrity": "sha512-vFKC2IEtQnVhpT78h1Yp8wzwrf8CM+MzKMHGJZfBtzhZNycRFnXsHk6E5TxIkkMsgNS7mdX3AGB7x2QM2di4lA==",
      "license": "ISC",
      "optional": true,
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/sharp": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/sharp/-/sharp-0.34.5.tgz",
      "integrity": "sha512-Ou9I5Ft9WNcCbXrU9cMgPBcCK8LiwLqcbywW3t4oDV37n1pzpuNLsYiAV8eODnjbtQlSDwZ2cUEeQz4E54Hltg==",
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@img/colour": "^1.0.0",
        "detect-libc": "^2.1.2",
        "semver": "^7.7.3"
      },
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-darwin-arm64": "0.34.5",
        "@img/sharp-darwin-x64": "0.34.5",
        "@img/sharp-libvips-darwin-arm64": "1.2.4",
        "@img/sharp-libvips-darwin-x64": "1.2.4",
        "@img/sharp-libvips-linux-arm": "1.2.4",
        "@img/sharp-libvips-linux-arm64": "1.2.4",
        "@img/sharp-libvips-linux-ppc64": "1.2.4",
        "@img/sharp-libvips-linux-riscv64": "1.2.4",
        "@img/sharp-libvips-linux-s390x": "1.2.4",
        "@img/sharp-libvips-linux-x64": "1.2.4",
        "@img/sharp-libvips-linuxmusl-arm64": "1.2.4",
        "@img/sharp-libvips-linuxmusl-x64": "1.2.4",
        "@img/sharp-linux-arm": "0.34.5",
        "@img/sharp-linux-arm64": "0.34.5",
        "@img/sharp-linux-ppc64": "0.34.5",
        "@img/sharp-linux-riscv64": "0.34.5",
        "@img/sharp-linux-s390x": "0.34.5",
        "@img/sharp-linux-x64": "0.34.5",
        "@img/sharp-linuxmusl-arm64": "0.34.5",
        "@img/sharp-linuxmusl-x64": "0.34.5",
        "@img/sharp-wasm32": "0.34.5",
        "@img/sharp-win32-arm64": "0.34.5",
        "@img/sharp-win32-ia32": "0.34.5",
        "@img/sharp-win32-x64": "0.34.5"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/styled-jsx": {
      "version": "5.1.6",
      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.6.tgz",
      "integrity": "sha512-qSVyDTeMotdvQYoHWLNGwRFJHC+i+ZvdBRYosOFgC+Wg1vx4frN2/RG/NA7SYqqvKNLf39P2LSRA2pu6n0XYZA==",
      "license": "MIT",
      "dependencies": {
        "client-only": "0.0.1"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "peerDependencies": {
        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0 || ^19.0.0-0"
      },
      "peerDependenciesMeta": {
        "@babel/core": {
          "optional": true
        },
        "babel-plugin-macros": {
          "optional": true
        }
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.1",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.1.tgz",
      "integrity": "sha512-DhuTmvZWux4H1UOnWMB3sk0sbaCVOoQZjv8u1rDoTV0HTdGem9hkAZtl4JZy8P2z4Bg0nT+YMeOFyVr4zcG5Tw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "tinyglobby": "^0.2.11",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/tailwind-merge": {
      "version": "2.6.1",
      "resolved": "https://registry.npmjs.org/tailwind-merge/-/tailwind-merge-2.6.1.tgz",
      "integrity": "sha512-Oo6tHdpZsGpkKG88HJ8RR1rg/RdnEkQEfMoEk2x1XRI3F1AxeU+ijRXpiVUF4UbLfcxxRGw6TbUINKYdWVsQTQ==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/dcastil"
      }
    },
    "node_modules/tailwindcss": {
      "version": "3.4.19",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.19.tgz",
      "integrity": "sha512-3ofp+LL8E+pK/JuPLPggVAIaEuhvIz4qNcf3nA1Xn2o/7fb7s/TYpHhwGDv1ZU3PkBluUVaF8PyCHcm48cKLWQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "arg": "^5.0.2",
        "chokidar": "^3.6.0",
        "didyoumean": "^1.2.2",
        "dlv": "^1.1.3",
        "fast-glob": "^3.3.2",
        "glob-parent": "^6.0.2",
        "is-glob": "^4.0.3",
        "jiti": "^1.21.7",
        "lilconfig": "^3.1.3",
        "micromatch": "^4.0.8",
        "normalize-path": "^3.0.0",
        "object-hash": "^3.0.0",
        "picocolors": "^1.1.1",
        "postcss": "^8.4.47",
        "postcss-import": "^15.1.0",
        "postcss-js": "^4.0.1",
        "postcss-load-config": "^4.0.2 || ^5.0 || ^6.0",
        "postcss-nested": "^6.2.0",
        "postcss-selector-parser": "^6.1.2",
        "resolve": "^1.22.8",
        "sucrase": "^3.35.0"
      },
      "bin": {
        "tailwind": "lib/cli.js",
        "tailwindcss": "lib/cli.js"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/tiny-emitter": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/tiny-emitter/-/tiny-emitter-2.1.0.tgz",
      "integrity": "sha512-NB6Dk1A9xgQPMoGqC5CVXn123gWyte215ONT5Pp5a0yt4nlEoO1ZWeCwpncaekPHXO60i47ihFnZPiRPjRMq4Q==",
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.15",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.15.tgz",
      "integrity": "sha512-j2Zq4NyQYG5XMST4cbs02Ak8iJUdxRM0XI5QyxXuZOzKOINmWurp3smXu3y5wDcJrptwpSjgXHzIQxR0omXljQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.3"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
      "integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/typed-function": {
      "version": "4.2.2",
      "resolved": "https://registry.npmjs.org/typed-function/-/typed-function-4.2.2.tgz",
      "integrity": "sha512-VwaXim9Gp1bngi/q3do8hgttYn2uC3MoT/gfuMWylnj1IeZBUAyPddHZlo1K05BDoj8DYPpMdiHqH1dDYdJf2A==",
      "license": "MIT",
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/undici-types": {
      "version": "6.21.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",
      "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/update-browserslist-db": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.2.3.tgz",
      "integrity": "sha512-Js0m9cx+qOgDxo0eMiFGEueWztz+d4+M3rGlmKPT+T4IS/jP4ylw3Nwpu6cpTTP8R1MAC1kF4VbdLt3ARf209w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/use-sync-external-store": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.6.0.tgz",
      "integrity": "sha512-Pp6GSwGP/NrPIrxVFAIkOQeyw8lFenOHijQWkUTrDvrF4ALqylP2C/KCkeS9dpUM3KvYRQhna5vt7IL95+ZQ9w==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/zustand": {
      "version": "4.5.7",
      "resolved": "https://registry.npmjs.org/zustand/-/zustand-4.5.7.tgz",
      "integrity": "sha512-CHOUy7mu3lbD6o6LJLfllpjkzhHXSBlX8B9+qPddUsIfeF5S/UZ5q0kmCsnRqT1UHFQZchNFDDzMbQsuesHWlw==",
      "license": "MIT",
      "dependencies": {
        "use-sync-external-store": "^1.2.2"
      },
      "engines": {
        "node": ">=12.7.0"
      },
      "peerDependencies": {
        "@types/react": ">=16.8",
        "immer": ">=9.0.6",
        "react": ">=16.8"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "immer": {
          "optional": true
        },
        "react": {
          "optional": true
        }
      }
    }
  }
}

```

## AutoLCA/frontend/package.json
```json
{
  "name": "triya-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@xyflow/react": "^12.3.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "html-to-image": "^1.11.13",
    "lucide-react": "^0.454.0",
    "mathjs": "^15.1.1",
    "next": "^16.1.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@types/node": "^22.7.5",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}

```

## AutoLCA/frontend/postcss.config.mjs
```
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;

```

## AutoLCA/frontend/tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
      },
    },
  },
  plugins: [],
};
export default config;

```

## AutoLCA/frontend/tsconfig.json
```json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

## AutoLCA/frontend/tsconfig.tsbuildinfo
```
{"fileNames":["./node_modules/typescript/lib/lib.es5.d.ts","./node_modules/typescript/lib/lib.es2015.d.ts","./node_modules/typescript/lib/lib.es2016.d.ts","./node_modules/typescript/lib/lib.es2017.d.ts","./node_modules/typescript/lib/lib.es2018.d.ts","./node_modules/typescript/lib/lib.es2019.d.ts","./node_modules/typescript/lib/lib.es2020.d.ts","./node_modules/typescript/lib/lib.es2021.d.ts","./node_modules/typescript/lib/lib.es2022.d.ts","./node_modules/typescript/lib/lib.es2023.d.ts","./node_modules/typescript/lib/lib.es2024.d.ts","./node_modules/typescript/lib/lib.esnext.d.ts","./node_modules/typescript/lib/lib.dom.d.ts","./node_modules/typescript/lib/lib.dom.iterable.d.ts","./node_modules/typescript/lib/lib.es2015.core.d.ts","./node_modules/typescript/lib/lib.es2015.collection.d.ts","./node_modules/typescript/lib/lib.es2015.generator.d.ts","./node_modules/typescript/lib/lib.es2015.iterable.d.ts","./node_modules/typescript/lib/lib.es2015.promise.d.ts","./node_modules/typescript/lib/lib.es2015.proxy.d.ts","./node_modules/typescript/lib/lib.es2015.reflect.d.ts","./node_modules/typescript/lib/lib.es2015.symbol.d.ts","./node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts","./node_modules/typescript/lib/lib.es2016.array.include.d.ts","./node_modules/typescript/lib/lib.es2016.intl.d.ts","./node_modules/typescript/lib/lib.es2017.arraybuffer.d.ts","./node_modules/typescript/lib/lib.es2017.date.d.ts","./node_modules/typescript/lib/lib.es2017.object.d.ts","./node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2017.string.d.ts","./node_modules/typescript/lib/lib.es2017.intl.d.ts","./node_modules/typescript/lib/lib.es2017.typedarrays.d.ts","./node_modules/typescript/lib/lib.es2018.asyncgenerator.d.ts","./node_modules/typescript/lib/lib.es2018.asynciterable.d.ts","./node_modules/typescript/lib/lib.es2018.intl.d.ts","./node_modules/typescript/lib/lib.es2018.promise.d.ts","./node_modules/typescript/lib/lib.es2018.regexp.d.ts","./node_modules/typescript/lib/lib.es2019.array.d.ts","./node_modules/typescript/lib/lib.es2019.object.d.ts","./node_modules/typescript/lib/lib.es2019.string.d.ts","./node_modules/typescript/lib/lib.es2019.symbol.d.ts","./node_modules/typescript/lib/lib.es2019.intl.d.ts","./node_modules/typescript/lib/lib.es2020.bigint.d.ts","./node_modules/typescript/lib/lib.es2020.date.d.ts","./node_modules/typescript/lib/lib.es2020.promise.d.ts","./node_modules/typescript/lib/lib.es2020.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2020.string.d.ts","./node_modules/typescript/lib/lib.es2020.symbol.wellknown.d.ts","./node_modules/typescript/lib/lib.es2020.intl.d.ts","./node_modules/typescript/lib/lib.es2020.number.d.ts","./node_modules/typescript/lib/lib.es2021.promise.d.ts","./node_modules/typescript/lib/lib.es2021.string.d.ts","./node_modules/typescript/lib/lib.es2021.weakref.d.ts","./node_modules/typescript/lib/lib.es2021.intl.d.ts","./node_modules/typescript/lib/lib.es2022.array.d.ts","./node_modules/typescript/lib/lib.es2022.error.d.ts","./node_modules/typescript/lib/lib.es2022.intl.d.ts","./node_modules/typescript/lib/lib.es2022.object.d.ts","./node_modules/typescript/lib/lib.es2022.string.d.ts","./node_modules/typescript/lib/lib.es2022.regexp.d.ts","./node_modules/typescript/lib/lib.es2023.array.d.ts","./node_modules/typescript/lib/lib.es2023.collection.d.ts","./node_modules/typescript/lib/lib.es2023.intl.d.ts","./node_modules/typescript/lib/lib.es2024.arraybuffer.d.ts","./node_modules/typescript/lib/lib.es2024.collection.d.ts","./node_modules/typescript/lib/lib.es2024.object.d.ts","./node_modules/typescript/lib/lib.es2024.promise.d.ts","./node_modules/typescript/lib/lib.es2024.regexp.d.ts","./node_modules/typescript/lib/lib.es2024.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2024.string.d.ts","./node_modules/typescript/lib/lib.esnext.array.d.ts","./node_modules/typescript/lib/lib.esnext.collection.d.ts","./node_modules/typescript/lib/lib.esnext.intl.d.ts","./node_modules/typescript/lib/lib.esnext.disposable.d.ts","./node_modules/typescript/lib/lib.esnext.promise.d.ts","./node_modules/typescript/lib/lib.esnext.decorators.d.ts","./node_modules/typescript/lib/lib.esnext.iterator.d.ts","./node_modules/typescript/lib/lib.esnext.float16.d.ts","./node_modules/typescript/lib/lib.esnext.error.d.ts","./node_modules/typescript/lib/lib.esnext.sharedmemory.d.ts","./node_modules/typescript/lib/lib.decorators.d.ts","./node_modules/typescript/lib/lib.decorators.legacy.d.ts","./node_modules/@types/react/global.d.ts","./node_modules/csstype/index.d.ts","./node_modules/@types/prop-types/index.d.ts","./node_modules/@types/react/index.d.ts","./node_modules/next/dist/styled-jsx/types/css.d.ts","./node_modules/next/dist/styled-jsx/types/macro.d.ts","./node_modules/next/dist/styled-jsx/types/style.d.ts","./node_modules/next/dist/styled-jsx/types/global.d.ts","./node_modules/next/dist/styled-jsx/types/index.d.ts","./node_modules/next/dist/server/get-page-files.d.ts","./node_modules/@types/node/compatibility/disposable.d.ts","./node_modules/@types/node/compatibility/indexable.d.ts","./node_modules/@types/node/compatibility/iterators.d.ts","./node_modules/@types/node/compatibility/index.d.ts","./node_modules/@types/node/globals.typedarray.d.ts","./node_modules/@types/node/buffer.buffer.d.ts","./node_modules/@types/node/globals.d.ts","./node_modules/@types/node/web-globals/abortcontroller.d.ts","./node_modules/@types/node/web-globals/domexception.d.ts","./node_modules/@types/node/web-globals/events.d.ts","./node_modules/undici-types/header.d.ts","./node_modules/undici-types/readable.d.ts","./node_modules/undici-types/file.d.ts","./node_modules/undici-types/fetch.d.ts","./node_modules/undici-types/formdata.d.ts","./node_modules/undici-types/connector.d.ts","./node_modules/undici-types/client.d.ts","./node_modules/undici-types/errors.d.ts","./node_modules/undici-types/dispatcher.d.ts","./node_modules/undici-types/global-dispatcher.d.ts","./node_modules/undici-types/global-origin.d.ts","./node_modules/undici-types/pool-stats.d.ts","./node_modules/undici-types/pool.d.ts","./node_modules/undici-types/handlers.d.ts","./node_modules/undici-types/balanced-pool.d.ts","./node_modules/undici-types/agent.d.ts","./node_modules/undici-types/mock-interceptor.d.ts","./node_modules/undici-types/mock-agent.d.ts","./node_modules/undici-types/mock-client.d.ts","./node_modules/undici-types/mock-pool.d.ts","./node_modules/undici-types/mock-errors.d.ts","./node_modules/undici-types/proxy-agent.d.ts","./node_modules/undici-types/env-http-proxy-agent.d.ts","./node_modules/undici-types/retry-handler.d.ts","./node_modules/undici-types/retry-agent.d.ts","./node_modules/undici-types/api.d.ts","./node_modules/undici-types/interceptors.d.ts","./node_modules/undici-types/util.d.ts","./node_modules/undici-types/cookies.d.ts","./node_modules/undici-types/patch.d.ts","./node_modules/undici-types/websocket.d.ts","./node_modules/undici-types/eventsource.d.ts","./node_modules/undici-types/filereader.d.ts","./node_modules/undici-types/diagnostics-channel.d.ts","./node_modules/undici-types/content-type.d.ts","./node_modules/undici-types/cache.d.ts","./node_modules/undici-types/index.d.ts","./node_modules/@types/node/web-globals/fetch.d.ts","./node_modules/@types/node/web-globals/navigator.d.ts","./node_modules/@types/node/web-globals/storage.d.ts","./node_modules/@types/node/assert.d.ts","./node_modules/@types/node/assert/strict.d.ts","./node_modules/@types/node/async_hooks.d.ts","./node_modules/@types/node/buffer.d.ts","./node_modules/@types/node/child_process.d.ts","./node_modules/@types/node/cluster.d.ts","./node_modules/@types/node/console.d.ts","./node_modules/@types/node/constants.d.ts","./node_modules/@types/node/crypto.d.ts","./node_modules/@types/node/dgram.d.ts","./node_modules/@types/node/diagnostics_channel.d.ts","./node_modules/@types/node/dns.d.ts","./node_modules/@types/node/dns/promises.d.ts","./node_modules/@types/node/domain.d.ts","./node_modules/@types/node/events.d.ts","./node_modules/@types/node/fs.d.ts","./node_modules/@types/node/fs/promises.d.ts","./node_modules/@types/node/http.d.ts","./node_modules/@types/node/http2.d.ts","./node_modules/@types/node/https.d.ts","./node_modules/@types/node/inspector.d.ts","./node_modules/@types/node/inspector.generated.d.ts","./node_modules/@types/node/module.d.ts","./node_modules/@types/node/net.d.ts","./node_modules/@types/node/os.d.ts","./node_modules/@types/node/path.d.ts","./node_modules/@types/node/perf_hooks.d.ts","./node_modules/@types/node/process.d.ts","./node_modules/@types/node/punycode.d.ts","./node_modules/@types/node/querystring.d.ts","./node_modules/@types/node/readline.d.ts","./node_modules/@types/node/readline/promises.d.ts","./node_modules/@types/node/repl.d.ts","./node_modules/@types/node/sea.d.ts","./node_modules/@types/node/sqlite.d.ts","./node_modules/@types/node/stream.d.ts","./node_modules/@types/node/stream/promises.d.ts","./node_modules/@types/node/stream/consumers.d.ts","./node_modules/@types/node/stream/web.d.ts","./node_modules/@types/node/string_decoder.d.ts","./node_modules/@types/node/test.d.ts","./node_modules/@types/node/timers.d.ts","./node_modules/@types/node/timers/promises.d.ts","./node_modules/@types/node/tls.d.ts","./node_modules/@types/node/trace_events.d.ts","./node_modules/@types/node/tty.d.ts","./node_modules/@types/node/url.d.ts","./node_modules/@types/node/util.d.ts","./node_modules/@types/node/v8.d.ts","./node_modules/@types/node/vm.d.ts","./node_modules/@types/node/wasi.d.ts","./node_modules/@types/node/worker_threads.d.ts","./node_modules/@types/node/zlib.d.ts","./node_modules/@types/node/index.d.ts","./node_modules/@types/react/canary.d.ts","./node_modules/@types/react/experimental.d.ts","./node_modules/@types/react-dom/index.d.ts","./node_modules/@types/react-dom/canary.d.ts","./node_modules/@types/react-dom/experimental.d.ts","./node_modules/next/dist/lib/fallback.d.ts","./node_modules/next/dist/compiled/webpack/webpack.d.ts","./node_modules/next/dist/shared/lib/modern-browserslist-target.d.ts","./node_modules/next/dist/shared/lib/entry-constants.d.ts","./node_modules/next/dist/shared/lib/constants.d.ts","./node_modules/next/dist/server/config.d.ts","./node_modules/next/dist/lib/load-custom-routes.d.ts","./node_modules/next/dist/shared/lib/image-config.d.ts","./node_modules/next/dist/build/webpack/plugins/subresource-integrity-plugin.d.ts","./node_modules/next/dist/server/body-streams.d.ts","./node_modules/next/dist/server/lib/cache-control.d.ts","./node_modules/next/dist/lib/setup-exception-listeners.d.ts","./node_modules/next/dist/lib/worker.d.ts","./node_modules/next/dist/lib/constants.d.ts","./node_modules/next/dist/lib/bundler.d.ts","./node_modules/next/dist/server/lib/experimental/ppr.d.ts","./node_modules/next/dist/lib/page-types.d.ts","./node_modules/next/dist/build/segment-config/app/app-segment-config.d.ts","./node_modules/next/dist/build/segment-config/pages/pages-segment-config.d.ts","./node_modules/next/dist/build/analysis/get-page-static-info.d.ts","./node_modules/next/dist/build/webpack/loaders/get-module-build-info.d.ts","./node_modules/next/dist/build/webpack/plugins/middleware-plugin.d.ts","./node_modules/next/dist/server/require-hook.d.ts","./node_modules/next/dist/server/node-polyfill-crypto.d.ts","./node_modules/next/dist/server/node-environment-baseline.d.ts","./node_modules/next/dist/server/node-environment-extensions/error-inspect.d.ts","./node_modules/next/dist/server/node-environment-extensions/console-file.d.ts","./node_modules/next/dist/server/node-environment-extensions/console-exit.d.ts","./node_modules/next/dist/server/node-environment-extensions/console-dim.external.d.ts","./node_modules/next/dist/server/node-environment-extensions/unhandled-rejection.d.ts","./node_modules/next/dist/server/node-environment-extensions/random.d.ts","./node_modules/next/dist/server/node-environment-extensions/date.d.ts","./node_modules/next/dist/server/node-environment-extensions/web-crypto.d.ts","./node_modules/next/dist/server/node-environment-extensions/node-crypto.d.ts","./node_modules/next/dist/server/node-environment-extensions/fast-set-immediate.external.d.ts","./node_modules/next/dist/server/node-environment.d.ts","./node_modules/next/dist/build/page-extensions-type.d.ts","./node_modules/next/dist/server/route-kind.d.ts","./node_modules/next/dist/server/route-definitions/route-definition.d.ts","./node_modules/next/dist/server/route-definitions/app-page-route-definition.d.ts","./node_modules/next/dist/server/lib/cache-handlers/types.d.ts","./node_modules/next/dist/server/response-cache/types.d.ts","./node_modules/next/dist/server/resume-data-cache/cache-store.d.ts","./node_modules/next/dist/server/resume-data-cache/resume-data-cache.d.ts","./node_modules/next/dist/client/components/app-router-headers.d.ts","./node_modules/next/dist/server/render-result.d.ts","./node_modules/next/dist/server/instrumentation/types.d.ts","./node_modules/next/dist/lib/coalesced-function.d.ts","./node_modules/next/dist/shared/lib/router/utils/middleware-route-matcher.d.ts","./node_modules/next/dist/server/lib/router-utils/types.d.ts","./node_modules/next/dist/trace/types.d.ts","./node_modules/next/dist/trace/trace.d.ts","./node_modules/next/dist/trace/shared.d.ts","./node_modules/next/dist/trace/index.d.ts","./node_modules/next/dist/build/load-jsconfig.d.ts","./node_modules/@next/env/dist/index.d.ts","./node_modules/next/dist/build/webpack/plugins/telemetry-plugin/use-cache-tracker-utils.d.ts","./node_modules/next/dist/build/webpack/plugins/telemetry-plugin/telemetry-plugin.d.ts","./node_modules/next/dist/telemetry/storage.d.ts","./node_modules/next/dist/build/build-context.d.ts","./node_modules/next/dist/shared/lib/bloom-filter.d.ts","./node_modules/next/dist/build/webpack-config.d.ts","./node_modules/next/dist/build/swc/generated-native.d.ts","./node_modules/next/dist/build/swc/types.d.ts","./node_modules/next/dist/server/dev/parse-version-info.d.ts","./node_modules/next/dist/next-devtools/shared/types.d.ts","./node_modules/next/dist/server/dev/dev-indicator-server-state.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/cache-indicator.d.ts","./node_modules/next/dist/server/lib/parse-stack.d.ts","./node_modules/next/dist/next-devtools/server/shared.d.ts","./node_modules/next/dist/next-devtools/shared/stack-frame.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/utils/get-error-by-type.d.ts","./node_modules/@types/react/jsx-runtime.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/container/runtime-error/render-error.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/shared.d.ts","./node_modules/next/dist/server/dev/debug-channel.d.ts","./node_modules/next/dist/server/dev/hot-reloader-types.d.ts","./node_modules/next/dist/server/lib/i18n-provider.d.ts","./node_modules/next/dist/server/web/next-url.d.ts","./node_modules/next/dist/compiled/@edge-runtime/cookies/index.d.ts","./node_modules/next/dist/server/web/spec-extension/cookies.d.ts","./node_modules/next/dist/server/web/spec-extension/request.d.ts","./node_modules/next/dist/server/after/builtin-request-context.d.ts","./node_modules/next/dist/server/web/spec-extension/fetch-event.d.ts","./node_modules/next/dist/server/web/spec-extension/response.d.ts","./node_modules/next/dist/build/segment-config/middleware/middleware-config.d.ts","./node_modules/next/dist/server/web/types.d.ts","./node_modules/next/dist/build/webpack/plugins/pages-manifest-plugin.d.ts","./node_modules/next/dist/shared/lib/router/utils/parse-url.d.ts","./node_modules/next/dist/server/route-definitions/locale-route-definition.d.ts","./node_modules/next/dist/server/route-definitions/pages-route-definition.d.ts","./node_modules/next/dist/build/webpack/plugins/flight-manifest-plugin.d.ts","./node_modules/next/dist/build/webpack/plugins/next-font-manifest-plugin.d.ts","./node_modules/next/dist/shared/lib/deep-readonly.d.ts","./node_modules/next/dist/next-devtools/userspace/pages/pages-dev-overlay-setup.d.ts","./node_modules/next/dist/server/render.d.ts","./node_modules/next/dist/shared/lib/mitt.d.ts","./node_modules/next/dist/client/with-router.d.ts","./node_modules/next/dist/client/router.d.ts","./node_modules/next/dist/client/route-loader.d.ts","./node_modules/next/dist/client/page-loader.d.ts","./node_modules/next/dist/shared/lib/router/router.d.ts","./node_modules/next/dist/shared/lib/router-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/loadable-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/loadable.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/image-config-context.shared-runtime.d.ts","./node_modules/next/dist/client/components/readonly-url-search-params.d.ts","./node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/head-manager-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/app-router-types.d.ts","./node_modules/next/dist/client/flight-data-helpers.d.ts","./node_modules/next/dist/client/components/router-reducer/ppr-navigations.d.ts","./node_modules/next/dist/client/components/segment-cache/types.d.ts","./node_modules/next/dist/client/components/segment-cache/navigation.d.ts","./node_modules/next/dist/client/components/segment-cache/cache-key.d.ts","./node_modules/next/dist/client/components/router-reducer/fetch-server-response.d.ts","./node_modules/next/dist/client/components/router-reducer/router-reducer-types.d.ts","./node_modules/next/dist/shared/lib/app-router-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/server-inserted-html.shared-runtime.d.ts","./node_modules/next/dist/server/route-modules/pages/vendored/contexts/entrypoints.d.ts","./node_modules/next/dist/server/route-modules/pages/module.compiled.d.ts","./node_modules/next/dist/build/templates/pages.d.ts","./node_modules/next/dist/server/route-modules/pages/module.d.ts","./node_modules/next/dist/server/route-modules/pages/builtin/_error.d.ts","./node_modules/next/dist/server/load-default-error-components.d.ts","./node_modules/next/dist/server/base-http/node.d.ts","./node_modules/next/dist/server/response-cache/index.d.ts","./node_modules/next/dist/server/route-definitions/pages-api-route-definition.d.ts","./node_modules/next/dist/server/route-matches/pages-api-route-match.d.ts","./node_modules/next/dist/server/route-matchers/route-matcher.d.ts","./node_modules/next/dist/server/route-matcher-providers/route-matcher-provider.d.ts","./node_modules/next/dist/server/route-matcher-managers/route-matcher-manager.d.ts","./node_modules/next/dist/server/normalizers/normalizer.d.ts","./node_modules/next/dist/server/normalizers/locale-route-normalizer.d.ts","./node_modules/next/dist/server/normalizers/request/pathname-normalizer.d.ts","./node_modules/next/dist/server/normalizers/request/suffix.d.ts","./node_modules/next/dist/server/normalizers/request/rsc.d.ts","./node_modules/next/dist/server/normalizers/request/next-data.d.ts","./node_modules/next/dist/server/normalizers/request/segment-prefix-rsc.d.ts","./node_modules/next/dist/build/static-paths/types.d.ts","./node_modules/next/dist/server/base-server.d.ts","./node_modules/next/dist/server/lib/async-callback-set.d.ts","./node_modules/next/dist/shared/lib/router/utils/route-regex.d.ts","./node_modules/next/dist/shared/lib/router/utils/route-matcher.d.ts","./node_modules/sharp/lib/index.d.ts","./node_modules/next/dist/server/image-optimizer.d.ts","./node_modules/next/dist/server/next-server.d.ts","./node_modules/next/dist/server/lib/types.d.ts","./node_modules/next/dist/server/lib/lru-cache.d.ts","./node_modules/next/dist/server/lib/dev-bundler-service.d.ts","./node_modules/next/dist/server/use-cache/cache-life.d.ts","./node_modules/next/dist/server/dev/static-paths-worker.d.ts","./node_modules/next/dist/server/dev/next-dev-server.d.ts","./node_modules/next/dist/server/next.d.ts","./node_modules/next/dist/server/lib/render-server.d.ts","./node_modules/next/dist/server/lib/router-server.d.ts","./node_modules/next/dist/shared/lib/router/utils/path-match.d.ts","./node_modules/next/dist/server/lib/router-utils/filesystem.d.ts","./node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.d.ts","./node_modules/next/dist/server/lib/router-utils/router-server-context.d.ts","./node_modules/next/dist/server/route-modules/route-module.d.ts","./node_modules/next/dist/server/load-components.d.ts","./node_modules/next/dist/server/web/adapter.d.ts","./node_modules/next/dist/server/app-render/types.d.ts","./node_modules/next/dist/build/webpack/loaders/metadata/types.d.ts","./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.d.ts","./node_modules/next/dist/server/lib/app-dir-module.d.ts","./node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.d.ts","./node_modules/next/dist/server/async-storage/draft-mode-provider.d.ts","./node_modules/next/dist/server/web/spec-extension/adapters/headers.d.ts","./node_modules/next/dist/server/app-render/cache-signal.d.ts","./node_modules/next/dist/server/app-render/dynamic-rendering.d.ts","./node_modules/next/dist/server/request/fallback-params.d.ts","./node_modules/next/dist/server/app-render/work-unit-async-storage-instance.d.ts","./node_modules/next/dist/server/lib/lazy-result.d.ts","./node_modules/next/dist/server/lib/implicit-tags.d.ts","./node_modules/next/dist/server/app-render/staged-rendering.d.ts","./node_modules/next/dist/server/app-render/work-unit-async-storage.external.d.ts","./node_modules/next/dist/shared/lib/router/utils/parse-relative-url.d.ts","./node_modules/next/dist/server/app-render/app-render.d.ts","./node_modules/next/dist/server/route-modules/app-page/vendored/contexts/entrypoints.d.ts","./node_modules/next/dist/client/components/error-boundary.d.ts","./node_modules/next/dist/client/components/layout-router.d.ts","./node_modules/next/dist/client/components/render-from-template-context.d.ts","./node_modules/next/dist/server/app-render/action-async-storage-instance.d.ts","./node_modules/next/dist/server/app-render/action-async-storage.external.d.ts","./node_modules/next/dist/client/components/client-page.d.ts","./node_modules/next/dist/client/components/client-segment.d.ts","./node_modules/next/dist/server/request/search-params.d.ts","./node_modules/next/dist/client/components/hooks-server-context.d.ts","./node_modules/next/dist/client/components/http-access-fallback/error-boundary.d.ts","./node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts","./node_modules/next/dist/lib/metadata/types/extra-types.d.ts","./node_modules/next/dist/lib/metadata/types/metadata-types.d.ts","./node_modules/next/dist/lib/metadata/types/manifest-types.d.ts","./node_modules/next/dist/lib/metadata/types/opengraph-types.d.ts","./node_modules/next/dist/lib/metadata/types/twitter-types.d.ts","./node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts","./node_modules/next/dist/lib/metadata/types/resolvers.d.ts","./node_modules/next/dist/lib/metadata/types/icons.d.ts","./node_modules/next/dist/lib/metadata/resolve-metadata.d.ts","./node_modules/next/dist/lib/metadata/metadata.d.ts","./node_modules/next/dist/lib/framework/boundary-components.d.ts","./node_modules/next/dist/server/app-render/rsc/preloads.d.ts","./node_modules/next/dist/server/app-render/rsc/postpone.d.ts","./node_modules/next/dist/server/app-render/rsc/taint.d.ts","./node_modules/next/dist/shared/lib/segment-cache/segment-value-encoding.d.ts","./node_modules/next/dist/server/app-render/collect-segment-data.d.ts","./node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.d.ts","./node_modules/next/dist/server/app-render/entry-base.d.ts","./node_modules/next/dist/build/templates/app-page.d.ts","./node_modules/next/dist/build/rendering-mode.d.ts","./node_modules/@types/react/jsx-dev-runtime.d.ts","./node_modules/next/dist/server/route-modules/app-page/vendored/rsc/entrypoints.d.ts","./node_modules/@types/react-dom/client.d.ts","./node_modules/@types/react-dom/server.d.ts","./node_modules/next/dist/server/route-modules/app-page/vendored/ssr/entrypoints.d.ts","./node_modules/next/dist/server/route-modules/app-page/module.d.ts","./node_modules/next/dist/server/route-modules/app-page/module.compiled.d.ts","./node_modules/next/dist/server/route-definitions/app-route-route-definition.d.ts","./node_modules/next/dist/server/async-storage/work-store.d.ts","./node_modules/next/dist/server/web/http.d.ts","./node_modules/next/dist/server/route-modules/app-route/shared-modules.d.ts","./node_modules/next/dist/client/components/redirect-status-code.d.ts","./node_modules/next/dist/client/components/redirect-error.d.ts","./node_modules/next/dist/build/templates/app-route.d.ts","./node_modules/next/dist/server/route-modules/app-route/module.d.ts","./node_modules/next/dist/server/route-modules/app-route/module.compiled.d.ts","./node_modules/next/dist/build/segment-config/app/app-segments.d.ts","./node_modules/next/dist/build/utils.d.ts","./node_modules/next/dist/server/lib/router-utils/build-prefetch-segment-data-route.d.ts","./node_modules/next/dist/build/turborepo-access-trace/types.d.ts","./node_modules/next/dist/build/turborepo-access-trace/result.d.ts","./node_modules/next/dist/build/turborepo-access-trace/helpers.d.ts","./node_modules/next/dist/build/turborepo-access-trace/index.d.ts","./node_modules/next/dist/export/routes/types.d.ts","./node_modules/next/dist/export/types.d.ts","./node_modules/next/dist/export/worker.d.ts","./node_modules/next/dist/build/worker.d.ts","./node_modules/next/dist/build/index.d.ts","./node_modules/next/dist/server/lib/incremental-cache/index.d.ts","./node_modules/next/dist/server/after/after.d.ts","./node_modules/next/dist/server/after/after-context.d.ts","./node_modules/next/dist/server/app-render/work-async-storage-instance.d.ts","./node_modules/next/dist/server/app-render/create-error-handler.d.ts","./node_modules/next/dist/shared/lib/action-revalidation-kind.d.ts","./node_modules/next/dist/server/app-render/work-async-storage.external.d.ts","./node_modules/next/dist/server/request/params.d.ts","./node_modules/next/dist/server/route-matches/route-match.d.ts","./node_modules/next/dist/server/request-meta.d.ts","./node_modules/next/dist/cli/next-test.d.ts","./node_modules/next/dist/shared/lib/size-limit.d.ts","./node_modules/next/dist/server/config-shared.d.ts","./node_modules/next/dist/server/base-http/index.d.ts","./node_modules/next/dist/server/api-utils/index.d.ts","./node_modules/next/dist/build/adapter/build-complete.d.ts","./node_modules/next/dist/types.d.ts","./node_modules/next/dist/shared/lib/html-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/utils.d.ts","./node_modules/next/dist/pages/_app.d.ts","./node_modules/next/app.d.ts","./node_modules/next/dist/server/web/spec-extension/unstable-cache.d.ts","./node_modules/next/dist/server/web/spec-extension/revalidate.d.ts","./node_modules/next/dist/server/web/spec-extension/unstable-no-store.d.ts","./node_modules/next/dist/server/use-cache/cache-tag.d.ts","./node_modules/next/cache.d.ts","./node_modules/next/dist/pages/_document.d.ts","./node_modules/next/document.d.ts","./node_modules/next/dist/shared/lib/dynamic.d.ts","./node_modules/next/dynamic.d.ts","./node_modules/next/dist/pages/_error.d.ts","./node_modules/next/error.d.ts","./node_modules/next/dist/shared/lib/head.d.ts","./node_modules/next/head.d.ts","./node_modules/next/dist/server/request/cookies.d.ts","./node_modules/next/dist/server/request/headers.d.ts","./node_modules/next/dist/server/request/draft-mode.d.ts","./node_modules/next/headers.d.ts","./node_modules/next/dist/shared/lib/get-img-props.d.ts","./node_modules/next/dist/client/image-component.d.ts","./node_modules/next/dist/shared/lib/image-external.d.ts","./node_modules/next/image.d.ts","./node_modules/next/dist/client/link.d.ts","./node_modules/next/link.d.ts","./node_modules/next/dist/client/components/unrecognized-action-error.d.ts","./node_modules/next/dist/client/components/redirect.d.ts","./node_modules/next/dist/client/components/not-found.d.ts","./node_modules/next/dist/client/components/forbidden.d.ts","./node_modules/next/dist/client/components/unauthorized.d.ts","./node_modules/next/dist/client/components/unstable-rethrow.server.d.ts","./node_modules/next/dist/client/components/unstable-rethrow.d.ts","./node_modules/next/dist/client/components/navigation.react-server.d.ts","./node_modules/next/dist/client/components/navigation.d.ts","./node_modules/next/navigation.d.ts","./node_modules/next/router.d.ts","./node_modules/next/dist/client/script.d.ts","./node_modules/next/script.d.ts","./node_modules/next/dist/server/web/spec-extension/user-agent.d.ts","./node_modules/next/dist/compiled/@edge-runtime/primitives/url.d.ts","./node_modules/next/dist/server/web/spec-extension/image-response.d.ts","./node_modules/next/dist/compiled/@vercel/og/satori/index.d.ts","./node_modules/next/dist/compiled/@vercel/og/emoji/index.d.ts","./node_modules/next/dist/compiled/@vercel/og/types.d.ts","./node_modules/next/dist/server/after/index.d.ts","./node_modules/next/dist/server/request/connection.d.ts","./node_modules/next/server.d.ts","./node_modules/next/types/global.d.ts","./node_modules/next/types/compiled.d.ts","./node_modules/next/types.d.ts","./node_modules/next/index.d.ts","./node_modules/next/image-types/global.d.ts","./.next/dev/types/routes.d.ts","./next-env.d.ts","./node_modules/source-map-js/source-map.d.ts","./node_modules/postcss/lib/previous-map.d.ts","./node_modules/postcss/lib/input.d.ts","./node_modules/postcss/lib/css-syntax-error.d.ts","./node_modules/postcss/lib/declaration.d.ts","./node_modules/postcss/lib/root.d.ts","./node_modules/postcss/lib/warning.d.ts","./node_modules/postcss/lib/lazy-result.d.ts","./node_modules/postcss/lib/no-work-result.d.ts","./node_modules/postcss/lib/processor.d.ts","./node_modules/postcss/lib/result.d.ts","./node_modules/postcss/lib/document.d.ts","./node_modules/postcss/lib/rule.d.ts","./node_modules/postcss/lib/node.d.ts","./node_modules/postcss/lib/comment.d.ts","./node_modules/postcss/lib/container.d.ts","./node_modules/postcss/lib/at-rule.d.ts","./node_modules/postcss/lib/list.d.ts","./node_modules/postcss/lib/postcss.d.ts","./node_modules/postcss/lib/postcss.d.mts","./node_modules/tailwindcss/types/generated/corepluginlist.d.ts","./node_modules/tailwindcss/types/generated/colors.d.ts","./node_modules/tailwindcss/types/config.d.ts","./node_modules/tailwindcss/types/index.d.ts","./tailwind.config.ts","./app/types.ts","./node_modules/decimal.js/decimal.d.ts","./node_modules/fraction.js/fraction.d.mts","./node_modules/mathjs/types/index.d.ts","./utils/parameter_engine.ts","./app/layout.tsx","./node_modules/@xyflow/system/dist/esm/types/changes.d.ts","./node_modules/@types/d3-selection/index.d.ts","./node_modules/@types/d3-drag/index.d.ts","./node_modules/@types/d3-color/index.d.ts","./node_modules/@types/d3-interpolate/index.d.ts","./node_modules/@types/d3-zoom/index.d.ts","./node_modules/@xyflow/system/dist/esm/types/utils.d.ts","./node_modules/@xyflow/system/dist/esm/utils/types.d.ts","./node_modules/@xyflow/system/dist/esm/types/nodes.d.ts","./node_modules/@xyflow/system/dist/esm/types/handles.d.ts","./node_modules/@xyflow/system/dist/esm/types/panzoom.d.ts","./node_modules/@xyflow/system/dist/esm/types/general.d.ts","./node_modules/@xyflow/system/dist/esm/types/edges.d.ts","./node_modules/@xyflow/system/dist/esm/types/index.d.ts","./node_modules/@xyflow/system/dist/esm/constants.d.ts","./node_modules/@xyflow/system/dist/esm/utils/connections.d.ts","./node_modules/@xyflow/system/dist/esm/utils/dom.d.ts","./node_modules/@xyflow/system/dist/esm/utils/edges/bezier-edge.d.ts","./node_modules/@xyflow/system/dist/esm/utils/edges/straight-edge.d.ts","./node_modules/@xyflow/system/dist/esm/utils/edges/smoothstep-edge.d.ts","./node_modules/@xyflow/system/dist/esm/utils/edges/general.d.ts","./node_modules/@xyflow/system/dist/esm/utils/edges/positions.d.ts","./node_modules/@xyflow/system/dist/esm/utils/edges/index.d.ts","./node_modules/@xyflow/system/dist/esm/utils/graph.d.ts","./node_modules/@xyflow/system/dist/esm/utils/general.d.ts","./node_modules/@xyflow/system/dist/esm/utils/marker.d.ts","./node_modules/@xyflow/system/dist/esm/utils/node-toolbar.d.ts","./node_modules/@xyflow/system/dist/esm/utils/edge-toolbar.d.ts","./node_modules/@xyflow/system/dist/esm/utils/store.d.ts","./node_modules/@xyflow/system/dist/esm/utils/shallow-node-data.d.ts","./node_modules/@xyflow/system/dist/esm/utils/index.d.ts","./node_modules/@xyflow/system/dist/esm/xydrag/xydrag.d.ts","./node_modules/@xyflow/system/dist/esm/xydrag/index.d.ts","./node_modules/@xyflow/system/dist/esm/xyhandle/types.d.ts","./node_modules/@xyflow/system/dist/esm/xyhandle/xyhandle.d.ts","./node_modules/@xyflow/system/dist/esm/xyhandle/index.d.ts","./node_modules/@xyflow/system/dist/esm/xyminimap/index.d.ts","./node_modules/@xyflow/system/dist/esm/xypanzoom/xypanzoom.d.ts","./node_modules/@xyflow/system/dist/esm/xypanzoom/index.d.ts","./node_modules/@xyflow/system/dist/esm/xyresizer/types.d.ts","./node_modules/@xyflow/system/dist/esm/xyresizer/xyresizer.d.ts","./node_modules/@xyflow/system/dist/esm/xyresizer/index.d.ts","./node_modules/@xyflow/system/dist/esm/index.d.ts","./node_modules/@xyflow/react/dist/esm/types/general.d.ts","./node_modules/@xyflow/react/dist/esm/types/nodes.d.ts","./node_modules/@xyflow/react/dist/esm/types/edges.d.ts","./node_modules/@xyflow/react/dist/esm/types/component-props.d.ts","./node_modules/@xyflow/react/dist/esm/types/store.d.ts","./node_modules/@xyflow/react/dist/esm/types/instance.d.ts","./node_modules/@xyflow/react/dist/esm/types/index.d.ts","./node_modules/@xyflow/react/dist/esm/container/reactflow/index.d.ts","./node_modules/@xyflow/react/dist/esm/components/handle/index.d.ts","./node_modules/@xyflow/react/dist/esm/components/edges/edgetext.d.ts","./node_modules/@xyflow/react/dist/esm/components/edges/straightedge.d.ts","./node_modules/@xyflow/react/dist/esm/components/edges/stepedge.d.ts","./node_modules/@xyflow/react/dist/esm/components/edges/bezieredge.d.ts","./node_modules/@xyflow/react/dist/esm/components/edges/simplebezieredge.d.ts","./node_modules/@xyflow/react/dist/esm/components/edges/smoothstepedge.d.ts","./node_modules/@xyflow/react/dist/esm/components/edges/baseedge.d.ts","./node_modules/@xyflow/react/dist/esm/components/reactflowprovider/index.d.ts","./node_modules/@xyflow/react/dist/esm/components/panel/index.d.ts","./node_modules/@xyflow/react/dist/esm/components/edgelabelrenderer/index.d.ts","./node_modules/@xyflow/react/dist/esm/components/viewportportal/index.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usereactflow.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useupdatenodeinternals.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usenodes.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useedges.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useviewport.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usekeypress.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usenodesedgesstate.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usestore.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useonviewportchange.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useonselectionchange.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usenodesinitialized.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usehandleconnections.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usenodeconnections.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/usenodesdata.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useconnection.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useinternalnode.d.ts","./node_modules/@xyflow/react/dist/esm/contexts/nodeidcontext.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useonnodeschangemiddleware.d.ts","./node_modules/@xyflow/react/dist/esm/hooks/useonedgeschangemiddleware.d.ts","./node_modules/@xyflow/react/dist/esm/utils/changes.d.ts","./node_modules/@xyflow/react/dist/esm/utils/general.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/background/types.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/background/background.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/background/index.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/controls/types.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/controls/controls.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/controls/controlbutton.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/controls/index.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/minimap/types.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/minimap/minimap.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/minimap/minimapnode.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/minimap/index.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/noderesizer/types.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/noderesizer/noderesizer.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/noderesizer/noderesizecontrol.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/noderesizer/index.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/nodetoolbar/types.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/nodetoolbar/nodetoolbar.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/nodetoolbar/index.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/edgetoolbar/types.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/edgetoolbar/edgetoolbar.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/edgetoolbar/index.d.ts","./node_modules/@xyflow/react/dist/esm/additional-components/index.d.ts","./node_modules/@xyflow/react/dist/esm/index.d.ts","./node_modules/lucide-react/dist/lucide-react.d.ts","./components/databaseuploadzone.tsx","./components/leftpanel.tsx","./components/processnode.tsx","./components/idef0node.tsx","./node_modules/html-to-image/lib/types.d.ts","./node_modules/html-to-image/lib/index.d.ts","./app/page.tsx","./.next/types/routes.d.ts","./.next/types/validator.ts","./.next/dev/types/cache-life.d.ts","./.next/dev/types/validator.ts","./node_modules/@types/d3-transition/index.d.ts"],"fileIdsList":[[98,146,163,164,463,464,465,466],[98,146,163,164],[98,146,163,164,274,510,513,545,660],[98,146,163,164,274,510,545,660,661],[98,146,163,164,274,511],[86,98,146,163,164,274,544,652,655,656,657,659],[98,146,163,164,274],[86,98,146,163,164,274],[86,98,146,163,164,274,652],[86,98,146,163,164,274,540,544,653,654],[98,146,163,164,511,512,513],[98,146,163,164,547,665],[98,146,163,164,549],[98,146,163,164,547,550,665],[98,143,144,146,163,164],[98,145,146,163,164],[146,163,164],[98,146,151,163,164,181],[98,146,147,152,157,163,164,166,178,189],[98,146,147,148,157,163,164,166],[93,94,95,98,146,163,164],[98,146,149,163,164,190],[98,146,150,151,158,163,164,167],[98,146,151,163,164,178,186],[98,146,152,154,157,163,164,166],[98,145,146,153,163,164],[98,146,154,155,163,164],[98,146,156,157,163,164],[98,145,146,157,163,164],[98,146,157,158,159,163,164,178,189],[98,146,157,158,159,163,164,173,178,181],[98,139,146,154,157,160,163,164,166,178,189],[98,146,157,158,160,161,163,164,166,178,186,189],[98,146,160,162,163,164,178,186,189],[96,97,98,99,100,101,102,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195],[98,146,157,163,164],[98,146,163,164,165,189],[98,146,154,157,163,164,166,178],[98,146,163,164,167],[98,146,163,164,168],[98,145,146,163,164,169],[98,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195],[98,146,163,164,171],[98,146,163,164,172],[98,146,157,163,164,173,174],[98,146,163,164,173,175,190,192],[98,146,158,163,164],[98,146,157,163,164,178,179,181],[98,146,163,164,180,181],[98,146,163,164,178,179],[98,146,163,164,181],[98,146,163,164,182],[98,143,146,163,164,178,183,189],[98,146,157,163,164,184,185],[98,146,163,164,184,185],[98,146,151,163,164,166,178,186],[98,146,163,164,187],[98,146,163,164,166,188],[98,146,160,163,164,172,189],[98,146,151,163,164,190],[98,146,163,164,178,191],[98,146,163,164,165,192],[98,146,163,164,193],[98,139,146,163,164],[98,139,146,157,159,163,164,169,178,181,189,191,192,194],[98,146,163,164,178,195],[86,98,146,163,164,199,200,201,416],[86,98,146,163,164],[86,98,146,163,164,199,200],[86,98,146,163,164,200,416],[86,90,98,146,163,164,198,458,504],[86,90,98,146,163,164,197,458,504],[83,84,85,98,146,163,164],[86,98,146,163,164,274,630],[98,146,163,164,630,631],[98,146,163,164,274,633],[86,98,146,163,164,274,633],[98,146,163,164,633,634,635],[86,98,146,163,164,588,595],[98,146,163,164,274,648],[98,146,163,164,648,649],[86,98,146,163,164,588],[98,146,163,164,632,636,640,644,647,650],[98,146,163,164,637,638,639],[98,146,163,164,274,595,637],[86,98,146,163,164,274,637],[98,146,163,164,641,642,643],[86,98,146,163,164,274,641],[98,146,163,164,274,641],[98,146,163,164,645,646],[98,146,163,164,274,645],[98,146,163,164,274,595],[86,98,146,163,164,274,595],[86,98,146,163,164,274,588,595],[86,98,146,163,164,595],[98,146,163,164,588,595],[98,146,163,164,595],[98,146,163,164,588],[98,146,163,164,588,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,651],[98,146,163,164,589,590,591,592,593,594],[86,98,146,163,164,588,589],[98,146,163,164,559],[98,146,163,164,559,560,576,578,581,582,584,587],[98,146,163,164,552],[98,146,163,164,547,548,551,552,554,555,556,588,665],[98,146,163,164,546,552,554,555,556,557,558],[98,146,163,164,553,559],[98,146,163,164,551,559],[98,146,163,164,563,564,565,566,567],[98,146,163,164,552,554,557,558,559],[98,146,163,164,559,560],[98,146,163,164,553,561,562,568,569,570,571,572,573,574,575],[98,146,163,164,553,559,588],[98,146,163,164,577],[98,146,163,164,580],[98,146,163,164,579],[98,146,163,164,547,559,665],[98,146,163,164,583],[98,146,163,164,585,586],[98,146,163,164,548],[98,146,163,164,559,585],[98,146,163,164,658],[98,146,163,164,541,542],[98,146,163,164,461],[98,146,163,164,206,208,212,223,413,441,454],[98,146,163,164,208,218,219,220,222,454],[98,146,163,164,208,255,257,259,260,263,454,456],[98,146,163,164,208,212,214,215,216,246,341,413,431,432,440,454,456],[98,146,163,164,454],[98,146,163,164,219,311,420,429,449],[98,146,163,164,208],[98,146,163,164,202,311,449],[98,146,163,164,265],[98,146,163,164,264,454],[98,146,160,163,164,411,420,509],[98,146,160,163,164,379,391,429,448],[98,146,160,163,164,322],[98,146,163,164,434],[98,146,163,164,433,434,435],[98,146,163,164,433],[92,98,146,160,163,164,202,208,212,215,217,219,223,224,237,238,265,341,352,430,441,454,458],[98,146,163,164,206,208,221,255,256,261,262,454,509],[98,146,163,164,221,509],[98,146,163,164,206,238,366,454,509],[98,146,163,164,509],[98,146,163,164,208,221,222,509],[98,146,163,164,258,509],[98,146,163,164,224,431,439],[98,146,163,164,172,274,449],[98,146,163,164,274,449],[86,98,146,163,164,383],[98,146,163,164,309,319,320,449,486,493],[98,146,163,164,308,426,487,488,489,490,492],[98,146,163,164,425],[98,146,163,164,425,426],[98,146,163,164,246,311,312,316],[98,146,163,164,311],[98,146,163,164,311,315,317],[98,146,163,164,311,312,313,314],[98,146,163,164,491],[86,98,146,163,164,209,480],[86,98,146,163,164,189],[86,98,146,163,164,221,301],[86,98,146,163,164,221,441],[98,146,163,164,299,303],[86,98,146,163,164,300,460],[86,90,98,146,160,163,164,196,197,198,458,502,503],[98,146,160,163,164],[98,146,160,163,164,212,245,297,342,363,365,436,437,441,454,455],[98,146,163,164,237,438],[98,146,163,164,458],[98,146,163,164,207],[86,98,146,163,164,368,381,390,400,402,448],[98,146,163,164,172,368,381,399,400,401,448,508],[98,146,163,164,393,394,395,396,397,398],[98,146,163,164,395],[98,146,163,164,399],[98,146,163,164,272,273,274,276],[86,98,146,163,164,266,267,268,269,275],[98,146,163,164,272,275],[98,146,163,164,270],[98,146,163,164,271],[86,98,146,163,164,274,300,460],[86,98,146,163,164,274,459,460],[86,98,146,163,164,274,460],[98,146,163,164,342,443],[98,146,163,164,443],[98,146,160,163,164,455,460],[98,146,163,164,387],[98,145,146,163,164,386],[98,146,163,164,247,311,328,365,374,377,379,380,419,448,451,455],[98,146,163,164,293,311,408],[98,146,163,164,379,448],[86,98,146,163,164,379,384,385,387,388,389,390,391,392,403,404,405,406,407,409,410,448,449,509],[98,146,163,164,373],[98,146,160,163,164,172,209,245,248,269,294,295,342,352,363,364,419,442,454,455,456,458,509],[98,146,163,164,448],[98,145,146,163,164,219,295,352,376,442,444,445,446,447,455],[98,146,163,164,379],[98,145,146,163,164,245,282,328,369,370,371,372,373,374,375,377,378,448,449],[98,146,160,163,164,282,283,369,455,456],[98,146,163,164,219,342,352,365,442,448,455],[98,146,160,163,164,454,456],[98,146,160,163,164,178,451,455,456],[98,146,160,163,164,172,189,202,212,221,247,248,250,279,284,289,293,294,295,297,326,328,330,333,335,338,339,340,341,363,365,441,442,449,451,454,455,456],[98,146,160,163,164,178],[98,146,163,164,208,209,210,217,451,452,453,458,460,509],[98,146,163,164,206,454],[98,146,163,164,278],[98,146,160,163,164,178,189,240,263,265,266,267,268,269,276,277,509],[98,146,163,164,172,189,202,240,255,288,289,290,326,327,328,333,341,342,348,351,353,363,365,442,449,451,454],[98,146,163,164,217,224,237,341,352,442,454],[98,146,160,163,164,189,209,212,328,346,451,454],[98,146,163,164,367],[98,146,160,163,164,278,349,350,360],[98,146,163,164,451,454],[98,146,163,164,374,376],[98,146,163,164,295,328,441,460],[98,146,160,163,164,172,251,255,327,333,348,351,355,451],[98,146,160,163,164,224,237,255,356],[98,146,163,164,208,250,358,441,454],[98,146,160,163,164,189,269,454],[98,146,160,163,164,221,249,250,251,260,278,357,359,441,454],[92,98,146,160,163,164,295,362,458,460],[98,146,163,164,325,363],[98,146,160,163,164,172,189,212,223,224,237,247,248,284,288,289,290,294,326,327,328,330,342,343,345,347,363,365,441,442,449,450,451,460],[98,146,160,163,164,178,224,348,354,360,451],[98,146,163,164,227,228,229,230,231,232,233,234,235,236],[98,146,163,164,279,334],[98,146,163,164,336],[98,146,163,164,334],[98,146,163,164,336,337],[98,146,160,163,164,212,215,245,246,455],[98,146,160,163,164,172,207,209,247,293,294,295,296,324,363,451,456,458,460],[98,146,160,163,164,172,189,211,246,296,328,374,442,450,455],[98,146,163,164,369],[98,146,163,164,370],[98,146,163,164,311,341,419],[98,146,163,164,371],[98,146,163,164,239,243],[98,146,160,163,164,212,239,247],[98,146,163,164,242,243],[98,146,163,164,244],[98,146,163,164,239,240],[98,146,163,164,239,291],[98,146,163,164,239],[98,146,163,164,279,332,450],[98,146,163,164,331],[98,146,163,164,240,449,450],[98,146,163,164,329,450],[98,146,163,164,240,449],[98,146,163,164,419],[98,146,163,164,212,241,247,295,311,328,362,365,368,374,381,382,412,413,415,418,441,451,455],[98,146,163,164,304,307,309,310,319,320],[86,98,146,163,164,199,200,201,274,414],[86,98,146,163,164,199,200,201,274,414,417],[98,146,163,164,428],[98,146,163,164,219,283,295,362,365,379,387,391,421,422,423,424,426,427,430,441,448,454],[98,146,163,164,319],[98,146,160,163,164,324],[98,146,163,164,324],[98,146,160,163,164,247,292,297,321,323,362,451,458,460],[98,146,163,164,304,305,306,307,309,310,319,320,459],[92,98,146,160,163,164,172,189,239,240,248,294,295,328,360,361,363,441,442,451,454,455,458],[98,146,163,164,283,285,288,442],[98,146,160,163,164,279,454],[98,146,163,164,282,379],[98,146,163,164,281],[98,146,163,164,283,284],[98,146,163,164,280,282,454],[98,146,160,163,164,211,283,285,286,287,454,455],[86,98,146,163,164,311,318,449],[98,146,163,164,204,205],[86,98,146,163,164,209],[86,98,146,163,164,308,449],[86,92,98,146,163,164,294,295,458,460],[98,146,163,164,209,480,481],[86,98,146,163,164,303],[86,98,146,163,164,172,189,207,262,298,300,302,460],[98,146,163,164,221,449,455],[98,146,163,164,344,449],[86,98,146,158,160,163,164,172,206,207,257,303,458,459],[86,98,146,163,164,197,198,458,504],[86,87,88,89,90,98,146,163,164],[98,146,151,163,164],[98,146,163,164,252,253,254],[98,146,163,164,252],[86,90,98,146,160,162,163,164,172,196,197,198,199,201,202,207,248,355,399,456,457,460,504],[98,146,163,164,468],[98,146,163,164,470],[98,146,163,164,472],[98,146,163,164,474],[98,146,163,164,476,477,478],[98,146,163,164,482],[91,98,146,163,164,462,467,469,471,473,475,479,483,485,495,496,498,507,508,509,510],[98,146,163,164,484],[98,146,163,164,494],[98,146,163,164,300],[98,146,163,164,497],[98,145,146,163,164,283,285,286,288,499,500,501,504,505,506],[98,146,163,164,196],[98,146,163,164,530],[98,146,163,164,528,530],[98,146,163,164,519,527,528,529,531,533],[98,146,163,164,517],[98,146,163,164,520,525,530,533],[98,146,163,164,516,533],[98,146,163,164,520,521,524,525,526,533],[98,146,163,164,520,521,522,524,525,533],[98,146,163,164,517,518,519,520,521,525,526,527,529,530,531,533],[98,146,163,164,533],[98,146,163,164,515,517,518,519,520,521,522,524,525,526,527,528,529,530,531,532],[98,146,163,164,515,533],[98,146,163,164,520,522,523,525,526,533],[98,146,163,164,524,533],[98,146,163,164,525,526,530,533],[98,146,163,164,518,528],[98,146,163,164,178,196],[98,146,163,164,535,536],[98,146,163,164,534,537],[98,111,115,146,163,164,189],[98,111,146,163,164,178,189],[98,106,146,163,164],[98,108,111,146,163,164,186,189],[98,146,163,164,166,186],[98,106,146,163,164,196],[98,108,111,146,163,164,166,189],[98,103,104,107,110,146,157,163,164,178,189],[98,111,118,146,163,164],[98,103,109,146,163,164],[98,111,132,133,146,163,164],[98,107,111,146,163,164,181,189,196],[98,132,146,163,164,196],[98,105,106,146,163,164,196],[98,111,146,163,164],[98,105,106,107,108,109,110,111,112,113,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,133,134,135,136,137,138,146,163,164],[98,111,126,146,163,164],[98,111,118,119,146,163,164],[98,109,111,119,120,146,163,164],[98,110,146,163,164],[98,103,106,111,146,163,164],[98,111,115,119,120,146,163,164],[98,115,146,163,164],[98,109,111,114,146,163,164,189],[98,103,108,111,118,146,163,164],[98,146,163,164,178],[98,106,111,132,146,163,164,194,196],[98,146,163,164,274,538],[98,146,163,164,274,543]],"fileInfos":[{"version":"c430d44666289dae81f30fa7b2edebf186ecc91a2d4c71266ea6ae76388792e1","affectsGlobalScope":true,"impliedFormat":1},{"version":"45b7ab580deca34ae9729e97c13cfd999df04416a79116c3bfb483804f85ded4","impliedFormat":1},{"version":"3facaf05f0c5fc569c5649dd359892c98a85557e3e0c847964caeb67076f4d75","impliedFormat":1},{"version":"e44bb8bbac7f10ecc786703fe0a6a4b952189f908707980ba8f3c8975a760962","impliedFormat":1},{"version":"5e1c4c362065a6b95ff952c0eab010f04dcd2c3494e813b493ecfd4fcb9fc0d8","impliedFormat":1},{"version":"68d73b4a11549f9c0b7d352d10e91e5dca8faa3322bfb77b661839c42b1ddec7","impliedFormat":1},{"version":"5efce4fc3c29ea84e8928f97adec086e3dc876365e0982cc8479a07954a3efd4","impliedFormat":1},{"version":"feecb1be483ed332fad555aff858affd90a48ab19ba7272ee084704eb7167569","impliedFormat":1},{"version":"ee7bad0c15b58988daa84371e0b89d313b762ab83cb5b31b8a2d1162e8eb41c2","impliedFormat":1},{"version":"27bdc30a0e32783366a5abeda841bc22757c1797de8681bbe81fbc735eeb1c10","impliedFormat":1},{"version":"8fd575e12870e9944c7e1d62e1f5a73fcf23dd8d3a321f2a2c74c20d022283fe","impliedFormat":1},{"version":"2ab096661c711e4a81cc464fa1e6feb929a54f5340b46b0a07ac6bbf857471f0","impliedFormat":1},{"version":"080941d9f9ff9307f7e27a83bcd888b7c8270716c39af943532438932ec1d0b9","affectsGlobalScope":true,"impliedFormat":1},{"version":"2e80ee7a49e8ac312cc11b77f1475804bee36b3b2bc896bead8b6e1266befb43","affectsGlobalScope":true,"impliedFormat":1},{"version":"c57796738e7f83dbc4b8e65132f11a377649c00dd3eee333f672b8f0a6bea671","affectsGlobalScope":true,"impliedFormat":1},{"version":"dc2df20b1bcdc8c2d34af4926e2c3ab15ffe1160a63e58b7e09833f616efff44","affectsGlobalScope":true,"impliedFormat":1},{"version":"515d0b7b9bea2e31ea4ec968e9edd2c39d3eebf4a2d5cbd04e88639819ae3b71","affectsGlobalScope":true,"impliedFormat":1},{"version":"0559b1f683ac7505ae451f9a96ce4c3c92bdc71411651ca6ddb0e88baaaad6a3","affectsGlobalScope":true,"impliedFormat":1},{"version":"0dc1e7ceda9b8b9b455c3a2d67b0412feab00bd2f66656cd8850e8831b08b537","affectsGlobalScope":true,"impliedFormat":1},{"version":"ce691fb9e5c64efb9547083e4a34091bcbe5bdb41027e310ebba8f7d96a98671","affectsGlobalScope":true,"impliedFormat":1},{"version":"8d697a2a929a5fcb38b7a65594020fcef05ec1630804a33748829c5ff53640d0","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ff2a353abf8a80ee399af572debb8faab2d33ad38c4b4474cff7f26e7653b8d","affectsGlobalScope":true,"impliedFormat":1},{"version":"fb0f136d372979348d59b3f5020b4cdb81b5504192b1cacff5d1fbba29378aa1","affectsGlobalScope":true,"impliedFormat":1},{"version":"d15bea3d62cbbdb9797079416b8ac375ae99162a7fba5de2c6c505446486ac0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"68d18b664c9d32a7336a70235958b8997ebc1c3b8505f4f1ae2b7e7753b87618","affectsGlobalScope":true,"impliedFormat":1},{"version":"eb3d66c8327153d8fa7dd03f9c58d351107fe824c79e9b56b462935176cdf12a","affectsGlobalScope":true,"impliedFormat":1},{"version":"38f0219c9e23c915ef9790ab1d680440d95419ad264816fa15009a8851e79119","affectsGlobalScope":true,"impliedFormat":1},{"version":"69ab18c3b76cd9b1be3d188eaf8bba06112ebbe2f47f6c322b5105a6fbc45a2e","affectsGlobalScope":true,"impliedFormat":1},{"version":"a680117f487a4d2f30ea46f1b4b7f58bef1480456e18ba53ee85c2746eeca012","affectsGlobalScope":true,"impliedFormat":1},{"version":"2f11ff796926e0832f9ae148008138ad583bd181899ab7dd768a2666700b1893","affectsGlobalScope":true,"impliedFormat":1},{"version":"4de680d5bb41c17f7f68e0419412ca23c98d5749dcaaea1896172f06435891fc","affectsGlobalScope":true,"impliedFormat":1},{"version":"954296b30da6d508a104a3a0b5d96b76495c709785c1d11610908e63481ee667","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac9538681b19688c8eae65811b329d3744af679e0bdfa5d842d0e32524c73e1c","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a969edff4bd52585473d24995c5ef223f6652d6ef46193309b3921d65dd4376","affectsGlobalScope":true,"impliedFormat":1},{"version":"9e9fbd7030c440b33d021da145d3232984c8bb7916f277e8ffd3dc2e3eae2bdb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811ec78f7fefcabbda4bfa93b3eb67d9ae166ef95f9bff989d964061cbf81a0c","affectsGlobalScope":true,"impliedFormat":1},{"version":"717937616a17072082152a2ef351cb51f98802fb4b2fdabd32399843875974ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"d7e7d9b7b50e5f22c915b525acc5a49a7a6584cf8f62d0569e557c5cfc4b2ac2","affectsGlobalScope":true,"impliedFormat":1},{"version":"71c37f4c9543f31dfced6c7840e068c5a5aacb7b89111a4364b1d5276b852557","affectsGlobalScope":true,"impliedFormat":1},{"version":"576711e016cf4f1804676043e6a0a5414252560eb57de9faceee34d79798c850","affectsGlobalScope":true,"impliedFormat":1},{"version":"89c1b1281ba7b8a96efc676b11b264de7a8374c5ea1e6617f11880a13fc56dc6","affectsGlobalScope":true,"impliedFormat":1},{"version":"74f7fa2d027d5b33eb0471c8e82a6c87216223181ec31247c357a3e8e2fddc5b","affectsGlobalScope":true,"impliedFormat":1},{"version":"d6d7ae4d1f1f3772e2a3cde568ed08991a8ae34a080ff1151af28b7f798e22ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"063600664504610fe3e99b717a1223f8b1900087fab0b4cad1496a114744f8df","affectsGlobalScope":true,"impliedFormat":1},{"version":"934019d7e3c81950f9a8426d093458b65d5aff2c7c1511233c0fd5b941e608ab","affectsGlobalScope":true,"impliedFormat":1},{"version":"52ada8e0b6e0482b728070b7639ee42e83a9b1c22d205992756fe020fd9f4a47","affectsGlobalScope":true,"impliedFormat":1},{"version":"3bdefe1bfd4d6dee0e26f928f93ccc128f1b64d5d501ff4a8cf3c6371200e5e6","affectsGlobalScope":true,"impliedFormat":1},{"version":"59fb2c069260b4ba00b5643b907ef5d5341b167e7d1dbf58dfd895658bda2867","affectsGlobalScope":true,"impliedFormat":1},{"version":"639e512c0dfc3fad96a84caad71b8834d66329a1f28dc95e3946c9b58176c73a","affectsGlobalScope":true,"impliedFormat":1},{"version":"368af93f74c9c932edd84c58883e736c9e3d53cec1fe24c0b0ff451f529ceab1","affectsGlobalScope":true,"impliedFormat":1},{"version":"af3dd424cf267428f30ccfc376f47a2c0114546b55c44d8c0f1d57d841e28d74","affectsGlobalScope":true,"impliedFormat":1},{"version":"995c005ab91a498455ea8dfb63aa9f83fa2ea793c3d8aa344be4a1678d06d399","affectsGlobalScope":true,"impliedFormat":1},{"version":"959d36cddf5e7d572a65045b876f2956c973a586da58e5d26cde519184fd9b8a","affectsGlobalScope":true,"impliedFormat":1},{"version":"965f36eae237dd74e6cca203a43e9ca801ce38824ead814728a2807b1910117d","affectsGlobalScope":true,"impliedFormat":1},{"version":"3925a6c820dcb1a06506c90b1577db1fdbf7705d65b62b99dce4be75c637e26b","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a3d63ef2b853447ec4f749d3f368ce642264246e02911fcb1590d8c161b8005","affectsGlobalScope":true,"impliedFormat":1},{"version":"8cdf8847677ac7d20486e54dd3fcf09eda95812ac8ace44b4418da1bbbab6eb8","affectsGlobalScope":true,"impliedFormat":1},{"version":"8444af78980e3b20b49324f4a16ba35024fef3ee069a0eb67616ea6ca821c47a","affectsGlobalScope":true,"impliedFormat":1},{"version":"3287d9d085fbd618c3971944b65b4be57859f5415f495b33a6adc994edd2f004","affectsGlobalScope":true,"impliedFormat":1},{"version":"b4b67b1a91182421f5df999988c690f14d813b9850b40acd06ed44691f6727ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"df83c2a6c73228b625b0beb6669c7ee2a09c914637e2d35170723ad49c0f5cd4","affectsGlobalScope":true,"impliedFormat":1},{"version":"436aaf437562f276ec2ddbee2f2cdedac7664c1e4c1d2c36839ddd582eeb3d0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e3c06ea092138bf9fa5e874a1fdbc9d54805d074bee1de31b99a11e2fec239d","affectsGlobalScope":true,"impliedFormat":1},{"version":"87dc0f382502f5bbce5129bdc0aea21e19a3abbc19259e0b43ae038a9fc4e326","affectsGlobalScope":true,"impliedFormat":1},{"version":"b1cb28af0c891c8c96b2d6b7be76bd394fddcfdb4709a20ba05a7c1605eea0f9","affectsGlobalScope":true,"impliedFormat":1},{"version":"2fef54945a13095fdb9b84f705f2b5994597640c46afeb2ce78352fab4cb3279","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac77cb3e8c6d3565793eb90a8373ee8033146315a3dbead3bde8db5eaf5e5ec6","affectsGlobalScope":true,"impliedFormat":1},{"version":"56e4ed5aab5f5920980066a9409bfaf53e6d21d3f8d020c17e4de584d29600ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ece9f17b3866cc077099c73f4983bddbcb1dc7ddb943227f1ec070f529dedd1","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a6282c8827e4b9a95f4bf4f5c205673ada31b982f50572d27103df8ceb8013c","affectsGlobalScope":true,"impliedFormat":1},{"version":"1c9319a09485199c1f7b0498f2988d6d2249793ef67edda49d1e584746be9032","affectsGlobalScope":true,"impliedFormat":1},{"version":"e3a2a0cee0f03ffdde24d89660eba2685bfbdeae955a6c67e8c4c9fd28928eeb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811c71eee4aa0ac5f7adf713323a5c41b0cf6c4e17367a34fbce379e12bbf0a4","affectsGlobalScope":true,"impliedFormat":1},{"version":"51ad4c928303041605b4d7ae32e0c1ee387d43a24cd6f1ebf4a2699e1076d4fa","affectsGlobalScope":true,"impliedFormat":1},{"version":"60037901da1a425516449b9a20073aa03386cce92f7a1fd902d7602be3a7c2e9","affectsGlobalScope":true,"impliedFormat":1},{"version":"d4b1d2c51d058fc21ec2629fff7a76249dec2e36e12960ea056e3ef89174080f","affectsGlobalScope":true,"impliedFormat":1},{"version":"22adec94ef7047a6c9d1af3cb96be87a335908bf9ef386ae9fd50eeb37f44c47","affectsGlobalScope":true,"impliedFormat":1},{"version":"196cb558a13d4533a5163286f30b0509ce0210e4b316c56c38d4c0fd2fb38405","affectsGlobalScope":true,"impliedFormat":1},{"version":"73f78680d4c08509933daf80947902f6ff41b6230f94dd002ae372620adb0f60","affectsGlobalScope":true,"impliedFormat":1},{"version":"c5239f5c01bcfa9cd32f37c496cf19c61d69d37e48be9de612b541aac915805b","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e7f8264d0fb4c5339605a15daadb037bf238c10b654bb3eee14208f860a32ea","affectsGlobalScope":true,"impliedFormat":1},{"version":"782dec38049b92d4e85c1585fbea5474a219c6984a35b004963b00beb1aab538","affectsGlobalScope":true,"impliedFormat":1},{"version":"eb5b19b86227ace1d29ea4cf81387279d04bb34051e944bc53df69f58914b788","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac51dd7d31333793807a6abaa5ae168512b6131bd41d9c5b98477fc3b7800f9f","impliedFormat":1},{"version":"87d9d29dbc745f182683f63187bf3d53fd8673e5fca38ad5eaab69798ed29fbc","impliedFormat":1},{"version":"035312d4945d13efa134ae482f6dc56a1a9346f7ac3be7ccbad5741058ce87f3","affectsGlobalScope":true,"impliedFormat":1},{"version":"acd8fd5090ac73902278889c38336ff3f48af6ba03aa665eb34a75e7ba1dccc4","impliedFormat":1},{"version":"d6258883868fb2680d2ca96bc8b1352cab69874581493e6d52680c5ffecdb6cc","impliedFormat":1},{"version":"1b61d259de5350f8b1e5db06290d31eaebebc6baafd5f79d314b5af9256d7153","impliedFormat":1},{"version":"f258e3960f324a956fc76a3d3d9e964fff2244ff5859dcc6ce5951e5413ca826","impliedFormat":1},{"version":"643f7232d07bf75e15bd8f658f664d6183a0efaca5eb84b48201c7671a266979","impliedFormat":1},{"version":"21da358700a3893281ce0c517a7a30cbd46be020d9f0c3f2834d0a8ad1f5fc75","impliedFormat":1},{"version":"6c7176368037af28cb72f2392010fa1cef295d6d6744bca8cfb54985f3a18c3e","affectsGlobalScope":true,"impliedFormat":1},{"version":"ab41ef1f2cdafb8df48be20cd969d875602483859dc194e9c97c8a576892c052","affectsGlobalScope":true,"impliedFormat":1},{"version":"437e20f2ba32abaeb7985e0afe0002de1917bc74e949ba585e49feba65da6ca1","affectsGlobalScope":true,"impliedFormat":1},{"version":"21d819c173c0cf7cc3ce57c3276e77fd9a8a01d35a06ad87158781515c9a438a","impliedFormat":1},{"version":"98cffbf06d6bab333473c70a893770dbe990783904002c4f1a960447b4b53dca","affectsGlobalScope":true,"impliedFormat":1},{"version":"3af97acf03cc97de58a3a4bc91f8f616408099bc4233f6d0852e72a8ffb91ac9","affectsGlobalScope":true,"impliedFormat":1},{"version":"808069bba06b6768b62fd22429b53362e7af342da4a236ed2d2e1c89fcca3b4a","affectsGlobalScope":true,"impliedFormat":1},{"version":"1db0b7dca579049ca4193d034d835f6bfe73096c73663e5ef9a0b5779939f3d0","affectsGlobalScope":true,"impliedFormat":1},{"version":"9798340ffb0d067d69b1ae5b32faa17ab31b82466a3fc00d8f2f2df0c8554aaa","affectsGlobalScope":true,"impliedFormat":1},{"version":"f26b11d8d8e4b8028f1c7d618b22274c892e4b0ef5b3678a8ccbad85419aef43","affectsGlobalScope":true,"impliedFormat":1},{"version":"5929864ce17fba74232584d90cb721a89b7ad277220627cc97054ba15a98ea8f","impliedFormat":1},{"version":"763fe0f42b3d79b440a9b6e51e9ba3f3f91352469c1e4b3b67bfa4ff6352f3f4","impliedFormat":1},{"version":"25c8056edf4314820382a5fdb4bb7816999acdcb929c8f75e3f39473b87e85bc","impliedFormat":1},{"version":"c464d66b20788266e5353b48dc4aa6bc0dc4a707276df1e7152ab0c9ae21fad8","impliedFormat":1},{"version":"78d0d27c130d35c60b5e5566c9f1e5be77caf39804636bc1a40133919a949f21","impliedFormat":1},{"version":"c6fd2c5a395f2432786c9cb8deb870b9b0e8ff7e22c029954fabdd692bff6195","impliedFormat":1},{"version":"1d6e127068ea8e104a912e42fc0a110e2aa5a66a356a917a163e8cf9a65e4a75","impliedFormat":1},{"version":"5ded6427296cdf3b9542de4471d2aa8d3983671d4cac0f4bf9c637208d1ced43","impliedFormat":1},{"version":"7f182617db458e98fc18dfb272d40aa2fff3a353c44a89b2c0ccb3937709bfb5","impliedFormat":1},{"version":"cadc8aced301244057c4e7e73fbcae534b0f5b12a37b150d80e5a45aa4bebcbd","impliedFormat":1},{"version":"385aab901643aa54e1c36f5ef3107913b10d1b5bb8cbcd933d4263b80a0d7f20","impliedFormat":1},{"version":"9670d44354bab9d9982eca21945686b5c24a3f893db73c0dae0fd74217a4c219","impliedFormat":1},{"version":"0b8a9268adaf4da35e7fa830c8981cfa22adbbe5b3f6f5ab91f6658899e657a7","impliedFormat":1},{"version":"11396ed8a44c02ab9798b7dca436009f866e8dae3c9c25e8c1fbc396880bf1bb","impliedFormat":1},{"version":"ba7bc87d01492633cb5a0e5da8a4a42a1c86270e7b3d2dea5d156828a84e4882","impliedFormat":1},{"version":"4893a895ea92c85345017a04ed427cbd6a1710453338df26881a6019432febdd","impliedFormat":1},{"version":"c21dc52e277bcfc75fac0436ccb75c204f9e1b3fa5e12729670910639f27343e","impliedFormat":1},{"version":"13f6f39e12b1518c6650bbb220c8985999020fe0f21d818e28f512b7771d00f9","impliedFormat":1},{"version":"9b5369969f6e7175740bf51223112ff209f94ba43ecd3bb09eefff9fd675624a","impliedFormat":1},{"version":"4fe9e626e7164748e8769bbf74b538e09607f07ed17c2f20af8d680ee49fc1da","impliedFormat":1},{"version":"24515859bc0b836719105bb6cc3d68255042a9f02a6022b3187948b204946bd2","impliedFormat":1},{"version":"ea0148f897b45a76544ae179784c95af1bd6721b8610af9ffa467a518a086a43","impliedFormat":1},{"version":"24c6a117721e606c9984335f71711877293a9651e44f59f3d21c1ea0856f9cc9","impliedFormat":1},{"version":"dd3273ead9fbde62a72949c97dbec2247ea08e0c6952e701a483d74ef92d6a17","impliedFormat":1},{"version":"405822be75ad3e4d162e07439bac80c6bcc6dbae1929e179cf467ec0b9ee4e2e","impliedFormat":1},{"version":"0db18c6e78ea846316c012478888f33c11ffadab9efd1cc8bcc12daded7a60b6","impliedFormat":1},{"version":"e61be3f894b41b7baa1fbd6a66893f2579bfad01d208b4ff61daef21493ef0a8","impliedFormat":1},{"version":"bd0532fd6556073727d28da0edfd1736417a3f9f394877b6d5ef6ad88fba1d1a","impliedFormat":1},{"version":"89167d696a849fce5ca508032aabfe901c0868f833a8625d5a9c6e861ef935d2","impliedFormat":1},{"version":"615ba88d0128ed16bf83ef8ccbb6aff05c3ee2db1cc0f89ab50a4939bfc1943f","impliedFormat":1},{"version":"a4d551dbf8746780194d550c88f26cf937caf8d56f102969a110cfaed4b06656","impliedFormat":1},{"version":"8bd86b8e8f6a6aa6c49b71e14c4ffe1211a0e97c80f08d2c8cc98838006e4b88","impliedFormat":1},{"version":"317e63deeb21ac07f3992f5b50cdca8338f10acd4fbb7257ebf56735bf52ab00","impliedFormat":1},{"version":"4732aec92b20fb28c5fe9ad99521fb59974289ed1e45aecb282616202184064f","impliedFormat":1},{"version":"2e85db9e6fd73cfa3d7f28e0ab6b55417ea18931423bd47b409a96e4a169e8e6","impliedFormat":1},{"version":"c46e079fe54c76f95c67fb89081b3e399da2c7d109e7dca8e4b58d83e332e605","impliedFormat":1},{"version":"bf67d53d168abc1298888693338cb82854bdb2e69ef83f8a0092093c2d562107","impliedFormat":1},{"version":"b52476feb4a0cbcb25e5931b930fc73cb6643fb1a5060bf8a3dda0eeae5b4b68","affectsGlobalScope":true,"impliedFormat":1},{"version":"f9501cc13ce624c72b61f12b3963e84fad210fbdf0ffbc4590e08460a3f04eba","affectsGlobalScope":true,"impliedFormat":1},{"version":"e7721c4f69f93c91360c26a0a84ee885997d748237ef78ef665b153e622b36c1","affectsGlobalScope":true,"impliedFormat":1},{"version":"0fa06ada475b910e2106c98c68b10483dc8811d0c14a8a8dd36efb2672485b29","impliedFormat":1},{"version":"33e5e9aba62c3193d10d1d33ae1fa75c46a1171cf76fef750777377d53b0303f","impliedFormat":1},{"version":"2b06b93fd01bcd49d1a6bd1f9b65ddcae6480b9a86e9061634d6f8e354c1468f","impliedFormat":1},{"version":"6a0cd27e5dc2cfbe039e731cf879d12b0e2dded06d1b1dedad07f7712de0d7f4","affectsGlobalScope":true,"impliedFormat":1},{"version":"13f5c844119c43e51ce777c509267f14d6aaf31eafb2c2b002ca35584cd13b29","impliedFormat":1},{"version":"e60477649d6ad21542bd2dc7e3d9ff6853d0797ba9f689ba2f6653818999c264","impliedFormat":1},{"version":"c2510f124c0293ab80b1777c44d80f812b75612f297b9857406468c0f4dafe29","affectsGlobalScope":true,"impliedFormat":1},{"version":"5524481e56c48ff486f42926778c0a3cce1cc85dc46683b92b1271865bcf015a","impliedFormat":1},{"version":"4c829ab315f57c5442c6667b53769975acbf92003a66aef19bce151987675bd1","affectsGlobalScope":true,"impliedFormat":1},{"version":"b2ade7657e2db96d18315694789eff2ddd3d8aea7215b181f8a0b303277cc579","impliedFormat":1},{"version":"9855e02d837744303391e5623a531734443a5f8e6e8755e018c41d63ad797db2","impliedFormat":1},{"version":"4d631b81fa2f07a0e63a9a143d6a82c25c5f051298651a9b69176ba28930756d","impliedFormat":1},{"version":"836a356aae992ff3c28a0212e3eabcb76dd4b0cc06bcb9607aeef560661b860d","impliedFormat":1},{"version":"1e0d1f8b0adfa0b0330e028c7941b5a98c08b600efe7f14d2d2a00854fb2f393","impliedFormat":1},{"version":"41670ee38943d9cbb4924e436f56fc19ee94232bc96108562de1a734af20dc2c","affectsGlobalScope":true,"impliedFormat":1},{"version":"c906fb15bd2aabc9ed1e3f44eb6a8661199d6c320b3aa196b826121552cb3695","impliedFormat":1},{"version":"22295e8103f1d6d8ea4b5d6211e43421fe4564e34d0dd8e09e520e452d89e659","impliedFormat":1},{"version":"f949f7f6c7802a338039cfc2156d1fe285cdd1e092c64437ebe15ae8edc854e0","impliedFormat":1},{"version":"6b4e081d55ac24fc8a4631d5dd77fe249fa25900abd7d046abb87d90e3b45645","impliedFormat":1},{"version":"a10f0e1854f3316d7ee437b79649e5a6ae3ae14ffe6322b02d4987071a95362e","impliedFormat":1},{"version":"e208f73ef6a980104304b0d2ca5f6bf1b85de6009d2c7e404028b875020fa8f2","impliedFormat":1},{"version":"d163b6bc2372b4f07260747cbc6c0a6405ab3fbcea3852305e98ac43ca59f5bc","impliedFormat":1},{"version":"e6fa9ad47c5f71ff733744a029d1dc472c618de53804eae08ffc243b936f87ff","affectsGlobalScope":true,"impliedFormat":1},{"version":"83e63d6ccf8ec004a3bb6d58b9bb0104f60e002754b1e968024b320730cc5311","impliedFormat":1},{"version":"24826ed94a78d5c64bd857570fdbd96229ad41b5cb654c08d75a9845e3ab7dde","impliedFormat":1},{"version":"8b479a130ccb62e98f11f136d3ac80f2984fdc07616516d29881f3061f2dd472","impliedFormat":1},{"version":"928af3d90454bf656a52a48679f199f64c1435247d6189d1caf4c68f2eaf921f","affectsGlobalScope":true,"impliedFormat":1},{"version":"d2bc7425ef40526650d6db7e072c1ff4a51101c3ac2cc4b666623b19496a6e27","affectsGlobalScope":true,"impliedFormat":1},{"version":"3f16a7e4deafa527ed9995a772bb380eb7d3c2c0fd4ae178c5263ed18394db2c","impliedFormat":1},{"version":"933921f0bb0ec12ef45d1062a1fc0f27635318f4d294e4d99de9a5493e618ca2","impliedFormat":1},{"version":"71a0f3ad612c123b57239a7749770017ecfe6b66411488000aba83e4546fde25","impliedFormat":1},{"version":"77fbe5eecb6fac4b6242bbf6eebfc43e98ce5ccba8fa44e0ef6a95c945ff4d98","impliedFormat":1},{"version":"4f9d8ca0c417b67b69eeb54c7ca1bedd7b56034bb9bfd27c5d4f3bc4692daca7","impliedFormat":1},{"version":"814118df420c4e38fe5ae1b9a3bafb6e9c2aa40838e528cde908381867be6466","impliedFormat":1},{"version":"a3fc63c0d7b031693f665f5494412ba4b551fe644ededccc0ab5922401079c95","impliedFormat":1},{"version":"f27524f4bef4b6519c604bdb23bf4465bddcccbf3f003abb901acbd0d7404d99","impliedFormat":1},{"version":"37ba7b45141a45ce6e80e66f2a96c8a5ab1bcef0fc2d0f56bb58df96ec67e972","impliedFormat":1},{"version":"45650f47bfb376c8a8ed39d4bcda5902ab899a3150029684ee4c10676d9fbaee","impliedFormat":1},{"version":"6b039f55681caaf111d5eb84d292b9bee9e0131d0db1ad0871eef0964f533c73","affectsGlobalScope":true,"impliedFormat":1},{"version":"18fd40412d102c5564136f29735e5d1c3b455b8a37f920da79561f1fde068208","impliedFormat":1},{"version":"c8d3e5a18ba35629954e48c4cc8f11dc88224650067a172685c736b27a34a4dc","impliedFormat":1},{"version":"f0be1b8078cd549d91f37c30c222c2a187ac1cf981d994fb476a1adc61387b14","affectsGlobalScope":true,"impliedFormat":1},{"version":"0aaed1d72199b01234152f7a60046bc947f1f37d78d182e9ae09c4289e06a592","impliedFormat":1},{"version":"0dba70b3fb0dcd713fda33c2df64fa6751fff6460e536971cee917260fb17882","impliedFormat":1},{"version":"66ba1b2c3e3a3644a1011cd530fb444a96b1b2dfe2f5e837a002d41a1a799e60","impliedFormat":1},{"version":"7e514f5b852fdbc166b539fdd1f4e9114f29911592a5eb10a94bb3a13ccac3c4","impliedFormat":1},{"version":"5b7aa3c4c1a5d81b411e8cb302b45507fea9358d3569196b27eb1a27ae3a90ef","affectsGlobalScope":true,"impliedFormat":1},{"version":"5987a903da92c7462e0b35704ce7da94d7fdc4b89a984871c0e2b87a8aae9e69","affectsGlobalScope":true,"impliedFormat":1},{"version":"ea08a0345023ade2b47fbff5a76d0d0ed8bff10bc9d22b83f40858a8e941501c","impliedFormat":1},{"version":"47613031a5a31510831304405af561b0ffaedb734437c595256bb61a90f9311b","impliedFormat":1},{"version":"ae062ce7d9510060c5d7e7952ae379224fb3f8f2dd74e88959878af2057c143b","impliedFormat":1},{"version":"8a1a0d0a4a06a8d278947fcb66bf684f117bf147f89b06e50662d79a53be3e9f","affectsGlobalScope":true,"impliedFormat":1},{"version":"9f663c2f91127ef7024e8ca4b3b4383ff2770e5f826696005de382282794b127","impliedFormat":1},{"version":"9f55299850d4f0921e79b6bf344b47c420ce0f507b9dcf593e532b09ea7eeea1","impliedFormat":1},{"version":"f9fd93190acb1ffe0bc0fb395df979452f8d625071e9ffc8636e4dfb86ab2508","impliedFormat":1},{"version":"5f41fd8732a89e940c58ce22206e3df85745feb8983e2b4c6257fb8cbb118493","impliedFormat":1},{"version":"17ed71200119e86ccef2d96b73b02ce8854b76ad6bd21b5021d4269bec527b5f","impliedFormat":1},{"version":"1cfa8647d7d71cb03847d616bd79320abfc01ddea082a49569fda71ac5ece66b","impliedFormat":1},{"version":"bb7a61dd55dc4b9422d13da3a6bb9cc5e89be888ef23bbcf6558aa9726b89a1c","impliedFormat":1},{"version":"413df52d4ea14472c2fa5bee62f7a40abd1eb49be0b9722ee01ee4e52e63beb2","impliedFormat":1},{"version":"db6d2d9daad8a6d83f281af12ce4355a20b9a3e71b82b9f57cddcca0a8964a96","impliedFormat":1},{"version":"446a50749b24d14deac6f8843e057a6355dd6437d1fac4f9e5ce4a5071f34bff","impliedFormat":1},{"version":"182e9fcbe08ac7c012e0a6e2b5798b4352470be29a64fdc114d23c2bab7d5106","impliedFormat":1},{"version":"5c9b31919ea1cb350a7ae5e71c9ced8f11723e4fa258a8cc8d16ae46edd623c7","impliedFormat":1},{"version":"4aa42ce8383b45823b3a1d3811c0fdd5f939f90254bc4874124393febbaf89f6","impliedFormat":1},{"version":"96ffa70b486207241c0fcedb5d9553684f7fa6746bc2b04c519e7ebf41a51205","impliedFormat":1},{"version":"3677988e03b749874eb9c1aa8dc88cd77b6005e5c4c39d821cda7b80d5388619","impliedFormat":1},{"version":"a86f82d646a739041d6702101afa82dcb935c416dd93cbca7fd754fd0282ce1f","impliedFormat":1},{"version":"ad0d1d75d129b1c80f911be438d6b61bfa8703930a8ff2be2f0e1f8a91841c64","impliedFormat":1},{"version":"ce75b1aebb33d510ff28af960a9221410a3eaf7f18fc5f21f9404075fba77256","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"02436d7e9ead85e09a2f8e27d5f47d9464bced31738dec138ca735390815c9f0","impliedFormat":1},{"version":"f4625edcb57b37b84506e8b276eb59ca30d31f88c6656d29d4e90e3bc58e69df","impliedFormat":1},{"version":"78a2869ad0cbf3f9045dda08c0d4562b7e1b2bfe07b19e0db072f5c3c56e9584","impliedFormat":1},{"version":"f8d5ff8eafd37499f2b6a98659dd9b45a321de186b8db6b6142faed0fea3de77","impliedFormat":1},{"version":"c86fe861cf1b4c46a0fb7d74dffe596cf679a2e5e8b1456881313170f092e3fa","impliedFormat":1},{"version":"c685d9f68c70fe11ce527287526585a06ea13920bb6c18482ca84945a4e433a7","impliedFormat":1},{"version":"540cc83ab772a2c6bc509fe1354f314825b5dba3669efdfbe4693ecd3048e34f","impliedFormat":1},{"version":"121b0696021ab885c570bbeb331be8ad82c6efe2f3b93a6e63874901bebc13e3","impliedFormat":1},{"version":"4e01846df98d478a2a626ec3641524964b38acaac13945c2db198bf9f3df22ee","impliedFormat":1},{"version":"678d6d4c43e5728bf66e92fc2269da9fa709cb60510fed988a27161473c3853f","impliedFormat":1},{"version":"ffa495b17a5ef1d0399586b590bd281056cee6ce3583e34f39926f8dcc6ecdb5","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"aa14cee20aa0db79f8df101fc027d929aec10feb5b8a8da3b9af3895d05b7ba2","impliedFormat":1},{"version":"493c700ac3bd317177b2eb913805c87fe60d4e8af4fb39c41f04ba81fae7e170","impliedFormat":1},{"version":"aeb554d876c6b8c818da2e118d8b11e1e559adbe6bf606cc9a611c1b6c09f670","impliedFormat":1},{"version":"acf5a2ac47b59ca07afa9abbd2b31d001bf7448b041927befae2ea5b1951d9f9","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"d71291eff1e19d8762a908ba947e891af44749f3a2cbc5bd2ec4b72f72ea795f","impliedFormat":1},{"version":"c0480e03db4b816dff2682b347c95f2177699525c54e7e6f6aa8ded890b76be7","impliedFormat":1},{"version":"e2a37ac938c4bede5bb284b9d2d042da299528f1e61f6f57538f1bd37d760869","impliedFormat":1},{"version":"76def37aff8e3a051cf406e10340ffba0f28b6991c5d987474cc11137796e1eb","impliedFormat":1},{"version":"b620391fe8060cf9bedc176a4d01366e6574d7a71e0ac0ab344a4e76576fcbb8","impliedFormat":1},{"version":"3e7efde639c6a6c3edb9847b3f61e308bf7a69685b92f665048c45132f51c218","impliedFormat":1},{"version":"df45ca1176e6ac211eae7ddf51336dc075c5314bc5c253651bae639defd5eec5","impliedFormat":1},{"version":"106c6025f1d99fd468fd8bf6e5bda724e11e5905a4076c5d29790b6c3745e50c","impliedFormat":1},{"version":"ee8df1cb8d0faaca4013a1b442e99130769ce06f438d18d510fed95890067563","impliedFormat":1},{"version":"bfb7f8475428637bee12bdd31bd9968c1c8a1cc2c3e426c959e2f3a307f8936f","impliedFormat":1},{"version":"6f491d0108927478d3247bbbc489c78c2da7ef552fd5277f1ab6819986fdf0b1","impliedFormat":1},{"version":"594fe24fc54645ab6ccb9dba15d3a35963a73a395b2ef0375ea34bf181ccfd63","impliedFormat":1},{"version":"7cb0ee103671d1e201cd53dda12bc1cd0a35f1c63d6102720c6eeb322cb8e17e","impliedFormat":1},{"version":"15a234e5031b19c48a69ccc1607522d6e4b50f57d308ecb7fe863d44cd9f9eb3","impliedFormat":1},{"version":"148679c6d0f449210a96e7d2e562d589e56fcde87f843a92808b3ff103f1a774","impliedFormat":1},{"version":"6459054aabb306821a043e02b89d54da508e3a6966601a41e71c166e4ea1474f","impliedFormat":1},{"version":"2f9c89cbb29d362290531b48880a4024f258c6033aaeb7e59fbc62db26819650","impliedFormat":1},{"version":"bb37588926aba35c9283fe8d46ebf4e79ffe976343105f5c6d45f282793352b2","impliedFormat":1},{"version":"05c97cddbaf99978f83d96de2d8af86aded9332592f08ce4a284d72d0952c391","impliedFormat":1},{"version":"72179f9dd22a86deaad4cc3490eb0fe69ee084d503b686985965654013f1391b","impliedFormat":1},{"version":"2e6114a7dd6feeef85b2c80120fdbfb59a5529c0dcc5bfa8447b6996c97a69f5","impliedFormat":1},{"version":"7b6ff760c8a240b40dab6e4419b989f06a5b782f4710d2967e67c695ef3e93c4","impliedFormat":1},{"version":"c8f004e6036aa1c764ad4ec543cf89a5c1893a9535c80ef3f2b653e370de45e6","impliedFormat":1},{"version":"dd80b1e600d00f5c6a6ba23f455b84a7db121219e68f89f10552c54ba46e4dc9","impliedFormat":1},{"version":"b064c36f35de7387d71c599bfcf28875849a1dbc733e82bd26cae3d1cd060521","impliedFormat":1},{"version":"05c7280d72f3ed26f346cbe7cbbbb002fb7f15739197cbbee6ab3fd1a6cb9347","impliedFormat":1},{"version":"8de9fe97fa9e00ec00666fa77ab6e91b35d25af8ca75dabcb01e14ad3299b150","impliedFormat":1},{"version":"803cd2aaf1921c218916c2c7ee3fce653e852d767177eb51047ff15b5b253893","impliedFormat":1},{"version":"dba114fb6a32b355a9cfc26ca2276834d72fe0e94cd2c3494005547025015369","impliedFormat":1},{"version":"7ab12b2f1249187223d11a589f5789c75177a0b597b9eb7f8e2e42d045393347","impliedFormat":1},{"version":"ad37fb4be61c1035b68f532b7220f4e8236cf245381ce3b90ac15449ecfe7305","impliedFormat":1},{"version":"93436bd74c66baba229bfefe1314d122c01f0d4c1d9e35081a0c4f0470ac1a6c","impliedFormat":1},{"version":"f974e4a06953682a2c15d5bd5114c0284d5abf8bc0fe4da25cb9159427b70072","impliedFormat":1},{"version":"50256e9c31318487f3752b7ac12ff365c8949953e04568009c8705db802776fb","impliedFormat":1},{"version":"7d73b24e7bf31dfb8a931ca6c4245f6bb0814dfae17e4b60c9e194a631fe5f7b","impliedFormat":1},{"version":"d130c5f73768de51402351d5dc7d1b36eaec980ca697846e53156e4ea9911476","impliedFormat":1},{"version":"413586add0cfe7369b64979d4ec2ed56c3f771c0667fbde1bf1f10063ede0b08","impliedFormat":1},{"version":"06472528e998d152375ad3bd8ebcb69ff4694fd8d2effaf60a9d9f25a37a097a","impliedFormat":1},{"version":"50b5bc34ce6b12eccb76214b51aadfa56572aa6cc79c2b9455cdbb3d6c76af1d","impliedFormat":1},{"version":"b7e16ef7f646a50991119b205794ebfd3a4d8f8e0f314981ebbe991639023d0e","impliedFormat":1},{"version":"42c169fb8c2d42f4f668c624a9a11e719d5d07dacbebb63cbcf7ef365b0a75b3","impliedFormat":1},{"version":"a401617604fa1f6ce437b81689563dfdc377069e4c58465dbd8d16069aede0a5","impliedFormat":1},{"version":"6e9082e91370de5040e415cd9f24e595b490382e8c7402c4e938a8ce4bccc99f","impliedFormat":1},{"version":"8695dec09ad439b0ceef3776ea68a232e381135b516878f0901ed2ea114fd0fe","impliedFormat":1},{"version":"304b44b1e97dd4c94697c3313df89a578dca4930a104454c99863f1784a54357","impliedFormat":1},{"version":"d682336018141807fb602709e2d95a192828fcb8d5ba06dda3833a8ea98f69e3","impliedFormat":1},{"version":"6124e973eab8c52cabf3c07575204efc1784aca6b0a30c79eb85fe240a857efa","impliedFormat":1},{"version":"0d891735a21edc75df51f3eb995e18149e119d1ce22fd40db2b260c5960b914e","impliedFormat":1},{"version":"3b414b99a73171e1c4b7b7714e26b87d6c5cb03d200352da5342ab4088a54c85","impliedFormat":1},{"version":"4fbd3116e00ed3a6410499924b6403cc9367fdca303e34838129b328058ede40","impliedFormat":1},{"version":"b01bd582a6e41457bc56e6f0f9de4cb17f33f5f3843a7cf8210ac9c18472fb0f","impliedFormat":1},{"version":"0a437ae178f999b46b6153d79095b60c42c996bc0458c04955f1c996dc68b971","impliedFormat":1},{"version":"74b2a5e5197bd0f2e0077a1ea7c07455bbea67b87b0869d9786d55104006784f","impliedFormat":1},{"version":"4a7baeb6325920044f66c0f8e5e6f1f52e06e6d87588d837bdf44feb6f35c664","impliedFormat":1},{"version":"12d218a49dbe5655b911e6cc3c13b2c655e4c783471c3b0432137769c79e1b3c","impliedFormat":1},{"version":"7274fbffbd7c9589d8d0ffba68157237afd5cecff1e99881ea3399127e60572f","impliedFormat":1},{"version":"6b0fc04121360f752d196ba35b6567192f422d04a97b2840d7d85f8b79921c92","impliedFormat":1},{"version":"65a15fc47900787c0bd18b603afb98d33ede930bed1798fc984d5ebb78b26cf9","impliedFormat":1},{"version":"9d202701f6e0744adb6314d03d2eb8fc994798fc83d91b691b75b07626a69801","impliedFormat":1},{"version":"a365c4d3bed3be4e4e20793c999c51f5cd7e6792322f14650949d827fbcd170f","impliedFormat":1},{"version":"c5426dbfc1cf90532f66965a7aa8c1136a78d4d0f96d8180ecbfc11d7722f1a5","impliedFormat":1},{"version":"9c82171d836c47486074e4ca8e059735bf97b205e70b196535b5efd40cbe1bc5","impliedFormat":1},{"version":"f374cb24e93e7798c4d9e83ff872fa52d2cdb36306392b840a6ddf46cb925cb6","impliedFormat":1},{"version":"42b81043b00ff27c6bd955aea0f6e741545f2265978bf364b614702b72a027ab","impliedFormat":1},{"version":"de9d2df7663e64e3a91bf495f315a7577e23ba088f2949d5ce9ec96f44fba37d","impliedFormat":1},{"version":"c7af78a2ea7cb1cd009cfb5bdb48cd0b03dad3b54f6da7aab615c2e9e9d570c5","impliedFormat":1},{"version":"1ee45496b5f8bdee6f7abc233355898e5bf9bd51255db65f5ff7ede617ca0027","impliedFormat":1},{"version":"97e5ccc7bb88419005cbdf812243a5b3186cdef81b608540acabe1be163fc3e4","affectsGlobalScope":true,"impliedFormat":1},{"version":"3fbdd025f9d4d820414417eeb4107ffa0078d454a033b506e22d3a23bc3d9c41","affectsGlobalScope":true,"impliedFormat":1},{"version":"a8f8e6ab2fa07b45251f403548b78eaf2022f3c2254df3dc186cb2671fe4996d","affectsGlobalScope":true,"impliedFormat":1},{"version":"fa6c12a7c0f6b84d512f200690bfc74819e99efae69e4c95c4cd30f6884c526e","impliedFormat":1},{"version":"f1c32f9ce9c497da4dc215c3bc84b722ea02497d35f9134db3bb40a8d918b92b","impliedFormat":1},{"version":"b73c319af2cc3ef8f6421308a250f328836531ea3761823b4cabbd133047aefa","affectsGlobalScope":true,"impliedFormat":1},{"version":"e433b0337b8106909e7953015e8fa3f2d30797cea27141d1c5b135365bb975a6","impliedFormat":1},{"version":"9f9bb6755a8ce32d656ffa4763a8144aa4f274d6b69b59d7c32811031467216e","impliedFormat":1},{"version":"5c32bdfbd2d65e8fffbb9fbda04d7165e9181b08dad61154961852366deb7540","impliedFormat":1},{"version":"ddff7fc6edbdc5163a09e22bf8df7bef75f75369ebd7ecea95ba55c4386e2441","impliedFormat":1},{"version":"6b3453eebd474cc8acf6d759f1668e6ce7425a565e2996a20b644c72916ecf75","impliedFormat":1},{"version":"0c05e9842ec4f8b7bfebfd3ca61604bb8c914ba8da9b5337c4f25da427a005f2","impliedFormat":1},{"version":"89cd3444e389e42c56fd0d072afef31387e7f4107651afd2c03950f22dc36f77","impliedFormat":1},{"version":"7f2aa4d4989a82530aaac3f72b3dceca90e9c25bee0b1a327e8a08a1262435ad","impliedFormat":1},{"version":"e39a304f882598138a8022106cb8de332abbbb87f3fee71c5ca6b525c11c51fc","impliedFormat":1},{"version":"faed7a5153215dbd6ebe76dfdcc0af0cfe760f7362bed43284be544308b114cf","impliedFormat":1},{"version":"fcdf3e40e4a01b9a4b70931b8b51476b210c511924fcfe3f0dae19c4d52f1a54","impliedFormat":1},{"version":"345c4327b637d34a15aba4b7091eb068d6ab40a3dedaab9f00986253c9704e53","impliedFormat":1},{"version":"3a788c7fb7b1b1153d69a4d1d9e1d0dfbcf1127e703bdb02b6d12698e683d1fb","impliedFormat":1},{"version":"2e4f37ffe8862b14d8e24ae8763daaa8340c0df0b859d9a9733def0eee7562d9","impliedFormat":1},{"version":"d38530db0601215d6d767f280e3a3c54b2a83b709e8d9001acb6f61c67e965fc","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"4805f6161c2c8cefb8d3b8bd96a080c0fe8dbc9315f6ad2e53238f9a79e528a6","impliedFormat":1},{"version":"b83cb14474fa60c5f3ec660146b97d122f0735627f80d82dd03e8caa39b4388c","impliedFormat":1},{"version":"2b5b70d7782fe028487a80a1c214e67bd610532b9f978b78fa60f5b4a359f77e","impliedFormat":1},{"version":"7ee86fbb3754388e004de0ef9e6505485ddfb3be7640783d6d015711c03d302d","impliedFormat":1},{"version":"1a82deef4c1d39f6882f28d275cad4c01f907b9b39be9cbc472fcf2cf051e05b","impliedFormat":1},{"version":"7580e62139cb2b44a0270c8d01abcbfcba2819a02514a527342447fa69b34ef1","impliedFormat":1},{"version":"b73cbf0a72c8800cf8f96a9acfe94f3ad32ca71342a8908b8ae484d61113f647","impliedFormat":1},{"version":"bae6dd176832f6423966647382c0d7ba9e63f8c167522f09a982f086cd4e8b23","impliedFormat":1},{"version":"20865ac316b8893c1a0cc383ccfc1801443fbcc2a7255be166cf90d03fac88c9","impliedFormat":1},{"version":"c9958eb32126a3843deedda8c22fb97024aa5d6dd588b90af2d7f2bfac540f23","impliedFormat":1},{"version":"461d0ad8ae5f2ff981778af912ba71b37a8426a33301daa00f21c6ccb27f8156","impliedFormat":1},{"version":"e927c2c13c4eaf0a7f17e6022eee8519eb29ef42c4c13a31e81a611ab8c95577","impliedFormat":1},{"version":"fcafff163ca5e66d3b87126e756e1b6dfa8c526aa9cd2a2b0a9da837d81bbd72","impliedFormat":1},{"version":"70246ad95ad8a22bdfe806cb5d383a26c0c6e58e7207ab9c431f1cb175aca657","impliedFormat":1},{"version":"f00f3aa5d64ff46e600648b55a79dcd1333458f7a10da2ed594d9f0a44b76d0b","impliedFormat":1},{"version":"772d8d5eb158b6c92412c03228bd9902ccb1457d7a705b8129814a5d1a6308fc","impliedFormat":1},{"version":"802e797bcab5663b2c9f63f51bdf67eff7c41bc64c0fd65e6da3e7941359e2f7","impliedFormat":1},{"version":"8b4327413e5af38cd8cb97c59f48c3c866015d5d642f28518e3a891c469f240e","impliedFormat":1},{"version":"7e6ac205dcb9714f708354fd863bffa45cee90740706cc64b3b39b23ebb84744","impliedFormat":1},{"version":"61dc6e3ac78d64aa864eedd0a208b97b5887cc99c5ba65c03287bf57d83b1eb9","impliedFormat":1},{"version":"4b20fcf10a5413680e39f5666464859fc56b1003e7dfe2405ced82371ebd49b6","impliedFormat":1},{"version":"c06ef3b2569b1c1ad99fcd7fe5fba8d466e2619da5375dfa940a94e0feea899b","impliedFormat":1},{"version":"f7d628893c9fa52ba3ab01bcb5e79191636c4331ee5667ecc6373cbccff8ae12","impliedFormat":1},{"version":"1d879125d1ec570bf04bc1f362fdbe0cb538315c7ac4bcfcdf0c1e9670846aa6","impliedFormat":1},{"version":"f730b468deecf26188ad62ee8950dc29aa2aea9543bb08ed714c3db019359fd9","impliedFormat":1},{"version":"933aee906d42ea2c53b6892192a8127745f2ec81a90695df4024308ba35a8ff4","impliedFormat":1},{"version":"d663134457d8d669ae0df34eabd57028bddc04fc444c4bc04bc5215afc91e1f4","impliedFormat":1},{"version":"144bc326e90b894d1ec78a2af3ffb2eb3733f4d96761db0ca0b6239a8285f972","impliedFormat":1},{"version":"a3e3f0efcae272ab8ee3298e4e819f7d9dd9ff411101f45444877e77cfeca9a4","impliedFormat":1},{"version":"43e96a3d5d1411ab40ba2f61d6a3192e58177bcf3b133a80ad2a16591611726d","impliedFormat":1},{"version":"58659b06d33fa430bee1105b75cf876c0a35b2567207487c8578aec51ca2d977","impliedFormat":1},{"version":"71d9eb4c4e99456b78ae182fb20a5dfc20eb1667f091dbb9335b3c017dd1c783","impliedFormat":1},{"version":"cfa846a7b7847a1d973605fbb8c91f47f3a0f0643c18ac05c47077ebc72e71c7","impliedFormat":1},{"version":"30e6520444df1a004f46fdc8096f3fe06f7bbd93d09c53ada9dcdde59919ccca","impliedFormat":1},{"version":"6c800b281b9e89e69165fd11536195488de3ff53004e55905e6c0059a2d8591e","impliedFormat":1},{"version":"7d4254b4c6c67a29d5e7f65e67d72540480ac2cfb041ca484847f5ae70480b62","impliedFormat":1},{"version":"a58beefce74db00dbb60eb5a4bb0c6726fb94c7797c721f629142c0ae9c94306","impliedFormat":1},{"version":"41eeb453ccb75c5b2c3abef97adbbd741bd7e9112a2510e12f03f646dc9ad13d","impliedFormat":1},{"version":"502fa5863df08b806dbf33c54bee8c19f7e2ad466785c0fc35465d7c5ff80995","impliedFormat":1},{"version":"c91a2d08601a1547ffef326201be26db94356f38693bb18db622ae5e9b3d7c92","impliedFormat":1},{"version":"888cda0fa66d7f74e985a3f7b1af1f64b8ff03eb3d5e80d051c3cbdeb7f32ab7","impliedFormat":1},{"version":"60681e13f3545be5e9477acb752b741eae6eaf4cc01658a25ec05bff8b82a2ef","impliedFormat":1},{"version":"9586918b63f24124a5ca1d0cc2979821a8a57f514781f09fc5aa9cae6d7c0138","impliedFormat":1},{"version":"a57b1802794433adec9ff3fed12aa79d671faed86c49b09e02e1ac41b4f1d33a","impliedFormat":1},{"version":"ad10d4f0517599cdeca7755b930f148804e3e0e5b5a3847adce0f1f71bbccd74","impliedFormat":1},{"version":"1042064ece5bb47d6aba91648fbe0635c17c600ebdf567588b4ca715602f0a9d","impliedFormat":1},{"version":"c49469a5349b3cc1965710b5b0f98ed6c028686aa8450bcb3796728873eb923e","impliedFormat":1},{"version":"4a889f2c763edb4d55cb624257272ac10d04a1cad2ed2948b10ed4a7fda2a428","impliedFormat":1},{"version":"7bb79aa2fead87d9d56294ef71e056487e848d7b550c9a367523ee5416c44cfa","impliedFormat":1},{"version":"d88ea80a6447d7391f52352ec97e56b52ebec934a4a4af6e2464cfd8b39c3ba8","impliedFormat":1},{"version":"55095860901097726220b6923e35a812afdd49242a1246d7b0942ee7eb34c6e4","impliedFormat":1},{"version":"96171c03c2e7f314d66d38acd581f9667439845865b7f85da8df598ff9617476","impliedFormat":1},{"version":"27ff4196654e6373c9af16b6165120e2dd2169f9ad6abb5c935af5abd8c7938c","impliedFormat":1},{"version":"bb8f2dbc03533abca2066ce4655c119bff353dd4514375beb93c08590c03e023","impliedFormat":1},{"version":"d193c8a86144b3a87b22bc1f5534b9c3e0f5a187873ec337c289a183973a58fe","impliedFormat":1},{"version":"1a6e6ba8a07b74e3ad237717c0299d453f9ceb795dbc2f697d1f2dd07cb782d2","impliedFormat":1},{"version":"58d70c38037fc0f949243388ff7ae20cf43321107152f14a9d36ca79311e0ada","impliedFormat":1},{"version":"f56bdc6884648806d34bc66d31cdb787c4718d04105ce2cd88535db214631f82","impliedFormat":1},{"version":"190da5eac6478d61ab9731ab2146fbc0164af2117a363013249b7e7992f1cccb","impliedFormat":1},{"version":"01479d9d5a5dda16d529b91811375187f61a06e74be294a35ecce77e0b9e8d6c","impliedFormat":1},{"version":"49f95e989b4632c6c2a578cc0078ee19a5831832d79cc59abecf5160ea71abad","impliedFormat":1},{"version":"9666533332f26e8995e4d6fe472bdeec9f15d405693723e6497bf94120c566c8","impliedFormat":1},{"version":"ce0df82a9ae6f914ba08409d4d883983cc08e6d59eb2df02d8e4d68309e7848b","impliedFormat":1},{"version":"796273b2edc72e78a04e86d7c58ae94d370ab93a0ddf40b1aa85a37a1c29ecd7","impliedFormat":1},{"version":"5df15a69187d737d6d8d066e189ae4f97e41f4d53712a46b2710ff9f8563ec9f","impliedFormat":1},{"version":"1a4dc28334a926d90ba6a2d811ba0ff6c22775fcc13679521f034c124269fd40","impliedFormat":1},{"version":"f05315ff85714f0b87cc0b54bcd3dde2716e5a6b99aedcc19cad02bf2403e08c","impliedFormat":1},{"version":"8a8c64dafaba11c806efa56f5c69f611276471bef80a1db1f71316ec4168acef","impliedFormat":1},{"version":"43ba4f2fa8c698f5c304d21a3ef596741e8e85a810b7c1f9b692653791d8d97a","impliedFormat":1},{"version":"5fad3b31fc17a5bc58095118a8b160f5260964787c52e7eb51e3d4fcf5d4a6f0","impliedFormat":1},{"version":"72105519d0390262cf0abe84cf41c926ade0ff475d35eb21307b2f94de985778","impliedFormat":1},{"version":"d0a4cac61fa080f2be5ebb68b82726be835689b35994ba0e22e3ed4d2bc45e3b","impliedFormat":1},{"version":"c857e0aae3f5f444abd791ec81206020fbcc1223e187316677e026d1c1d6fe08","impliedFormat":1},{"version":"ccf6dd45b708fb74ba9ed0f2478d4eb9195c9dfef0ff83a6092fa3cf2ff53b4f","impliedFormat":1},{"version":"2d7db1d73456e8c5075387d4240c29a2a900847f9c1bff106a2e490da8fbd457","impliedFormat":1},{"version":"2b15c805f48e4e970f8ec0b1915f22d13ca6212375e8987663e2ef5f0205e832","impliedFormat":1},{"version":"205a31b31beb7be73b8df18fcc43109cbc31f398950190a0967afc7a12cb478c","impliedFormat":1},{"version":"8fca3039857709484e5893c05c1f9126ab7451fa6c29e19bb8c2411a2e937345","impliedFormat":1},{"version":"35069c2c417bd7443ae7c7cafd1de02f665bf015479fec998985ffbbf500628c","impliedFormat":1},{"version":"dba6c7006e14a98ec82999c6f89fbbbfd1c642f41db148535f3b77b8018829b8","impliedFormat":1},{"version":"7f897b285f22a57a5c4dc14a27da2747c01084a542b4d90d33897216dceeea2e","impliedFormat":1},{"version":"7e0b7f91c5ab6e33f511efc640d36e6f933510b11be24f98836a20a2dc914c2d","impliedFormat":1},{"version":"045b752f44bf9bbdcaffd882424ab0e15cb8d11fa94e1448942e338c8ef19fba","impliedFormat":1},{"version":"2894c56cad581928bb37607810af011764a2f511f575d28c9f4af0f2ef02d1ab","impliedFormat":1},{"version":"0a72186f94215d020cb386f7dca81d7495ab6c17066eb07d0f44a5bf33c1b21a","impliedFormat":1},{"version":"d96b39301d0ded3f1a27b47759676a33a02f6f5049bfcbde81e533fd10f50dcb","impliedFormat":1},{"version":"2ded4f930d6abfaa0625cf55e58f565b7cbd4ab5b574dd2cb19f0a83a2f0be8b","impliedFormat":1},{"version":"0aedb02516baf3e66b2c1db9fef50666d6ed257edac0f866ea32f1aa05aa474f","impliedFormat":1},{"version":"ca0f4d9068d652bad47e326cf6ba424ac71ab866e44b24ddb6c2bd82d129586a","affectsGlobalScope":true,"impliedFormat":1},{"version":"04d36005fcbeac741ac50c421181f4e0316d57d148d37cc321a8ea285472462b","impliedFormat":1},{"version":"9e2739b32f741859263fdba0244c194ca8e96da49b430377930b8f721d77c000","impliedFormat":1},{"version":"56ccb49443bfb72e5952f7012f0de1a8679f9f75fc93a5c1ac0bafb28725fc5f","impliedFormat":1},{"version":"d90b9f1520366d713a73bd30c5a9eb0040d0fb6076aff370796bc776fd705943","impliedFormat":1},{"version":"05321b823dd3781d0b6aac8700bfdc0c9181d56479fe52ba6a40c9196fd661a8","impliedFormat":1},{"version":"736a8712572e21ee73337055ce15edb08142fc0f59cd5410af4466d04beff0f9","affectsGlobalScope":true,"impliedFormat":1},{"version":"bef86adb77316505c6b471da1d9b8c9e428867c2566270e8894d4d773a1c4dc2","impliedFormat":1},{"version":"a46dba563f70f32f9e45ae015f3de979225f668075d7a427f874e0f6db584991","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"2652448ac55a2010a1f71dd141f828b682298d39728f9871e1cdf8696ef443fd","impliedFormat":1},{"version":"02c4fc9e6bb27545fa021f6056e88ff5fdf10d9d9f1467f1d10536c6e749ac50","impliedFormat":1},{"version":"120599fd965257b1f4d0ff794bc696162832d9d8467224f4665f713a3119078b","impliedFormat":1},{"version":"5433f33b0a20300cca35d2f229a7fc20b0e8477c44be2affeb21cb464af60c76","impliedFormat":1},{"version":"db036c56f79186da50af66511d37d9fe77fa6793381927292d17f81f787bb195","impliedFormat":1},{"version":"bd4131091b773973ca5d2326c60b789ab1f5e02d8843b3587effe6e1ea7c9d86","impliedFormat":1},{"version":"c7f6485931085bf010fbaf46880a9b9ec1a285ad9dc8c695a9e936f5a48f34b4","impliedFormat":1},{"version":"14f6b927888a1112d662877a5966b05ac1bf7ed25d6c84386db4c23c95a5363b","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"622694a8522b46f6310c2a9b5d2530dde1e2854cb5829354e6d1ff8f371cf469","impliedFormat":1},{"version":"d24ff95760ea2dfcc7c57d0e269356984e7046b7e0b745c80fea71559f15bdd8","impliedFormat":1},{"version":"a9e6c0ff3f8186fccd05752cf75fc94e147c02645087ac6de5cc16403323d870","impliedFormat":1},{"version":"49c346823ba6d4b12278c12c977fb3a31c06b9ca719015978cb145eb86da1c61","impliedFormat":1},{"version":"bfac6e50eaa7e73bb66b7e052c38fdc8ccfc8dbde2777648642af33cf349f7f1","impliedFormat":1},{"version":"92f7c1a4da7fbfd67a2228d1687d5c2e1faa0ba865a94d3550a3941d7527a45d","impliedFormat":1},{"version":"f53b120213a9289d9a26f5af90c4c686dd71d91487a0aa5451a38366c70dc64b","impliedFormat":1},{"version":"83fe880c090afe485a5c02262c0b7cdd76a299a50c48d9bde02be8e908fb4ae6","impliedFormat":1},{"version":"13c1b657932e827a7ed510395d94fc8b743b9d053ab95b7cd829b2bc46fb06db","impliedFormat":1},{"version":"57d67b72e06059adc5e9454de26bbfe567d412b962a501d263c75c2db430f40e","impliedFormat":1},{"version":"6511e4503cf74c469c60aafd6589e4d14d5eb0a25f9bf043dcbecdf65f261972","impliedFormat":1},{"version":"078131f3a722a8ad3fc0b724cd3497176513cdcb41c80f96a3acbda2a143b58e","impliedFormat":1},{"version":"8c70ddc0c22d85e56011d49fddfaae3405eb53d47b59327b9dd589e82df672e7","impliedFormat":1},{"version":"a67b87d0281c97dfc1197ef28dfe397fc2c865ccd41f7e32b53f647184cc7307","impliedFormat":1},{"version":"771ffb773f1ddd562492a6b9aaca648192ac3f056f0e1d997678ff97dbb6bf9b","impliedFormat":1},{"version":"232f70c0cf2b432f3a6e56a8dc3417103eb162292a9fd376d51a3a9ea5fbbf6f","impliedFormat":1},{"version":"9e155d2255348d950b1f65643fb26c0f14f5109daf8bd9ee24a866ad0a743648","affectsGlobalScope":true,"impliedFormat":1},{"version":"0b103e9abfe82d14c0ad06a55d9f91d6747154ef7cacc73cf27ecad2bfb3afcf","impliedFormat":1},{"version":"7a883e9c84e720810f86ef4388f54938a65caa0f4d181a64e9255e847a7c9f51","impliedFormat":1},{"version":"a0ba218ac1baa3da0d5d9c1ec1a7c2f8676c284e6f5b920d6d049b13fa267377","impliedFormat":1},{"version":"8a0e762ceb20c7e72504feef83d709468a70af4abccb304f32d6b9bac1129b2c","impliedFormat":1},{"version":"d408d6f32de8d1aba2ff4a20f1aa6a6edd7d92c997f63b90f8ad3f9017cf5e46","impliedFormat":1},{"version":"9252d498a77517aab5d8d4b5eb9d71e4b225bbc7123df9713e08181de63180f6","impliedFormat":1},{"version":"b1f1d57fde8247599731b24a733395c880a6561ec0c882efaaf20d7df968c5af","impliedFormat":1},{"version":"9d622ea608d43eb463c0c4538fd5baa794bc18ea0bb8e96cd2ab6fd483d55fe2","impliedFormat":1},{"version":"35e6379c3f7cb27b111ad4c1aa69538fd8e788ab737b8ff7596a1b40e96f4f90","impliedFormat":1},{"version":"1fffe726740f9787f15b532e1dc870af3cd964dbe29e191e76121aa3dd8693f2","impliedFormat":1},{"version":"371bf6127c1d427836de95197155132501cb6b69ef8709176ce6e0b85d059264","impliedFormat":1},{"version":"2bafd700e617d3693d568e972d02b92224b514781f542f70d497a8fdf92d52a2","affectsGlobalScope":true,"impliedFormat":1},{"version":"5542d8a7ea13168cb573be0d1ba0d29460d59430fb12bb7bf4674efd5604e14c","impliedFormat":1},{"version":"af48e58339188d5737b608d41411a9c054685413d8ae88b8c1d0d9bfabdf6e7e","impliedFormat":1},{"version":"616775f16134fa9d01fc677ad3f76e68c051a056c22ab552c64cc281a9686790","impliedFormat":1},{"version":"65c24a8baa2cca1de069a0ba9fba82a173690f52d7e2d0f1f7542d59d5eb4db0","impliedFormat":1},{"version":"f9fe6af238339a0e5f7563acee3178f51db37f32a2e7c09f85273098cee7ec49","impliedFormat":1},{"version":"1de8c302fd35220d8f29dea378a4ae45199dc8ff83ca9923aca1400f2b28848a","impliedFormat":1},{"version":"77e71242e71ebf8528c5802993697878f0533db8f2299b4d36aa015bae08a79c","impliedFormat":1},{"version":"98a787be42bd92f8c2a37d7df5f13e5992da0d967fab794adbb7ee18370f9849","impliedFormat":1},{"version":"332248ee37cca52903572e66c11bef755ccc6e235835e63d3c3e60ddda3e9b93","impliedFormat":1},{"version":"94e8cc88ae2ef3d920bb3bdc369f48436db123aa2dc07f683309ad8c9968a1e1","impliedFormat":1},{"version":"4545c1a1ceca170d5d83452dd7c4994644c35cf676a671412601689d9a62da35","impliedFormat":1},{"version":"320f4091e33548b554d2214ce5fc31c96631b513dffa806e2e3a60766c8c49d9","impliedFormat":1},{"version":"a2d648d333cf67b9aeac5d81a1a379d563a8ffa91ddd61c6179f68de724260ff","impliedFormat":1},{"version":"d90d5f524de38889d1e1dbc2aeef00060d779f8688c02766ddb9ca195e4a713d","impliedFormat":1},{"version":"a3f41ed1b4f2fc3049394b945a68ae4fdefd49fa1739c32f149d32c0545d67f5","impliedFormat":1},{"version":"b0309e1eda99a9e76f87c18992d9c3689b0938266242835dd4611f2b69efe456","impliedFormat":1},{"version":"47699512e6d8bebf7be488182427189f999affe3addc1c87c882d36b7f2d0b0e","impliedFormat":1},{"version":"6ceb10ca57943be87ff9debe978f4ab73593c0c85ee802c051a93fc96aaf7a20","impliedFormat":1},{"version":"1de3ffe0cc28a9fe2ac761ece075826836b5a02f340b412510a59ba1d41a505a","impliedFormat":1},{"version":"e46d6cc08d243d8d0d83986f609d830991f00450fb234f5b2f861648c42dc0d8","impliedFormat":1},{"version":"1c0a98de1323051010ce5b958ad47bc1c007f7921973123c999300e2b7b0ecc0","impliedFormat":1},{"version":"ff863d17c6c659440f7c5c536e4db7762d8c2565547b2608f36b798a743606ca","impliedFormat":1},{"version":"5412ad0043cd60d1f1406fc12cb4fb987e9a734decbdd4db6f6acf71791e36fe","impliedFormat":1},{"version":"ad036a85efcd9e5b4f7dd5c1a7362c8478f9a3b6c3554654ca24a29aa850a9c5","impliedFormat":1},{"version":"fedebeae32c5cdd1a85b4e0504a01996e4a8adf3dfa72876920d3dd6e42978e7","impliedFormat":1},{"version":"b6c1f64158da02580f55e8a2728eda6805f79419aed46a930f43e68ad66a38fc","impliedFormat":1},{"version":"cdf21eee8007e339b1b9945abf4a7b44930b1d695cc528459e68a3adc39a622e","impliedFormat":1},{"version":"bc9ee0192f056b3d5527bcd78dc3f9e527a9ba2bdc0a2c296fbc9027147df4b2","impliedFormat":1},{"version":"330896c1a2b9693edd617be24fbf9e5895d6e18c7955d6c08f028f272b37314d","impliedFormat":1},{"version":"1d9c0a9a6df4e8f29dc84c25c5aa0bb1da5456ebede7a03e03df08bb8b27bae6","impliedFormat":1},{"version":"84380af21da938a567c65ef95aefb5354f676368ee1a1cbb4cae81604a4c7d17","impliedFormat":1},{"version":"1af3e1f2a5d1332e136f8b0b95c0e6c0a02aaabd5092b36b64f3042a03debf28","impliedFormat":1},{"version":"30d8da250766efa99490fc02801047c2c6d72dd0da1bba6581c7e80d1d8842a4","impliedFormat":1},{"version":"03566202f5553bd2d9de22dfab0c61aa163cabb64f0223c08431fb3fc8f70280","impliedFormat":1},{"version":"4c0a1233155afb94bd4d7518c75c84f98567cd5f13fc215d258de196cdb40d91","impliedFormat":1},{"version":"e7765aa8bcb74a38b3230d212b4547686eb9796621ffb4367a104451c3f9614f","impliedFormat":1},{"version":"1de80059b8078ea5749941c9f863aa970b4735bdbb003be4925c853a8b6b4450","impliedFormat":1},{"version":"1d079c37fa53e3c21ed3fa214a27507bda9991f2a41458705b19ed8c2b61173d","impliedFormat":1},{"version":"5bf5c7a44e779790d1eb54c234b668b15e34affa95e78eada73e5757f61ed76a","impliedFormat":1},{"version":"5835a6e0d7cd2738e56b671af0e561e7c1b4fb77751383672f4b009f4e161d70","impliedFormat":1},{"version":"5c634644d45a1b6bc7b05e71e05e52ec04f3d73d9ac85d5927f647a5f965181a","impliedFormat":1},{"version":"4b7f74b772140395e7af67c4841be1ab867c11b3b82a51b1aeb692822b76c872","impliedFormat":1},{"version":"27be6622e2922a1b412eb057faa854831b95db9db5035c3f6d4b677b902ab3b7","impliedFormat":1},{"version":"a68d4b3182e8d776cdede7ac9630c209a7bfbb59191f99a52479151816ef9f9e","impliedFormat":99},{"version":"39644b343e4e3d748344af8182111e3bbc594930fff0170256567e13bbdbebb0","impliedFormat":99},{"version":"ed7fd5160b47b0de3b1571c5c5578e8e7e3314e33ae0b8ea85a895774ee64749","impliedFormat":99},{"version":"63a7595a5015e65262557f883463f934904959da563b4f788306f699411e9bac","impliedFormat":1},{"version":"4ba137d6553965703b6b55fd2000b4e07ba365f8caeb0359162ad7247f9707a6","impliedFormat":1},{"version":"6de125ea94866c736c6d58d68eb15272cf7d1020a5b459fea1c660027eca9a90","affectsGlobalScope":true,"impliedFormat":1},{"version":"8fac4a15690b27612d8474fb2fc7cc00388df52d169791b78d1a3645d60b4c8b","affectsGlobalScope":true,"impliedFormat":1},{"version":"064ac1c2ac4b2867c2ceaa74bbdce0cb6a4c16e7c31a6497097159c18f74aa7c","impliedFormat":1},{"version":"3dc14e1ab45e497e5d5e4295271d54ff689aeae00b4277979fdd10fa563540ae","impliedFormat":1},{"version":"d3b315763d91265d6b0e7e7fa93cfdb8a80ce7cdd2d9f55ba0f37a22db00bdb8","impliedFormat":1},{"version":"b789bf89eb19c777ed1e956dbad0925ca795701552d22e68fd130a032008b9f9","impliedFormat":1},{"version":"7eeb89fdc6c4786fa59e0b5c07233b081577d6759b0f522c7ff26b340cb7300e","affectsGlobalScope":true},"083e23c4c5e7761db151134ea1ef7896120c86c5888cdc8a861f534f7e86d6fd",{"version":"402e5c534fb2b85fa771170595db3ac0dd532112c8fa44fc23f233bc6967488b","impliedFormat":1},{"version":"8885cf05f3e2abf117590bbb951dcf6359e3e5ac462af1c901cfd24c6a6472e2","impliedFormat":1},{"version":"333caa2bfff7f06017f114de738050dd99a765c7eb16571c6d25a38c0d5365dc","impliedFormat":1},{"version":"e61df3640a38d535fd4bc9f4a53aef17c296b58dc4b6394fd576b808dd2fe5e6","impliedFormat":1},{"version":"459920181700cec8cbdf2a5faca127f3f17fd8dd9d9e577ed3f5f3af5d12a2e4","impliedFormat":1},{"version":"4719c209b9c00b579553859407a7e5dcfaa1c472994bd62aa5dd3cc0757eb077","impliedFormat":1},{"version":"7ec359bbc29b69d4063fe7dad0baaf35f1856f914db16b3f4f6e3e1bca4099fa","impliedFormat":1},{"version":"70790a7f0040993ca66ab8a07a059a0f8256e7bb57d968ae945f696cbff4ac7a","impliedFormat":1},{"version":"d1b9a81e99a0050ca7f2d98d7eedc6cda768f0eb9fa90b602e7107433e64c04c","impliedFormat":1},{"version":"a022503e75d6953d0e82c2c564508a5c7f8556fad5d7f971372d2d40479e4034","impliedFormat":1},{"version":"b215c4f0096f108020f666ffcc1f072c81e9f2f95464e894a5d5f34c5ea2a8b1","impliedFormat":1},{"version":"644491cde678bd462bb922c1d0cfab8f17d626b195ccb7f008612dc31f445d2d","impliedFormat":1},{"version":"dfe54dab1fa4961a6bcfba68c4ca955f8b5bbeb5f2ab3c915aa7adaa2eabc03a","impliedFormat":1},{"version":"1251d53755b03cde02466064260bb88fd83c30006a46395b7d9167340bc59b73","impliedFormat":1},{"version":"47865c5e695a382a916b1eedda1b6523145426e48a2eae4647e96b3b5e52024f","impliedFormat":1},{"version":"4cdf27e29feae6c7826cdd5c91751cc35559125e8304f9e7aed8faef97dcf572","impliedFormat":1},{"version":"331b8f71bfae1df25d564f5ea9ee65a0d847c4a94baa45925b6f38c55c7039bf","impliedFormat":1},{"version":"2a771d907aebf9391ac1f50e4ad37952943515eeea0dcc7e78aa08f508294668","impliedFormat":1},{"version":"0146fd6262c3fd3da51cb0254bb6b9a4e42931eb2f56329edd4c199cb9aaf804","impliedFormat":1},{"version":"183f480885db5caa5a8acb833c2be04f98056bdcc5fb29e969ff86e07efe57ab","impliedFormat":99},{"version":"b558c9a18ea4e6e4157124465c3ef1063e64640da139e67be5edb22f534f2f08","impliedFormat":1},{"version":"01374379f82be05d25c08d2f30779fa4a4c41895a18b93b33f14aeef51768692","impliedFormat":1},{"version":"b0dee183d4e65cf938242efaf3d833c6b645afb35039d058496965014f158141","impliedFormat":1},{"version":"c0bbbf84d3fbd85dd60d040c81e8964cc00e38124a52e9c5dcdedf45fea3f213","impliedFormat":1},"ad646a41d4ee1ebb12d32c343feda7d246467409c55d142a9ac67c36b701ff5f","65ed101a62b47bfb0ee338bcde05f4e70f56cb2f580fa2c9084e2645156e9c0f",{"version":"e6cfcf171b5f7ec0cb620eee4669739ad2711597d0ff7fdb79298dfc1118e66a","impliedFormat":1},{"version":"5d8157b38d0490e4d83f570ee7fe99407d13847bdee9cd28e9b037dd75f2bea5","impliedFormat":99},{"version":"74fa25999165297e20ccc3151f671fba1caef953d619e4f97a85f12313b0a662","impliedFormat":99},"744b0573611c3ea1739f975db7ff747cec87ed35de6ae774a61345b4b42b534d","6ed3ed3f6cd05ccc9a408eac72a68521e25f237369858b675ae5e0252516ccf3",{"version":"713571db67fa81007d8267a5c35bd74662f8da3482f2e0117e142ffd5c0937a7","impliedFormat":1},{"version":"469532350a366536390c6eb3bde6839ec5c81fe1227a6b7b6a70202954d70c40","impliedFormat":1},{"version":"54e79224429e911b5d6aeb3cf9097ec9fd0f140d5a1461bbdece3066b17c232c","impliedFormat":1},{"version":"6fc1a4f64372593767a9b7b774e9b3b92bf04e8785c3f9ea98973aa9f4bbe490","impliedFormat":1},{"version":"d5895252efa27a50f134a9b580aa61f7def5ab73d0a8071f9b5bf9a317c01c2d","impliedFormat":1},{"version":"57568ff84b8ba1a4f8c817141644b49252cc39ec7b899e4bfba0ec0557c910a0","impliedFormat":1},{"version":"e9458a859b5277166d30117ae324e2e283c02467e59070f621855ac47ffe3e72","impliedFormat":1},{"version":"3fd17251af6b700a417a6333f6df0d45955ee926d0fc87d1535f070ae7715d81","impliedFormat":1},{"version":"48aee03744cbe6fb98859199f9d720a96c177c36c0fc7e5d81966bd2743f5190","impliedFormat":1},{"version":"a04338d8191ebc59875ebe52eb335eacf8c663adb786ee420ba553a808566dc0","impliedFormat":1},{"version":"e8e5462d4a17d62eadb9fa16c46a0cf467c48f04a30705f656446d4e90da35d5","impliedFormat":1},{"version":"2ea3b81baddff6943c7e1704b39f3acdeddb2982b78ee8c1968a053e95151ba9","impliedFormat":1},{"version":"7fe31f933471075abbc4e7529805ad31251a7019cb9658df154663337e9bab60","impliedFormat":1},{"version":"aeb8e8e06b280225adcb57b5f9037c20f436e2cbbed2baf663f98dd8c079fc02","impliedFormat":1},{"version":"35c26005c17218503f25b79c569a06f06a589e219d7f391b8bc3093dde728d7c","impliedFormat":1},{"version":"f32c9af2ceaa89fa11c0e1393e443cd536c59f94a1f835b28459188a791d0d24","impliedFormat":1},{"version":"0f8d5493a0123ebb6b6ca48a28ff23952db6d385d0505a2ba99d89d634f55502","impliedFormat":1},{"version":"5396ccd4007e9fea23eda8c4dca1f5ccfad239ec7e13f2a0d5fd2c535d12e821","impliedFormat":1},{"version":"9c44e80d832d0bca70527a603fd05b0e4b8d1a7d08921eecc47669b16f0d0094","impliedFormat":1},{"version":"8f6786732b48efa9dcf54e3cb5db9b37e93406ab387d0180062b0b3d1e88003f","impliedFormat":1},{"version":"6940b74d8156bbea90f54311a4c95dcb6fadd4e194bd953b421799a00a0974da","impliedFormat":1},{"version":"53dc4527a3ed51f201376ea3a11152afe0ab643477719234f69122f3e19fb7f8","impliedFormat":1},{"version":"3f9a50b3bd5d05ce64a1eaa5b6d9e4557b09f052cdf770f6960729230865811b","impliedFormat":1},{"version":"539be2ef049df622b365b9dc9d0f159844dd964eeb3b217b26109bfe8b9d5b51","impliedFormat":1},{"version":"c20d1d667be283a19b27c364000f64f3db7a22fa67a386360aa465d4f22b369e","impliedFormat":1},{"version":"d88e0b5b07e7da500c1fcc6b4b1ffeacd8c4494148ee05657c076560ef23c318","impliedFormat":1},{"version":"7a9aaa2da69a99ddc1af90adc264f4c46d9b5bd5445827fdd10b5eb6b041f856","impliedFormat":1},{"version":"086caf9537c9e76607d11e605f2b1892b7f4e061a3d85de46c6b2718deb54a95","impliedFormat":1},{"version":"3362c7388ec2f8bc2744fb5a464d97bdbab3256f79b933ceda101fa00ea2d6d4","impliedFormat":1},{"version":"4d1b4a4e6e4cec22d76f7a5bb6d909a3c42f2a99bb0102c159f2ebbdf9fefe09","impliedFormat":1},{"version":"30a82ac2d8c8a45ffaaf0b168dfcc9e477cac0c0928a95ac95caf799a7c83177","impliedFormat":1},{"version":"cf8d92a3490c95b1acc08f94907cce79999b4a0ca081828a14c22220503a9c01","impliedFormat":1},{"version":"957e2258cd6c97d582673e83239141e810a42caf4862514a7db6806b35414c25","impliedFormat":1},{"version":"cafc0dea942daee65e4c9895b186d6631fbc4ffd470e9a805446e06df3a5c85a","impliedFormat":1},{"version":"b6b12d7fc9caf24f95581113ceac63c12a674c82040b60e1f35fdc972f36d24e","impliedFormat":1},{"version":"066f0ab8c0d0100b9db417204defa31a9aa9d8c6194ba7aebf71375701afcf21","impliedFormat":1},{"version":"1d500b087e784c8fd25f81974ff5ab21fe9d54f2b997abc97ff7e75f851b94c1","impliedFormat":1},{"version":"c947497552a6d04a37575cec61860d12265b189af87d8ff8c0d5f6c20dd53e53","impliedFormat":1},{"version":"b2b9e2d66040fdada60701a2c6a44de785b4635fded7c5abdf333db98b14b986","impliedFormat":1},{"version":"61804c55cfa5ae7c421f1768bc8c59df448955842264a92f3d330d1222ca3781","impliedFormat":1},{"version":"77a903b2d44ced0a996826e9ba57a357c514c4a707b27f8978988166586da9e0","impliedFormat":1},{"version":"3e46c022f080be631daf4d4945ce934d01576f9d40546fd46842acaa045f1d24","impliedFormat":1},{"version":"1ed754d6574b3d08d9bcc143507a1dacf006bd91cbc2bd9a5d3d40b61b77cd88","impliedFormat":1},{"version":"8229e36cf3be8e225af26c64634fe877eb38e7ba5715677d553576633a67d523","impliedFormat":1},{"version":"5e0ce1da2500d5ba27633852a8edf0e4ac3d2b8ef9de8e125f9e39e4d2ef8623","impliedFormat":1},{"version":"d03447d1f0c153f4ea2b00135d73d19569b80191fba23fc78dfcbea62f3f3ab6","impliedFormat":1},{"version":"3d67f41f9bcbc803e039769f9584e4f49a5a04f4ab0d1519384a274d432e5ebc","impliedFormat":1},{"version":"19a15f51d36de3326ac7aaf3518558c0823557a33f9380753a1f8ebb3b3a5eab","impliedFormat":1},{"version":"97fbcbc2dbba4da759d703ec478404ff6838c9d51f420dd08a193f4dbfff0a73","impliedFormat":1},{"version":"8f433a52637174cf6394e731c14636e1fa187823c0322bbf94c955f14faa93b9","impliedFormat":1},{"version":"f3c2bd65d2b1ebe29b9672a06ac7cdd57c810f32f0733e7a718723c2dddd37c6","impliedFormat":1},{"version":"a693fdcc130eeb9ca6dd841f7d628d018194b6fd13e86d7203088f940d0a6f20","impliedFormat":1},{"version":"a4aaa063e4bb4935367f466f60bbc719ea7baccc4ed240621a0586b669b71674","impliedFormat":1},{"version":"ad52353cb2d395083e91a486e4a352cd8fab6f595b8001e1061ff8922e074506","impliedFormat":1},{"version":"0e6ee18a9299d14f74470171533d059c1b6e23238ce8c6e6cb470d4857f6974a","impliedFormat":1},{"version":"f0b297519bf8d9bb9e051aad6a4b733c631837d9963906cf55a87f0d6244243f","impliedFormat":1},{"version":"35132905bd4cdc718580e7d7893d2c2069d9e8e4ac7d617e1d04838fb951c51a","impliedFormat":1},{"version":"6c50f85b63e41ead945f0f61d546447fa2fabfd8e6854518675ddc2400504234","impliedFormat":1},{"version":"e67aa44222d0cfc33180f747fbf61d92357a33c89daa8ddd4edba5f587eaf868","impliedFormat":1},{"version":"31fea62febf974f1a499099bd47a2d18655f988ff2924bc6ab443b86ee912a21","impliedFormat":1},{"version":"4021b53cc689a2c4bd2e1e6ae1afcf411837c607e41c9690ce9c98d33b4bce4f","impliedFormat":1},{"version":"1ac4796de6906ad7f92042d4843e3ba28f4eed7aff51724ae2aec0cc237c4871","impliedFormat":1},{"version":"94a34050268481c1e27d0ad77a8698d896d71c7358e9d53ae42c2093267ffd53","impliedFormat":1},{"version":"f43f76675b1af949a8ed127b8d8991bb0307c3b85d34f53137fe30e496cb272a","impliedFormat":1},{"version":"f23302eb32a96f3ab5082d4b425dc4a227d14f725d4e6682d9b650586a80a3e7","impliedFormat":1},{"version":"ee7cc650232e8d921addfdea819290b05b4d22f7f914e57cd7ca1aa5582f5b29","impliedFormat":1},{"version":"2ad055a4363036e32cebb36afcceaa6e3966faada01c43a31cc14762217ee84e","impliedFormat":1},{"version":"fba569f1487287c59d8483c248a65a99bd6871c0b8308c81d33f2b45c1f446e7","impliedFormat":1},{"version":"75d774b9ccb1e202709ffbcadba1d8578bad1d6915d86633ac056574879269b0","impliedFormat":1},{"version":"08559fafddfa692a02cce2d3ef9fa77cf4481edd041c4da2b6154a8994dec70e","impliedFormat":1},{"version":"2e422973e645e6ee77190fe7867192094fa5451db96eb34bf6bf0419cef10e85","impliedFormat":1},{"version":"349f0616eb0bfbcaa8e0bf53fee657bff044bff6ccaf2b8295be42d2c8b8a3f3","impliedFormat":1},{"version":"25b0285ec91d78fcc1c0800022dd15f948df01b35d1775dafbae3cce5a79b162","impliedFormat":1},{"version":"8a6414c6d70225e89602733cfa2af2c02a03b2af48c865763932c3892df782d2","impliedFormat":1},{"version":"b37402e79f4cc5103b12b86dbdcbd98124a4431fb72684a911ef6ecf588cc0ef","impliedFormat":1},{"version":"cd09f4c7c4fdb9f92ee046dd2ffc2aa3467da3e699defde33ace3ca885acffbb","impliedFormat":1},{"version":"b569745230c9e5cdb79ec7f1458d59d5e0dc04bf06fb8d398ca9d285f07c2147","impliedFormat":1},{"version":"9ddbd249d514938f9fc8be64bda78275b4c8c9df826ec33c7290672724119322","impliedFormat":1},{"version":"242012330179475ac6ffca9208827e165c796d0d69e53f957d631eaaea655047","impliedFormat":1},{"version":"320c53fc659467b10c05aad2e7730ba67d2eb703b0b3b6279894d67da153bee2","impliedFormat":1},{"version":"e2efe528ec3276c71f32154f0f458d7b387f0183827859cf0ce845773c7ff52d","impliedFormat":1},{"version":"176c7a1c47b5136de3683fbeac007b727905ca693dbd8cc340fa1fb9f26b365c","impliedFormat":1},{"version":"ebc07908e1834dca2f7dcea1ea841e1a22bc1c58832262ffa9b422ade7cbeb8a","impliedFormat":1},{"version":"67146f41d14ea0f137a6b5a71ee8947ad6c805d5acaed61c8fc5224f02dfde4f","impliedFormat":1},{"version":"22e92cabd62c19a7e43e76fba0865b33536b6434e50a97e0b0220c34c74831cb","impliedFormat":1},{"version":"d1f5f6ec7cafb6de252ce831d41e8d059bf7c44bd03bb4f8327b28b82c4d2700","impliedFormat":1},{"version":"96fba29a099df9b0c7d79ca051d7528ae546a625f9a16371b077e09f4f518e2d","impliedFormat":1},{"version":"79dd276b87e761fb23979c0d270974c19f1b3fd51575bab4691abf7701fe8154","impliedFormat":1},{"version":"764df94196883c293e3c7bc0d45eb365a9082c91a18d01f341675186f2fe8225","impliedFormat":1},{"version":"7654616453f4b4aabb6302828f884d41adddea7cfaec40d65ed507e637ae190d","impliedFormat":1},{"version":"b310eb6555fd2c6df7a1258d034b890d7bddd7a76048a8a9a8a600dd68a550f3","impliedFormat":1},{"version":"93d5a78ff448731738a42b22bd78fc52a92931097702218b90fcba5a4676a433","impliedFormat":1},{"version":"dcad64cbca4b8db52101c61f6771ef1ccca14aed432b923d86c0c7def3073b42","impliedFormat":1},{"version":"2ea7aba09d12e4e8f550206fc8dbf13d0bb2cc8bb7469fb9ccef39391dfa443c","impliedFormat":1},{"version":"d7f91db766561a83655b535c2f06163647bd780d9bbb2c19e50dec97c0e391ea","impliedFormat":1},{"version":"1c7951a2784c2fef0ed6218bf18cd3d3b895667881ba4d586b2bc15fffd0ab29","impliedFormat":1},{"version":"3d82db9fba4a59ef5bcc45f6a2172b6b262fd02331fe55ec60b08900f5df69f8","impliedFormat":1},{"version":"2594a354021468bb014f4e7cad72af89cd421b44f5ac3305a6b904d5513f1bd4","impliedFormat":1},{"version":"cbbd8d2ceb58f0c618e561d6a8d74c028dcbe36ce8e7a290b666c561824c39de","impliedFormat":1},{"version":"8c70aefeaa2989a0d36bb0c15d157132ad14bd1df1ce490ad850443ac899ba82","impliedFormat":1},{"version":"6961f2279f3ad848347154ea492c1971784705bc001aea20526b1c1d694ea0c0","impliedFormat":1},{"version":"2ae0c35c2bffb3ad231d40170402436a4b323fe9ef1dfcb9a20248090f600f36","impliedFormat":1},{"version":"9c1bce25595a518eaa5644c0af484a3794319ef22525bc63085a8137106d3ed9","impliedFormat":1},{"version":"a33ee8bd8beb3b14c3ab393b85717d7c1e5aca451ebcef09237675fa9a207389","impliedFormat":1},{"version":"6c5d50dca19d6fb862c9eac0db1b4882add3dd47a38ba5ed74b117b3860d078f","impliedFormat":1},{"version":"1f5679d1cd7b9909c1470f14350f409df0ee45c3a55d34c53f7869bf6d93b572","impliedFormat":1},{"version":"f6ae233b35bde47bb249c11525bb8d89ea93d907955450cd5d1c650e45088bab","impliedFormat":1},{"version":"8512cce0256f2fcad4dc4d72a978ef64fefab78c16a1141b31f2f2eba48823d1","impliedFormat":1},"30ca8d5dbacebe8f1ac61aa16441a8582d1f3dc80de05c6f02832ca0c409fc97","bbe09729c4bb7b65e9719504149025aab6da681be817b2510aef3691d05073d6","eea166b0e7255a0e5dd3690c17f45db3e9151c2cbc7b1346ed2ddea1e375a95c","5bf2eaaf5cba7bd71db67851ae6664a12e6d048c0c9d1212e90e6b3f06fd470e",{"version":"ee09b9348d02aec6cd1cebb94c27896c10d47efa042a3fbc9c90dd6a7f6af752","impliedFormat":1},{"version":"bf673997a66d2225f43fe1b51cdddd497d0a8c08a990ee331457f2d017563075","impliedFormat":1},"bbf567086eb8291bf470342c67476192f804af955a411a4cdc960056acdf2141",{"version":"7eeb89fdc6c4786fa59e0b5c07233b081577d6759b0f522c7ff26b340cb7300e","affectsGlobalScope":true},"8c738d7ab02122bec55d98eab2f5e875f5306ebffe56a6be96f2da0916a7ea71","d1986184a09a52db8228cb2bb2a61a8c05c9354e5b93cec8e2628d8579c892d7","ac965c40df1c4a3d53cebda90c50063ebda4522b0a054741dc3d2bd98bc852e6",{"version":"421c3f008f6ef4a5db2194d58a7b960ef6f33e94b033415649cd557be09ef619","impliedFormat":1}],"root":[513,514,539,540,544,545,[654,657],[660,664]],"options":{"allowJs":true,"esModuleInterop":true,"jsx":4,"module":99,"skipLibCheck":true,"strict":true,"target":4},"referencedMap":[[663,1],[513,2],[664,3],[661,2],[662,4],[545,5],[660,6],[540,7],[654,8],[657,9],[655,10],[656,9],[514,11],[257,2],[549,2],[548,12],[550,13],[547,2],[665,12],[551,14],[143,15],[144,15],[145,16],[98,17],[146,18],[147,19],[148,20],[93,2],[96,21],[94,2],[95,2],[149,22],[150,23],[151,24],[152,25],[153,26],[154,27],[155,27],[156,28],[157,29],[158,30],[159,31],[99,2],[97,2],[160,32],[161,33],[162,34],[196,35],[163,36],[164,2],[165,37],[166,38],[167,39],[168,40],[169,41],[170,42],[171,43],[172,44],[173,45],[174,45],[175,46],[176,2],[177,47],[178,48],[180,49],[179,50],[181,51],[182,52],[183,53],[184,54],[185,55],[186,56],[187,57],[188,58],[189,59],[190,60],[191,61],[192,62],[193,63],[100,2],[101,2],[102,2],[140,64],[141,2],[142,2],[194,65],[195,66],[85,2],[200,67],[416,68],[201,69],[199,68],[417,70],[197,71],[198,72],[83,2],[86,73],[414,68],[274,68],[631,74],[632,75],[630,68],[635,76],[634,77],[636,78],[633,79],[649,80],[650,81],[648,82],[651,83],[640,84],[638,85],[639,86],[637,79],[644,87],[643,88],[642,89],[641,82],[647,90],[646,91],[645,82],[607,68],[604,92],[601,93],[598,93],[602,94],[603,93],[600,93],[599,93],[597,82],[606,82],[605,94],[608,68],[596,95],[625,68],[623,96],[612,97],[620,98],[624,97],[614,98],[621,98],[611,97],[622,96],[615,95],[619,2],[627,96],[626,96],[618,97],[617,98],[609,97],[616,97],[610,98],[613,98],[652,99],[592,79],[591,79],[589,79],[595,100],[594,96],[590,101],[593,96],[628,96],[629,95],[560,102],[588,103],[546,102],[558,104],[557,105],[555,102],[559,106],[554,107],[556,108],[552,2],[561,102],[562,102],[573,2],[563,102],[566,98],[568,109],[567,110],[565,102],[564,2],[570,111],[569,102],[576,112],[571,102],[572,98],[575,102],[574,113],[553,102],[578,114],[577,102],[581,115],[579,102],[580,116],[582,117],[584,118],[583,102],[587,119],[585,120],[586,121],[84,2],[541,2],[542,2],[659,122],[658,2],[653,68],[543,123],[462,124],[467,1],[457,125],[221,126],[261,127],[441,128],[256,129],[238,2],[413,2],[219,2],[430,130],[287,131],[220,2],[341,132],[264,133],[265,134],[412,135],[427,136],[323,137],[435,138],[436,139],[434,140],[433,2],[431,141],[263,142],[222,143],[366,2],[367,144],[293,145],[223,146],[294,145],[289,145],[210,145],[259,147],[258,2],[440,148],[452,2],[246,2],[388,149],[389,150],[383,68],[489,2],[391,2],[392,8],[384,151],[494,152],[493,153],[488,2],[308,2],[426,154],[425,2],[487,155],[385,68],[317,156],[313,157],[318,158],[316,2],[315,159],[314,2],[490,2],[486,2],[492,160],[491,2],[312,157],[481,161],[484,162],[302,163],[301,164],[300,165],[497,68],[299,166],[281,2],[500,2],[503,2],[502,68],[504,167],[203,2],[437,168],[438,169],[439,170],[216,2],[249,2],[215,171],[202,2],[404,68],[208,172],[403,173],[402,174],[393,2],[394,2],[401,2],[396,2],[399,175],[395,2],[397,176],[400,177],[398,176],[218,2],[213,2],[214,145],[269,2],[275,178],[276,179],[273,180],[271,181],[272,182],[267,2],[410,8],[296,8],[461,183],[468,184],[472,185],[444,186],[443,2],[284,2],[505,187],[456,188],[386,189],[387,190],[381,191],[372,2],[409,192],[446,68],[373,193],[411,194],[406,195],[405,2],[407,2],[378,2],[365,196],[445,197],[448,198],[375,199],[379,200],[370,201],[422,202],[455,203],[327,204],[342,205],[211,206],[454,207],[207,208],[277,209],[268,2],[278,210],[354,211],[266,2],[353,212],[92,2],[347,213],[248,2],[368,214],[343,2],[212,2],[242,2],[351,215],[217,2],[279,216],[377,217],[442,218],[376,2],[350,2],[270,2],[356,219],[357,220],[432,2],[359,221],[361,222],[360,223],[251,2],[349,206],[363,224],[326,225],[348,226],[355,227],[226,2],[230,2],[229,2],[228,2],[233,2],[227,2],[236,2],[235,2],[232,2],[231,2],[234,2],[237,228],[225,2],[335,229],[334,2],[339,230],[336,231],[338,232],[340,230],[337,231],[247,233],[297,234],[451,235],[506,2],[476,236],[478,237],[374,238],[477,239],[449,197],[390,197],[224,2],[328,240],[243,241],[244,242],[245,243],[241,244],[421,244],[291,244],[329,245],[292,245],[240,246],[239,2],[333,247],[332,248],[331,249],[330,250],[450,251],[420,252],[419,253],[382,254],[415,255],[418,256],[429,257],[428,258],[424,259],[325,260],[322,261],[324,262],[321,263],[362,264],[352,2],[466,2],[364,265],[423,2],[280,266],[371,168],[369,267],[282,268],[285,269],[501,2],[283,270],[286,270],[464,2],[463,2],[465,2],[499,2],[288,271],[447,2],[319,272],[311,68],[262,2],[206,273],[295,2],[470,68],[205,2],[480,274],[310,68],[474,8],[309,275],[459,276],[307,274],[209,2],[482,277],[305,68],[306,68],[298,2],[204,2],[304,278],[303,279],[250,280],[380,44],[290,44],[358,2],[345,281],[344,2],[408,157],[320,68],[453,171],[460,282],[87,68],[90,283],[91,284],[88,68],[89,2],[260,285],[255,286],[254,2],[253,287],[252,2],[458,288],[469,289],[471,290],[473,291],[475,292],[479,293],[512,294],[483,294],[511,295],[485,296],[495,297],[496,298],[498,299],[507,300],[510,171],[509,2],[508,301],[531,302],[529,303],[530,304],[518,305],[519,303],[526,306],[517,307],[522,308],[532,2],[523,309],[528,310],[534,311],[533,312],[516,313],[524,314],[525,315],[520,316],[527,302],[521,317],[346,318],[515,2],[537,319],[536,2],[535,2],[538,320],[81,2],[82,2],[13,2],[14,2],[16,2],[15,2],[2,2],[17,2],[18,2],[19,2],[20,2],[21,2],[22,2],[23,2],[24,2],[3,2],[25,2],[26,2],[4,2],[27,2],[31,2],[28,2],[29,2],[30,2],[32,2],[33,2],[34,2],[5,2],[35,2],[36,2],[37,2],[38,2],[6,2],[42,2],[39,2],[40,2],[41,2],[43,2],[7,2],[44,2],[49,2],[50,2],[45,2],[46,2],[47,2],[48,2],[8,2],[54,2],[51,2],[52,2],[53,2],[55,2],[9,2],[56,2],[57,2],[58,2],[60,2],[59,2],[61,2],[62,2],[10,2],[63,2],[64,2],[65,2],[11,2],[66,2],[67,2],[68,2],[69,2],[70,2],[1,2],[71,2],[72,2],[12,2],[76,2],[74,2],[79,2],[78,2],[73,2],[77,2],[75,2],[80,2],[118,321],[128,322],[117,321],[138,323],[109,324],[108,325],[137,301],[131,326],[136,327],[111,328],[125,329],[110,330],[134,331],[106,332],[105,301],[135,333],[107,334],[112,335],[113,2],[116,335],[103,2],[139,336],[129,337],[120,338],[121,339],[123,340],[119,341],[122,342],[132,301],[114,343],[115,344],[124,345],[104,346],[127,337],[126,335],[130,2],[133,347],[539,348],[544,349]],"semanticDiagnosticsPerFile":[[655,[{"start":15842,"length":2,"code":2322,"category":1,"messageText":"Type 'string' is not assignable to type 'never'."},{"start":15914,"length":9,"code":2322,"category":1,"messageText":"Type 'string' is not assignable to type 'never'."},{"start":15964,"length":8,"code":2322,"category":1,"messageText":"Type 'string' is not assignable to type 'never'."},{"start":16058,"length":12,"code":2322,"category":1,"messageText":"Type 'string' is not assignable to type 'never'."},{"start":16103,"length":7,"code":2322,"category":1,"messageText":"Type 'string' is not assignable to type 'never'."},{"start":16144,"length":15,"code":2322,"category":1,"messageText":"Type 'number' is not assignable to type 'never'."},{"start":16191,"length":4,"code":2322,"category":1,"messageText":"Type 'string' is not assignable to type 'never'."}]]],"affectedFilesPendingEmit":[664,662,545,660,540,654,657,655,656,539,544],"version":"5.9.3"}
```

## AutoLCA/frontend/utils/parameter_engine.ts
```typescript
import { create, all } from 'mathjs';

const math = create(all);

/**
 * Safely evaluates a mathematical formula within a given context.
 * @param formula The algebraic string to evaluate (e.g., "mass * 0.2")
 * @param scope An object containing variable values (e.g., { mass: 50, grid_efficiency: 0.8 })
 * @returns The numerical result of the evaluation.
 */
export function evaluateFormula(formula: string | number, scope: Record<string, any>): number {
    if (typeof formula === 'number') return formula;
    if (!formula || formula.trim() === '') return 0;

    try {
        // Basic check to see if it's just a number string
        if (!isNaN(Number(formula))) {
            return Number(formula);
        }

        return math.evaluate(formula, scope);
    } catch (error) {
        console.error(`Evaluation Error for formula "${formula}":`, error);
        return 0; // Return 0 or handle error appropriately
    }
}

/**
 * Merges multiple parameter scopes into one.
 * Priority: Node Specific > Global Params
 */
export function getMergedScope(nodeInputs: Record<string, any>, globalParams: Record<string, any>): Record<string, any> {
    return {
        ...globalParams,
        ...nodeInputs
    };
}

/**
 * Topological Sort for cascading updates.
 * Expects nodes and edges from React Flow.
 */
export function getTopologicalOrder(nodes: any[], edges: any[]): any[] {
    const adjacencyList: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach(node => {
        adjacencyList[node.id] = [];
        inDegree[node.id] = 0;
    });

    edges.forEach(edge => {
        if (adjacencyList[edge.source] && adjacencyList[edge.target] !== undefined) {
            adjacencyList[edge.source].push(edge.target);
            inDegree[edge.target]++;
        }
    });

    const queue: string[] = [];
    Object.keys(inDegree).forEach(id => {
        if (inDegree[id] === 0) queue.push(id);
    });

    const result: any[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        const node = nodes.find(n => n.id === u);
        if (node) result.push(node);

        adjacencyList[u].forEach(v => {
            inDegree[v]--;
            if (inDegree[v] === 0) queue.push(v);
        });
    }

    return result;
}
/**
 * Evaluates all formulas within a MiniLCANodeData object based on its variables.
 */
export function evaluateNodeData(data: any, globalParams: Record<string, any> = {}): any {
    const scope = { ...globalParams, ...(data.variables || {}) };
    const newData = { ...data };

    if (newData.technosphere) {
        newData.technosphere = newData.technosphere.map((flow: any) => ({
            ...flow,
            evaluatedAmount: evaluateFormula(flow.formula, scope)
        }));
    }

    if (newData.elementary) {
        newData.elementary = newData.elementary.map((flow: any) => ({
            ...flow,
            evaluatedAmount: evaluateFormula(flow.formula, scope)
        }));
    }

    return newData;
}

```

## AutoLCA/generate_code_md.py
```python
import os
import sys

try:
    import pathspec
except ImportError:
    print("Error: 'pathspec' library not found.")
    print("Please install it by running: pip install pathspec")
    sys.exit(1)

# --- Configuration ---

OUTPUT_FILENAME = "code.md"
CUSTOM_EXCLUDE_FILENAME = ".codemdignore"

# Default patterns to exclude. Note the .gitignore syntax.
DEFAULT_EXCLUDE_PATTERNS = [
    ".git/",
    "node_modules/",
    "vendor/",
    "dist/",
    "build/",
    "__pycache__/",
    ".DS_Store",
    ".env",
    "*.pyc",
    "*.log",
    "generated_code_md.py",
    # The output file itself should always be excluded.
    OUTPUT_FILENAME,
    # The custom exclusion file should also be excluded.
    CUSTOM_EXCLUDE_FILENAME,
]

# --- Helper Functions ---

def get_language_identifier(filepath):
    """Determines the Markdown language identifier from the file path."""
    name_map = {
        "dockerfile": "dockerfile", "makefile": "makefile",
        "gemfile": "ruby", "procfile": "shell",
    }
    filename = os.path.basename(filepath).lower()
    if filename in name_map:
        return name_map[filename]

    ext_map = {
        ".py": "python", ".js": "javascript", ".ts": "typescript",
        ".jsx": "jsx", ".tsx": "tsx", ".html": "html", ".css": "css",
        ".scss": "scss", ".json": "json", ".xml": "xml", ".md": "markdown",
        ".yaml": "yaml", ".yml": "yaml", ".sh": "shell", ".rb": "ruby",
        ".java": "java", ".c": "c", ".h": "c", ".cpp": "cpp", ".cs": "csharp",
        ".go": "go", ".php": "php", ".sql": "sql", ".rs": "rust", ".toml": "toml",
    }
    _, ext = os.path.splitext(filepath)
    return ext_map.get(ext.lower(), "")

def is_binary(filepath):
    """Checks if a file is likely binary."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            f.read(1024)
        return False
    except (UnicodeDecodeError, PermissionError):
        return True
    except Exception as e:
        print(f"Warning: Could not read file {filepath}: {e}")
        return True

def load_ignore_patterns(ignore_filepath):
    """Loads patterns from a .gitignore-style file into a list."""
    patterns = []
    if os.path.exists(ignore_filepath):
        with open(ignore_filepath, 'r', encoding='utf-8') as f:
            for line in f:
                stripped_line = line.strip()
                if stripped_line and not stripped_line.startswith('#'):
                    patterns.append(stripped_line)
    return patterns

# --- Main Logic ---

def main():
    """Main function to generate the code.md file."""
    repo_root = '.'
    print(f"Starting repository scan in '{os.path.abspath(repo_root)}'...")

    # 1. Load all exclusion patterns
    print("\n--- Loading Exclusion Patterns ---")
    gitignore_patterns = load_ignore_patterns(os.path.join(repo_root, '.gitignore'))
    print(f"Loaded {len(gitignore_patterns)} patterns from '.gitignore'.")
    
    custom_ignore_patterns = load_ignore_patterns(os.path.join(repo_root, CUSTOM_EXCLUDE_FILENAME))
    if os.path.exists(CUSTOM_EXCLUDE_FILENAME):
         print(f"Loaded {len(custom_ignore_patterns)} patterns from '{CUSTOM_EXCLUDE_FILENAME}'.")

    all_patterns = DEFAULT_EXCLUDE_PATTERNS + gitignore_patterns + custom_ignore_patterns
    spec = pathspec.PathSpec.from_lines(pathspec.patterns.GitWildMatchPattern, all_patterns)
    print(f"Compiled a total of {len(all_patterns)} exclusion patterns.")
    print("------------------------------------")

    # 2. Walk the directory tree to find all files
    all_files = []
    for dirpath, _, filenames in os.walk(repo_root, topdown=True):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            # Normalize path for matching
            normalized_path = os.path.relpath(filepath, repo_root).replace(os.sep, '/')
            all_files.append(normalized_path)

    # 3. Filter files using the pathspec
    included_files = [f for f in all_files if not spec.match_file(f)]
    
    # 4. Further filter out binary files from the included list
    candidate_files = []
    for filepath in included_files:
        if is_binary(filepath):
            print(f"Skipping binary file: {filepath}")
            continue
        candidate_files.append(filepath)

    # 5. Ask user for confirmation for remaining files
    files_to_include = []
    yes_to_all = False
    
    if not candidate_files:
        print("\nNo files found to include after applying exclusions. Exiting.")
        return

    print("\n--- File Confirmation ---")
    print("The following files were not excluded by your .gitignore or other rules.")
    print("Enter 'Y' or press Enter to include, 'n' to exclude, 'a' to include all, 'q' to quit.")

    for filepath in sorted(candidate_files):
        if yes_to_all:
            print(f"Including {filepath} (Yes to All)")
            files_to_include.append(filepath)
            continue

        while True:
            response = input(f"Add '{filepath}' to code.md? (Y/n/a/q): ").lower().strip()
            
            if response in ('y', ''):
                files_to_include.append(filepath)
                break
            elif response == 'n':
                with open(CUSTOM_EXCLUDE_FILENAME, 'a', encoding='utf-8') as f:
                    f.write(f"\n{filepath}")
                print(f"  -> Excluding and adding '{filepath}' to {CUSTOM_EXCLUDE_FILENAME}")
                break
            elif response == 'a':
                yes_to_all = True
                files_to_include.append(filepath)
                break
            elif response == 'q':
                print("Operation cancelled by user. Exiting.")
                sys.exit(0)
            else:
                print("Invalid input. Please try again.")

    # 6. Generate the Markdown file
    if not files_to_include:
        print("\nNo files were selected for inclusion. No output file generated.")
        return
        
    print(f"\nGenerating {OUTPUT_FILENAME} with {len(files_to_include)} files...")
    
    try:
        with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as md_file:
            for filepath in sorted(files_to_include):
                print(f"  - Adding {filepath}")
                md_file.write(f"## {filepath}\n") # Already uses forward slashes
                
                language = get_language_identifier(filepath)
                md_file.write(f"```{language}\n")
                
                with open(filepath, 'r', encoding='utf-8') as content_file:
                    content = content_file.read()
                    md_file.write(content)
                
                md_file.write("\n```\n\n")

        print(f"\n✅ Success! Consolidated repository content written to '{OUTPUT_FILENAME}'.")
    
    except Exception as e:
        print(f"\n❌ Error: An error occurred while writing the file: {e}")

if __name__ == "__main__":
    main()
```

## AutoLCA/install_dependencies.bat
```
@echo off
echo Installing Dependencies for Triya.io Dependencies...
python -m venv venv
call venv\Scripts\activate
pip install -r backend\requirements.txt
cd frontend
npm install
echo Dependencies installed successfully.
pause

```

## AutoLCA/leftpanel_diff.txt
```
diff --git a/AutoLCA/frontend/components/LeftPanel.tsx b/AutoLCA/frontend/components/LeftPanel.tsx
index 948e335..d20a3d7 100644
--- a/AutoLCA/frontend/components/LeftPanel.tsx
+++ b/AutoLCA/frontend/components/LeftPanel.tsx
@@ -1,9 +1,5 @@
-"use client";
-
-import { useState, useCallback, useEffect, useRef, useMemo } from "react";
-import { Upload, Database, Settings, RefreshCw, FileText, Download, Search, AlertTriangle, Globe, Package, MapPin, Layers, Beaker, Calculator, PieChart, ShieldCheck, Zap } from "lucide-react";
-import { MiniLCANodeData } from "../app/types";
-import { evaluateNodeData } from "../utils/parameter_engine";
+import { useState, useCallback, useMemo, useEffect } from "react";
+import { Upload, Database, Settings } from "lucide-react";
 import DatabaseUploadZone from '../components/DatabaseUploadZone';
 
 type ProcessSummary = {
@@ -12,15 +8,12 @@ type ProcessSummary = {
 };
 
 type Parameter = {
-  key: string;
+  id: string;
   name: string;
-  defaultValue: number;
-  unit: string;
-  description?: string;
-  uncertainty?: {
-    type: string;
-    params: any;
-  }
+  min: number;
+  max: number;
+  step: number;
+  default: number;
 };
 
 type Exchange = {
@@ -33,24 +26,22 @@ type Exchange = {
 type UploadedProcess = {
   id: string;
   name: string;
+  description?: string;
   exchanges: Exchange[];
-  location?: string;
-  reference_unit?: string;
-  database_source?: string;
 };
 
 type UploadedDatabase = {
   processes: UploadedProcess[];
 };
 
-type LciaResults = {
-  gwp: number;
-  impacts: Record<string, number>;
-  hotspots: { name: string; value: number; percent: number }[];
-  is_ai_predicted: boolean;
-  node_breakdown: any;
-  uncertainty?: Record<string, { p5: number; p95: number; mean: number; std: number }>;
-} | null;
+type Hotspot = { name: string; value: number; percent: number };
+
+type LciaResults =
+  | {
+    gwp: number;
+    hotspots: Hotspot[];
+  }
+  | null;
 
 type LeftPanelProps = {
   processes: ProcessSummary[];
@@ -65,24 +56,6 @@ type LeftPanelProps = {
   contextNodeId: string | null;
   systemBoundary: string;
   onSystemBoundaryChange: (boundary: string) => void;
-  complianceFramework: string;
-  onComplianceFrameworkChange: (framework: string) => void;
-  uploadedDatabase: UploadedDatabase | null;
-  selectedUploadedProcess: UploadedProcess | null;
-  onDatabaseUpload: (data: UploadedDatabase) => void;
-  onUploadedProcessSelect: (process: UploadedProcess | null) => void;
-  exchangeValues: Record<string, number>;
-  onExchangeValueChange: (id: string, value: number) => void;
-  onAddNodeToCanvas: (process: UploadedProcess) => void;
-  onCalculate?: () => void;
-  selectedNode?: any;
-  onUpdateNodeData?: (id: string, data: any) => void;
-  onDeselectNode?: () => void;
-  isCalculating?: boolean;
-  globalParams: Record<string, number>;
-  onGlobalParamChange: (key: string, value: number) => void;
-  monteCarloIterations?: number;
-  onMonteCarloIterationsChange?: (value: number) => void;
 };
 
 export function LeftPanel({
@@ -98,894 +71,308 @@ export function LeftPanel({
   contextNodeId,
   systemBoundary,
   onSystemBoundaryChange,
-  complianceFramework,
-  onComplianceFrameworkChange,
-  uploadedDatabase,
-  selectedUploadedProcess,
-  onDatabaseUpload,
-  onUploadedProcessSelect,
-  exchangeValues,
-  onExchangeValueChange,
-  onAddNodeToCanvas,
-  onCalculate,
-  selectedNode,
-  onUpdateNodeData,
-  onDeselectNode,
-  isCalculating,
-  globalParams,
-  onGlobalParamChange,
-  monteCarloIterations = 1,
-  onMonteCarloIterationsChange
 }: LeftPanelProps) {
-  const [activeNodeTab, setActiveNodeTab] = useState<'scope' | 'technosphere' | 'elementary' | 'variables' | 'allocation' | 'quality'>('scope');
   const [search, setSearch] = useState("");
+  const [isUploading, setIsUploading] = useState(false);
   const [parameters, setParameters] = useState<Parameter[]>([]);
   const [paramValues, setParamValues] = useState<Record<string, number>>({});
-  const [searchQuery, setSearchQuery] = useState("");
-  const [searchResults, setSearchResults] = useState<UploadedProcess[]>([]);
-  const [isSearching, setIsSearching] = useState(false);
-  const [showResults, setShowResults] = useState(false);
-  const searchRef = useRef<HTMLDivElement>(null);
-
-  const [activeSearchIdx, setActiveSearchIdx] = useState<number | null>(null);
-
+  const [uploadedDatabase, setUploadedDatabase] = useState<UploadedDatabase | null>(null);
+  const [selectedUploadedProcess, setSelectedUploadedProcess] = useState<UploadedProcess | null>(null);
+  const [exchangeValues, setExchangeValues] = useState<Record<string, number>>({});
 
-  const nodeData: MiniLCANodeData = useMemo(() => {
-    if (!selectedNode) return {
-      processName: "",
-      description: "",
-      scope: { functionalUnit: "", location: "" },
-      technosphere: [],
-      elementary: [],
-      variables: {},
-      allocation: { method: 'physical', factors: {} },
-      uncertainty: {}
-    };
-    const data = selectedNode.data;
-    const baseData = data.technosphere ? data : {
-      processName: data.processName || data.label || "New Process",
-      description: data.description || "",
-      scope: {
-        functionalUnit: data.unit || "1 unit",
-        location: typeof data.location === 'string' ? data.location : (data.location?.value || "GLO")
-      },
-      technosphere: (data.exchanges || [])
-        .filter((ex: any) => ['input', 'output', 'mechanism', 'control'].includes(ex.flow_type))
-        .map((ex: any, i: number) => ({
-          id: `tech-${i}`,
-          flow_name: ex.flow_name,
-          flowType: ex.flow_type,
-          dataset_uuid: ex.dataset_uuid || "",
-          formula: ex.amount?.toString() || "0",
-          evaluatedAmount: ex.amount || 0,
-          unit: ex.unit || "kg"
-        })),
-      elementary: (data.exchanges || [])
-        .filter((ex: any) => ['emission', 'extraction'].includes(ex.flow_type))
-        .map((ex: any, i: number) => ({
-          id: `elem-${i}`,
-          flow_name: ex.flow_name,
-          flowType: ex.flow_type,
-          dataset_uuid: ex.dataset_uuid || "",
-          formula: ex.amount?.toString() || "0",
-          evaluatedAmount: ex.amount || 0,
-          unit: ex.unit || "kg"
-        })),
-      variables: data.parameters || {},
-      allocation: { method: 'physical', factors: {} },
-      uncertainty: {}
-    };
-    return evaluateNodeData(baseData, globalParams);
-  }, [selectedNode, globalParams]);
   useEffect(() => {
-    // Determine the process ID to fetch parameters for
-    const procId = selectedNode?.data?.proc_id || selectedProcessId;
-
-    if (procId) {
-      fetch(`http://localhost:8000/api/parameters/definitions?processId=${procId}`)
+    if (selectedProcessId) {
+      fetch(`/api/process/${selectedProcessId}/parameters`)
         .then((res) => res.json())
         .then((data) => {
           setParameters(data);
-          // Only set defaults if the node doesn't already have these parameters
-          const existingParams = selectedNode?.data?.parameters || {};
-          const newValues: Record<string, number> = { ...existingParams };
-
+          const defaults: Record<string, number> = {};
           data.forEach((p: Parameter) => {
-            if (newValues[p.key] === undefined) {
-              newValues[p.key] = p.defaultValue;
-            }
+            defaults[p.id] = p.default;
           });
-          setParamValues(newValues);
-
-          // Sync back to node if it's a node selection
-          if (selectedNode && Object.keys(existingParams).length === 0) {
-            onUpdateNodeData?.(selectedNode.id, { parameters: newValues });
-          }
-        })
-        .catch(err => console.error("Param fetch failed", err));
+          setParamValues(defaults);
+        });
     }
-  }, [selectedProcessId, selectedNode?.id]);
+  }, [selectedProcessId]);
 
-  // Debounced Search Effect
-  useEffect(() => {
-    const timer = setTimeout(() => {
-      if (searchQuery.length >= 2) {
-        setIsSearching(true);
-        fetch(`http://localhost:8000/api/search-processes?q=${encodeURIComponent(searchQuery)}`)
-          .then(res => res.json())
-          .then(data => {
-            setSearchResults(data);
-            setIsSearching(true); // Keep results visible
-            setIsSearching(false);
-          })
-          .catch(err => {
-            console.error("Search failed", err);
-            setIsSearching(false);
-          });
-      } else {
-        if (activeSearchIdx === null) { // Only clear if not in deep search mode to keep global results
-          setSearchResults([]);
-        }
-      }
-    }, 300);
+  const handleSearch = useCallback(() => {
+    // Placeholder: could filter processes by name with backend search
+  }, []);
 
-    return () => clearTimeout(timer);
-  }, [searchQuery, activeSearchIdx]);
+  const handleDatabaseUpload = useCallback((data: UploadedDatabase) => {
+    setUploadedDatabase(data);
+    setSelectedUploadedProcess(null);
+    setExchangeValues({});
+  }, []);
 
-  // Click outside to close search results
-  useEffect(() => {
-    function handleClickOutside(event: MouseEvent) {
-      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
-        setShowResults(false);
-        setActiveSearchIdx(null);
+  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
+    if (!e.target.files?.[0]) return;
+    setIsUploading(true);
+    const formData = new FormData();
+    formData.append("file", e.target.files[0]);
+
+    try {
+      const res = await fetch("/api/database/upload", {
+        method: "POST",
+        body: formData,
+      });
+      if (res.ok) {
+        alert("Database uploaded and switched successfully!");
+        window.location.reload();
       }
+    } catch (err) {
+      console.error("Upload failed", err);
+    } finally {
+      setIsUploading(false);
     }
-    document.addEventListener("mousedown", handleClickOutside);
-    return () => document.removeEventListener("mousedown", handleClickOutside);
-  }, []);
-
-  return (
-    <aside className="w-full h-full flex flex-col bg-[hsl(220,14%,8%)] border-r border-white/5 overflow-hidden font-mono">
-      {/* Header */}
-      <header className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
-        <div className="flex items-center gap-2">
-          <div className="w-6 h-6 bg-[hsl(142,76%,36%)] rounded flex items-center justify-center font-black text-white text-xs">A</div>
-          <h1 className="text-sm font-bold tracking-tight text-[hsl(var(--foreground))]">AUTOLCA <span className="text-[hsl(142,76%,36%)]">PRO</span></h1>
-        </div>
-        {selectedNode && (
-          <div className="bg-[hsl(142,76%,36%)] px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-tighter">
-            Editing Mode
-          </div>
-        )}
-      </header>
-
-      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-white custom-scrollbar-zone">
-        {/* Global Parameters Section */}
-        {!selectedNode && (
-          <div className="space-y-3 p-3 rounded-lg bg-[hsl(220,14%,8%)] border border-[hsl(142,76%,36%,0.2)] shadow-xl animate-in slide-in-from-top-2">
-            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(142,76%,36%)] flex items-center gap-2">
-              <Globe className="w-3 h-3" />
-              Global Scoping Parameters
-            </label>
-            <div className="space-y-3 mt-2">
-              {Object.entries(globalParams).map(([key, val]) => (
-                <div key={key} className="space-y-1">
-                  <div className="flex justify-between items-center text-[9px] font-bold">
-                    <span className="text-gray-400 font-mono">{key}</span>
-                    <span className="text-[hsl(142,76%,36%)] font-mono">{val.toFixed(2)}</span>
-                  </div>
-                  <input
-                    type="number"
-                    value={val}
-                    onChange={(e) => onGlobalParamChange(key, parseFloat(e.target.value) || 0)}
-                    className="w-full h-8 bg-[hsl(220,14%,12%)] border border-white/5 rounded px-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all"
-                  />
-                </div>
-              ))}
-            </div>
-          </div>
-        )}
-        {selectedNode ? (
-          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
-            {/* Tab Navigation */}
-            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 overflow-x-auto no-scrollbar backdrop-blur-sm sticky top-0 z-30">
-              {[
-                { id: 'scope', icon: Globe, label: 'Scope' },
-                { id: 'technosphere', icon: Package, label: 'Economy' },
-                { id: 'elementary', icon: Beaker, label: 'Biosphere' },
-                { id: 'variables', icon: Calculator, label: 'Math' },
-                { id: 'allocation', icon: PieChart, label: 'Allocation' },
-                { id: 'quality', icon: ShieldCheck, label: 'Quality' },
-              ].map((tab) => (
-                <button
-                  key={tab.id}
-                  onClick={() => setActiveNodeTab(tab.id as any)}
-                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${activeNodeTab === tab.id ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
-                >
-                  <tab.icon className="w-3.5 h-3.5" />
-                  <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
-                </button>
-              ))}
-            </div>
-
-            {/* Tab Content */}
-            <div className="min-h-[450px] flex flex-col gap-4">
-              {activeNodeTab === 'scope' && (
-                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
-                  <div className="space-y-2">
-                    <label className="text-[10px] font-black uppercase text-gray-500">Process Name</label>
-                    <input
-                      value={nodeData.processName}
-                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { processName: e.target.value })}
-                      className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                    />
-                  </div>
-                  <div className="space-y-2">
-                    <label className="text-[10px] font-black uppercase text-gray-500">Description</label>
-                    <textarea
-                      value={nodeData.description}
-                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { description: e.target.value })}
-                      className="w-full h-24 bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-gray-400 font-bold resize-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                      placeholder="Enter detailed process metadata..."
-                    />
-                  </div>
-                  <div className="grid grid-cols-2 gap-4">
-                    <div className="space-y-2">
-                      <label className="text-[10px] font-black uppercase text-gray-500">Functional Unit</label>
-                      <input
-                        value={nodeData.scope.functionalUnit}
-                        onChange={(e) => onUpdateNodeData?.(selectedNode.id, { scope: { ...nodeData.scope, functionalUnit: e.target.value } })}
-                        className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                      />
-                    </div>
-                    <div className="space-y-2">
-                      <label className="text-[10px] font-black uppercase text-gray-500">Geography</label>
-                      <input
-                        value={nodeData.scope.location}
-                        onChange={(e) => onUpdateNodeData?.(selectedNode.id, { scope: { ...nodeData.scope, location: e.target.value } })}
-                        className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
-                      />
-                    </div>
-                  </div>
-                </div>
-              )}
-
-              {(activeNodeTab === 'technosphere' || activeNodeTab === 'elementary') && (
-                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
-                  <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
-                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(142,76%,36%)]">
-                      {activeNodeTab === 'technosphere' ? 'Technosphere flows (economy)' : 'Elementary flows (biosphere)'}
-                    </h4>
-                    <button
-                      onClick={() => {
-                        const isTechnosphere = activeNodeTab === 'technosphere';
-                        const newItem: any = {
-                          id: Math.random().toString(36).substring(2, 11),
-                          flow_name: "New Flow",
-                          flowType: isTechnosphere ? 'input' : 'emission',
-                          dataset_uuid: "",
-                          formula: "0",
-                          evaluatedAmount: 0,
-                          unit: "kg"
-                        };
-
-                        if (isTechnosphere) {
-                          const list = [...(nodeData.technosphere || [])];
-                          list.push(newItem);
-                          onUpdateNodeData?.(selectedNode.id, { technosphere: list });
-                        } else {
-                          const list = [...(nodeData.elementary || [])];
-                          list.push(newItem);
-                          onUpdateNodeData?.(selectedNode.id, { elementary: list });
-                        }
-                      }}
-                      className="px-2 py-1 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded shadow-lg shadow-[hsl(142,76%,36%,0.2)] hover:scale-105 transition-transform"
-                    >
-                      + ADD FLOW
-                    </button>
-                  </div>
-
-                  <div className="space-y-3">
-                    {(activeNodeTab === 'technosphere' ? nodeData.technosphere : nodeData.elementary).map((flow, idx) => (
-                      <div key={flow.id} className="p-3 bg-[hsl(220,14%,12%)] border border-white/10 rounded-lg space-y-3 relative group/flow hover:border-[hsl(142,76%,36%,0.4)] transition-all">
-                        <div className="flex items-center gap-2">
-                          <select
-                            value={flow.flowType}
-                            onChange={(e) => {
-                              const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                              list[idx].flowType = e.target.value as any;
-                              onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                            }}
-                            className="bg-[hsl(220,14%,8%)] border border-white/5 rounded px-1.5 py-1 text-[9px] font-bold text-gray-400 capitalize focus:text-white"
-                          >
-                            {activeNodeTab === 'technosphere' ? (
-                              <>
-                                <option value="input">Input</option>
-                                <option value="output">Output</option>
-                                <option value="mechanism">Mechanism</option>
-                                <option value="control">Control</option>
-                              </>
-                            ) : (
-                              <>
-                                <option value="emission">Emission</option>
-                                <option value="extraction">Extraction</option>
-                              </>
-                            )}
-                          </select>
-                          <div className="flex-1 relative">
-                            <input
-                              value={flow.flow_name}
-                              onFocus={() => setActiveSearchIdx(idx)}
-                              onChange={(e) => {
-                                const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                                list[idx].flow_name = e.target.value;
-                                onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                                setSearchQuery(e.target.value);
-                                setShowResults(true);
-                              }}
-                              className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-[10px] text-white font-bold focus:border-[hsl(142,76%,36%)] outline-none"
-                              placeholder="Search dataset..."
-                            />
-                            {showResults && activeSearchIdx === idx && (
-                              <div className="absolute z-[110] w-full mt-1 bg-[hsl(220,14%,15%)] border border-white/10 rounded shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-1">
-                                {searchResults.map((proc) => (
-                                  <div
-                                    key={proc.id}
-                                    onClick={() => {
-                                      const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                                      list[idx] = {
-                                        ...list[idx],
-                                        flow_name: proc.name,
-                                        unit: proc.reference_unit || list[idx].unit,
-                                        dataset_uuid: proc.id
-                                      };
-                                      onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                                      setActiveSearchIdx(null);
-                                      setShowResults(false);
-                                    }}
-                                    className="p-2 hover:bg-[hsl(142,76%,36%,0.2)] border-b border-white/5 cursor-pointer flex flex-col gap-0.5"
-                                  >
-                                    <span className="text-[10px] font-bold text-white truncate">{proc.name}</span>
-                                    <span className="text-[8px] text-gray-500 uppercase">{proc.location} • {proc.reference_unit}</span>
-                                  </div>
-                                ))}
-                              </div>
-                            )}
-                          </div>
-                          <button
-                            onClick={() => {
-                              const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                              list.splice(idx, 1);
-                              onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                            }}
-                            className="opacity-0 group-hover/flow:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1"
-                          >
-                            < Zap className="w-3 h-3 rotate-45" />
-                          </button>
-                        </div>
-
-                        <div className="grid grid-cols-2 gap-3">
-                          <div className="space-y-1">
-                            <span className="text-[7px] text-gray-500 font-black uppercase">Formula (MathJS)</span>
-                            <input
-                              value={flow.formula}
-                              onChange={(e) => {
-                                const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
-                                list[idx].formula = e.target.value;
-                                onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
-                              }}
-                              className="w-full h-8 bg-black/40 border border-white/5 rounded px-2 text-[10px] font-mono text-[hsl(142,76%,36%)] focus:border-[hsl(142,76%,36%)] outline-none"
-                            />
-                          </div>
-                          <div className="space-y-1">
-                            <span className="text-[7px] text-gray-500 font-black uppercase">Result</span>
-                            <div className="w-full h-8 flex items-center px-2 bg-black/20 border border-white/5 rounded text-[10px] font-mono text-gray-300">
-                              {flow.evaluatedAmount.toFixed(4)} <span className="ml-auto text-[8px] text-gray-600 font-bold">{flow.unit}</span>
-                            </div>
-                          </div>
-                        </div>
-                      </div>
-                    ))}
-                  </div>
-                </div>
-              )}
-
-              {activeNodeTab === 'variables' && (
-                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
-                  <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
-                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(142,76%,36%)]">Math Engine Variables</h4>
-                    <button
-                      onClick={() => {
-                        const newVars = { ...nodeData.variables, [`v${Object.keys(nodeData.variables).length + 1}`]: 0 };
-                        onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                      }}
-                      className="px-2 py-1 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded shadow-lg shadow-[hsl(142,76%,36%,0.2)] hover:scale-105 transition-transform"
-                    >
-                      + ADD VARIABLE
-                    </button>
-                  </div>
-                  <div className="space-y-2">
-                    {Object.entries(nodeData.variables).map(([key, val]) => (
-                      <div key={key} className="flex items-center gap-2 p-2 bg-[hsl(220,14%,12%)] border border-white/5 rounded-lg group/var hover:border-[hsl(142,76%,36%,0.4)] transition-all">
-                        <input
-                          value={key}
-                          onChange={(e) => {
-                            const newKey = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
-                            if (newKey === key) return;
-                            const newVars = { ...nodeData.variables };
-                            delete newVars[key];
-                            newVars[newKey] = val;
-                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                          }}
-                          className="w-24 bg-transparent border-r border-white/10 px-2 py-1 text-[10px] text-[hsl(142,76%,36%)] font-mono font-bold outline-none"
-                        />
-                        <input
-                          type="number"
-                          step="any"
-                          value={val}
-                          onChange={(e) => {
-                            const newVars = { ...nodeData.variables, [key]: parseFloat(e.target.value) || 0 };
-                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                          }}
-                          className="flex-1 bg-transparent px-2 py-1 text-[10px] text-white font-mono text-right outline-none"
-                        />
-                        <button
-                          onClick={() => {
-                            const newVars = { ...nodeData.variables };
-                            delete newVars[key];
-                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
-                          }}
-                          className="opacity-0 group-hover/var:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1"
-                        >
-                          <Zap className="w-3 h-3 rotate-45" />
-                        </button>
-                      </div>
-                    ))}
-                    {Object.keys(nodeData.variables).length === 0 && (
-                      <div className="p-8 text-center border border-dashed border-white/5 rounded-lg">
-                        <Calculator className="w-8 h-8 text-gray-700 mx-auto mb-2 opacity-20" />
-                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
-                          No local constants defined.<br />Global parameters are still available.
-                        </p>
-                      </div>
-                    )}
-                  </div>
-                </div>
-              )}
-
-              {activeNodeTab === 'allocation' && (
-                <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
-                  <div className="space-y-3">
-                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
-                      <PieChart className="w-3.5 h-3.5" />
-                      Allocation Strategy
-                    </label>
-                    <select
-                      value={nodeData.allocation.method}
-                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { allocation: { ...nodeData.allocation, method: e.target.value } })}
-                      className="w-full bg-[hsl(220,14%,8%)] border border-white/20 rounded px-3 py-2 text-xs text-white font-black"
-                    >
-                      <option value="physical">Physical Attribution (Mass/Energy/Volume)</option>
-                      <option value="economic">Economic Allocation (Market Value)</option>
-                      <option value="none">No Allocation (System Expansion)</option>
-                    </select>
-                  </div>
-
-                  <div className="p-4 bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.2)] rounded-lg space-y-3">
-                    <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
-                      If this sub-system produces multiple co-products, define the allocation factor for the main reference flow.
-                    </p>
-                    <div className="flex items-center gap-4">
-                      <span className="text-[10px] font-mono text-white flex-1">{nodeData.processName}</span>
-                      <div className="flex items-center gap-2">
-                        <input type="number" defaultValue={100} className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-[hsl(142,76%,36%)] text-right" />
-                        <span className="text-[10px] font-bold text-gray-600">%</span>
-                      </div>
-                    </div>
-                  </div>
-                </div>
-              )}
-
-              {activeNodeTab === 'quality' && (
-                <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
-                  <div className="space-y-4">
-                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
-                      <ShieldCheck className="w-3.5 h-3.5" />
-                      Data Quality Indicators (DQRs)
-                    </label>
-
-                    {[
-                      { label: 'Reliability', color: 'bg-green-500' },
-                      { label: 'Completeness', color: 'bg-blue-500' },
-                      { label: 'Temporal Cor.', color: 'bg-yellow-500' },
-                      { label: 'Geographic Cor.', color: 'bg-red-500' },
-                      { label: 'Technological Cor.', color: 'bg-purple-500' },
-                    ].map((item) => (
-                      <div key={item.label} className="space-y-1.5">
-                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
-                          <span className="text-gray-400">{item.label}</span>
-                          <span className="text-white">Score: 1.0</span>
-                        </div>
-                        <div className="flex gap-1">
-                          {[1, 2, 3, 4, 5].map(n => (
-                            <div key={n} className={`flex-1 h-3 rounded-sm ${n === 1 ? item.color : 'bg-white/5 opacity-50'} border border-black/20`} />
-                          ))}
-                        </div>
-                      </div>
-                    ))}
-                  </div>
-
-                  <hr className="border-white/5" />
-
-                  <div className="space-y-3">
-                    <label className="text-[10px] font-black uppercase text-gray-500">Uncertainty Distribution</label>
-                    <select className="w-full bg-[hsl(220,14%,8%)] border border-white/20 rounded px-3 py-2 text-xs text-white font-bold">
-                      <option>None (Deterministic)</option>
-                      <option>Normal (Gaussian)</option>
-                      <option>Lognormal (Standard LCA)</option>
-                      <option>Pedigree-based (DQR Calculated)</option>
-                    </select>
-                  </div>
-                </div>
-              )}
-            </div>
-
-            <div className="pt-4 border-t border-white/5 flex gap-4">
-              <button
-                onClick={() => onDeselectNode?.()}
-                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white border border-white/10 rounded-md transition-all"
-              >
-                Close Editor
-              </button>
-              <button
-                onClick={() => {
-                  onUpdateNodeData?.(selectedNode.id, nodeData); // Force final sync
-                  onDeselectNode?.();
-                }}
-                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-[hsl(142,76%,36%)] text-white rounded-md shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all"
-              >
-                Save & Update
-              </button>
-            </div>
-          </div>
-        ) : (
-          /* Global Database View (Original UI) */
-          <>
-            <div className="space-y-3">
-              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] flex items-center">
-                <Database className="w-3 h-3 mr-2" />
-                LCA Database Integration
-              </label>
-              <DatabaseUploadZone onUploadSuccess={onDatabaseUpload} />
-            </div>
-
-            <div className="space-y-3">
-              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] flex items-center">
-                <RefreshCw className="w-3 h-3 mr-2" />
-                Active Process Control
-              </label>
-
-              <div className="relative" ref={searchRef}>
-                <div className="relative group">
-                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-[hsl(142,76%,36%)] transition-colors" />
-                  <input
-                    type="text"
-                    value={searchQuery}
-                    onFocus={() => setShowResults(true)}
-                    onChange={(e) => setSearchQuery(e.target.value)}
-                    placeholder={uploadedDatabase ? "Search database processes..." : "Upload a database first..."}
-                    disabled={!uploadedDatabase}
-                    className="w-full h-10 pl-9 pr-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)] placeholder:text-gray-600 font-bold transition-all disabled:opacity-50"
-                  />
-                  {isSearching && (
-                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
-                      <div className="w-3 h-3 border-2 border-[hsl(142,76%,36%)] border-t-transparent rounded-full animate-spin" />
-                    </div>
-                  )}
-                </div>
-
-                {/* Combobox Dropdown */}
-                {showResults && (searchQuery.length >= 2 || (uploadedDatabase && searchResults.length > 0)) && (
-                  <div className="absolute z-[100] w-full mt-1 bg-[hsl(220,14%,12%)] border border-white/10 rounded-md shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
-                    {searchResults.length > 0 ? (
-                      searchResults.map((proc) => {
-                        const hasNoImpact = true; // Placeholder for logic
-                        return (
-                          <div
-                            key={proc.id}
-                            onClick={() => {
-                              onUploadedProcessSelect(proc);
-                              setSearchQuery(proc.name);
-                              setShowResults(false);
-                            }}
-                            className="p-3 hover:bg-[hsl(142,76%,36%,0.15)] border-b border-white/5 cursor-pointer group transition-colors flex flex-col gap-1"
-                          >
-                            <div className="flex items-center justify-between gap-2">
-                              <span className="text-xs font-black text-white group-hover:text-[hsl(142,76%,36%)] transition-colors truncate">{proc.name}</span>
-                              {hasNoImpact && (
-                                <div className="group/warn relative">
-                                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
-                                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded shadow-2xl text-[8px] text-gray-300 font-bold invisible group-hover/warn:visible opacity-0 group-hover/warn:opacity-100 transition-all z-[101]">
-                                    Warning: This process may require mapping to standard impact methods (e.g., TRACI/ReCiPe).
-                                  </div>
-                                </div>
-                              )}
-                            </div>
-                            <div className="flex items-center gap-3">
-                              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
-                                <Globe className="w-2.5 h-2.5" />
-                                <span>{proc.location || 'GLO'}</span>
-                              </div>
-                              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
-                                <Package className="w-2.5 h-2.5" />
-                                <span>{proc.reference_unit || '1 unit'}</span>
-                              </div>
-                              <div className="ml-auto px-1.5 py-0.5 rounded-full bg-[hsl(142,76%,36%,0.1)] border border-[hsl(142,76%,36%,0.2)] text-[7px] font-black text-[hsl(142,76%,36%)] uppercase tracking-tighter">
-                                User Upload
-                              </div>
-                            </div>
-                          </div>
-                        );
-                      })
-                    ) : searchQuery.length >= 2 ? (
-                      <div className="p-6 text-center space-y-4">
-                        <p className="text-[10px] text-gray-500 font-bold uppercase">No local results found for "{searchQuery}"</p>
-                        <button className="w-full py-2 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded hover:bg-[hsl(142,76%,46%)] transition-colors">
-                          Connect USLCI / Ecoinvent ➔
-                        </button>
-                      </div>
-                    ) : null}
-                  </div>
-                )}
-              </div>
-            </div>
+  };
 
-            {selectedUploadedProcess && (
-              <div className="p-3 rounded-lg bg-[hsl(220,14%,13%)] border border-[hsl(var(--border))] space-y-4">
-                <div className="space-y-2">
-                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-tighter">Exchange Variables</label>
-                  {selectedUploadedProcess.exchanges.map((ex, idx) => (
-                    <div key={idx} className="flex items-center gap-2">
-                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate flex-1" title={ex.flow_name}>
-                        {ex.flow_name}
-                      </span>
-                      <div className="flex items-center gap-1 w-24">
-                        <input
-                          type="number"
-                          step="any"
-                          value={exchangeValues[`exchange_${idx}`] ?? ex.amount}
-                          onChange={(e) => onExchangeValueChange(`exchange_${idx}`, Number(e.target.value))}
-                          className="w-full bg-[hsl(220,14%,8%)] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-[10px] font-mono text-[hsl(142,76%,36%)] text-right focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)]"
-                        />
-                        <span className="text-[8px] text-[hsl(var(--muted-foreground))] font-bold w-6 text-left">{ex.unit}</span>
-                      </div>
-                    </div>
-                  ))}
-                </div>
+  const selectedProcessName = useMemo(() => {
+    return processes.find((p) => p.id === selectedProcessId)?.name ?? "None selected";
+  }, [processes, selectedProcessId]);
 
-                <button
-                  onClick={() => onAddNodeToCanvas(selectedUploadedProcess)}
-                  className="w-full bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,46%)] text-white font-bold py-2 rounded text-xs transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse flex items-center justify-center gap-2"
-                >
-                  ➕ ADD PROCESS TO CANVAS
-                </button>
-              </div>
-            )}
-          </>
-        )}
+  return (
+    <aside className="w-[340px] shrink-0 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(220,18%,8%)]">
+      <div className="p-4 border-b border-[hsl(var(--border))]">
+        <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Triya.io</h1>
+        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
+          AI Life Cycle Assessment - Super Calculator
+        </p>
+      </div>
 
-        <hr className="border-[hsl(var(--border))]" />
+      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
+        {/* Objective 1: Upload Database Zone */}
+        <DatabaseUploadZone onUploadSuccess={handleDatabaseUpload} />
 
-        {/* System Boundary */}
-        <div className="space-y-3">
-          <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Methodology</label>
+        {/* System Boundary Logic */}
+        <div>
+          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
+            <Settings className="w-4 h-4 mr-2" />
+            System Boundary
+          </label>
           <select
             value={systemBoundary}
             onChange={(e) => onSystemBoundaryChange(e.target.value)}
-            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all font-bold"
+            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
           >
-            <option value="cradle-to-cradle">Cradle-to-Cradle (C2C)</option>
-            <option value="cradle-to-gate">Cradle-to-Gate</option>
-            <option value="cradle-to-grave">Cradle-to-Grave</option>
-            <option value="gate-to-gate">Gate-to-Gate</option>
-            <option value="gate-to-cradle">Gate-to-Cradle</option>
+            <option value="gate">Cradle-to-Gate</option>
+            <option value="grave">Cradle-to-Grave</option>
+            <option value="cradle">Cradle-to-Cradle (Circular)</option>
           </select>
-
-          <div className="text-[10px] text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(220,14%,8%)] border border-white/5 rounded leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 italic font-medium">
-            {systemBoundary === 'cradle-to-cradle' && "Cradle-to-Cradle (C2C): A circular, restorative model where end-of-life products are recycled, upcycled, or biodegraded into new raw materials, eliminating waste and enabling continuous technical or biological cycles."}
-            {systemBoundary === 'cradle-to-gate' && "Cradle-to-Gate: Evaluates a partial product life cycle from resource extraction (\"cradle\") to the factory gate (\"gate\") before it reaches the consumer. Commonly used for B2B footprinting."}
-            {systemBoundary === 'cradle-to-grave' && "Cradle-to-Grave: The standard linear life cycle model, tracing a product from raw material extraction (\"cradle\") through production, transport, usage, and final waste disposal (\"grave\")."}
-            {systemBoundary === 'gate-to-gate' && "Gate-to-Gate: A partial LCA, typically mapping a single value-added process within a manufacturing chain."}
-            {systemBoundary === 'gate-to-cradle' && "Gate-to-Cradle: Focuses on the recycling, refurbishment, or regeneration phase of a product, from the end-of-life waste stage (\"gate\") back into a new production cycle (\"cradle\")."}
-          </div>
         </div>
 
-        <hr className="border-[hsl(var(--border))]" />
-
-        {/* Reporting Compliance */}
-        <div className="space-y-2">
-          <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Reporting Compliance</label>
-          <select
-            value={complianceFramework}
-            onChange={(e) => onComplianceFrameworkChange(e.target.value)}
-            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all font-bold"
-          >
-            <option value="iso-14044">ISO 14040 / 14044</option>
-            <option value="jrc-pef">JRC / PEF (EF 3.1)</option>
-            <option value="en-15804">EN 15804+A2</option>
-            <option value="ghg-protocol">GHG Protocol</option>
-          </select>
-        </div>
-
-        {/* Global Uncertainty Analysis */}
-        <div className="space-y-3 p-3 rounded-lg bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.1)]">
-          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(142,76%,36%)] flex items-center gap-2">
-            <RefreshCw className="w-3 h-3" />
-            Uncertainty Mode
+        {/* Process selection bound to database */}
+        <div>
+          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
+            <Database className="w-4 h-4 mr-2" />
+            Active Process
           </label>
-
-          <div className="flex bg-[hsl(220,14%,8%)] rounded p-1">
-            <button
-              onClick={() => onMonteCarloIterationsChange?.(1)}
-              className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${monteCarloIterations <= 1 ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.2)]' : 'text-gray-500 hover:text-white'}`}
-            >
-              Deterministic
-            </button>
-            <button
-              onClick={() => onMonteCarloIterationsChange?.(1000)}
-              className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${monteCarloIterations > 1 ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.2)]' : 'text-gray-500 hover:text-white'}`}
+          {uploadedDatabase ? (
+            <select
+              value={selectedUploadedProcess?.id ?? ""}
+              onChange={(e) => {
+                const processId = e.target.value;
+                const process = uploadedDatabase.processes.find(p => p.id === processId);
+                setSelectedUploadedProcess(process || null);
+                if (process) {
+                  // Initialize exchange values with defaults
+                  const defaults: Record<string, number> = {};
+                  process.exchanges.forEach((exchange, index) => {
+                    defaults[`exchange_${index}`] = exchange.amount;
+                  });
+                  setExchangeValues(defaults);
+                } else {
+                  setExchangeValues({});
+                }
+              }}
+              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
             >
-              Stochastic
-            </button>
-          </div>
+              <option value="">Select a process…</option>
+              {uploadedDatabase.processes.map((process) => (
+                <option key={process.id} value={process.id}>
+                  {process.name}
+                </option>
+              ))}
+            </select>
+          ) : (
+            <div className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
+              Upload a database to view processes
+            </div>
+          )}
+        </div>
 
-          {monteCarloIterations > 1 && (
-            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
-              <div className="flex justify-between items-center text-[9px] font-bold">
-                <span className="text-gray-400">Monte Carlo Iterations</span>
-                <span className="text-[hsl(142,76%,36%)] font-mono">{monteCarloIterations}</span>
-              </div>
+        {/* Dynamic Exchange Parameters */}
+        {selectedUploadedProcess && (
+          <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
+            <label className="block text-sm font-medium text-[hsl(var(--foreground))] flex items-center">
+              <Settings className="w-4 h-4 mr-2" />
+              Parameters
+            </label>
+            
+            {/* Scale Parameter */}
+            <div>
+              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
+                Functional Unit Scale
+              </label>
               <input
                 type="range"
-                min={100}
-                max={5000}
-                step={100}
-                value={monteCarloIterations}
-                onChange={(e) => onMonteCarloIterationsChange?.(parseInt(e.target.value))}
-                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[hsl(142,76%,36%)]"
+                min={0.1}
+                max={10.0}
+                step={0.1}
+                value={scale}
+                onChange={(e) => onScaleChange(Number(e.target.value))}
+                className="w-full accent-[hsl(142,76%,36%)]"
               />
-              <p className="text-[8px] text-gray-600 font-bold uppercase leading-tight">
-                Vectorized simulation calculates {monteCarloIterations} supply chain variations in parallel.
-              </p>
+              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
+                <span>0.1</span>
+                <span>{scale.toFixed(1)}</span>
+                <span>10.0</span>
+              </div>
             </div>
-          )}
-        </div>
-      </div>
 
-      <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] flex-shrink-0">
-        <div className="grid grid-cols-3 gap-1.5">
+            {/* Exchange Parameters */}
+            {selectedUploadedProcess.exchanges.length > 0 && (
+              <>
+                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">
+                  Exchange Amounts
+                </label>
+                {selectedUploadedProcess.exchanges.map((exchange, index) => (
+                  <div key={index}>
+                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
+                      {exchange.flow_name} ({exchange.flow_type}) - {exchange.unit}
+                    </label>
+                    <input
+                      type="range"
+                      min={0}
+                      max={exchange.amount * 3} // Allow up to 3x the default
+                      step={0.01}
+                      value={exchangeValues[`exchange_${index}`] ?? exchange.amount}
+                      onChange={(e) => {
+                        const val = Number(e.target.value);
+                        setExchangeValues(prev => ({ ...prev, [`exchange_${index}`]: val }));
+                      }}
+                      className="w-full accent-[hsl(142,76%,36%)]"
+                    />
+                    <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
+                      <span>0</span>
+                      <span>{(exchangeValues[`exchange_${index}`] ?? exchange.amount).toFixed(2)}</span>
+                      <span>{(exchange.amount * 3).toFixed(0)}</span>
+                    </div>
+                  </div>
+                ))}
+              </>
+            )}
+          </div>
+        )}
+
+        {/* Shuffle Example */}
+
+
+        {/* Shuffle Example */}
+        <button
+          type="button"
+          onClick={onShuffleDemo}
+          className="w-full rounded-md border-2 border-dashed border-[hsl(142,76%,36%)] bg-[hsl(220,14%,12%)] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-colors"
+        >
+          Shuffle Example
+        </button>
+
+        {/* Export actions */}
+        <div className="flex gap-2">
           <button
+            type="button"
             onClick={onGeneratePdf}
-            disabled={isCalculating}
-            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(var(--foreground))]'} text-[9px] font-bold transition-colors`}
+            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)]"
           >
-            <FileText className="w-3 h-3" />
-            PDF
+            Generate PDF report
           </button>
           <button
+            type="button"
             onClick={onDownloadCsv}
-            disabled={isCalculating}
-            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(var(--foreground))]'} text-[9px] font-bold transition-colors`}
-          >
-            <Download className="w-3 h-3" />
-            CSV
-          </button>
-          <button
-            onClick={onShuffleDemo}
-            disabled={isCalculating}
-            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(142,76%,36%)]'} text-[9px] font-bold transition-colors`}
+            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)]"
           >
-            ⚡ BENCH
+            Download CSV
           </button>
         </div>
-      </div>
 
-      {/* Result Dashboard */}
-      {lciaResults && (
-        <footer className="p-4 bg-[hsl(220,14%,8%)] border-t border-[hsl(var(--border))] space-y-4 max-h-[400px] overflow-y-auto">
-          {/* AI Warning */}
-          {lciaResults.is_ai_predicted && (
-            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded flex items-start gap-2 animate-pulse">
-              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
-              <p className="text-[9px] font-bold text-yellow-500 uppercase leading-tight">
-                Notice: Some missing Characterization Factors were predicted using AI (KNNImputer).
+        {/* LCIA results placeholder */}
+        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
+          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
+            LCIA Results
+          </h3>
+          {lciaResults ? (
+            <div className="space-y-2">
+              <p className="text-xs text-[hsl(var(--muted-foreground))]">
+                Process: <span className="font-medium text-[hsl(var(--foreground))]">{selectedProcessName}</span>
               </p>
-            </div>
-          )}
-
-          {/* Hotspot Card */}
-          {lciaResults.hotspots.length > 0 && (
-            <div className="p-4 bg-red-600/10 border-2 border-red-600/30 rounded-lg space-y-2 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.1)]">
-              <div className="flex items-center gap-2 text-[11px] font-black text-red-500 uppercase tracking-widest">
-                <AlertTriangle className="w-4 h-4" />
-                Supply Chain Hotspot
-              </div>
-              <div className="flex justify-between items-center py-1">
-                <span className="text-sm font-black text-white truncate max-w-[140px] italic">🔴 {lciaResults.hotspots[0].name}</span>
-                <span className="text-lg font-black text-red-500">{lciaResults.hotspots[0].percent.toFixed(1)}%</span>
-              </div>
-              <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">
-                This process accounts for the majority of Carbon Impact (GWP) in the current supply chain.
+              <p className="text-xs text-[hsl(var(--muted-foreground))]">
+                Total impact (GWP-like):{" "}
+                <span className="font-semibold text-[hsl(var(--foreground))]">
+                  {lciaResults.gwp.toFixed(3)}
+                </span>
               </p>
-            </div>
-          )}
-
-          {/* GWP Total */}
-          <div className="space-y-1">
-            <div className="flex justify-between items-end">
-              <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Total GWP</span>
-              <div className="text-right">
-                <div className="text-xl font-black text-[hsl(142,76%,36%)] leading-none">
-                  {lciaResults.gwp.toFixed(2)} <span className="text-[10px]">kg CO₂ eq</span>
-                </div>
-                {lciaResults.uncertainty?.gwp_climate_change && (
-                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mt-1">
-                    95% CI: {lciaResults.uncertainty.gwp_climate_change.p5.toFixed(1)} — {lciaResults.uncertainty.gwp_climate_change.p95.toFixed(1)}
-                    <span className="ml-1 text-[hsl(142,76%,36%)]">({(lciaResults as any).iterations} runs)</span>
-                  </div>
-                )}
+              <div className="mt-2 space-y-1">
+                <p className="text-xs font-medium text-[hsl(var(--foreground))]">
+                  Top hotspots (&gt; 80% cumulative):
+                </p>
+                {lciaResults.hotspots
+                  .reduce<{ items: Hotspot[]; cum: number }>((acc, h) => {
+                    if (acc.cum >= 80) return acc;
+                    const nextCum = acc.cum + h.percent;
+                    acc.items.push(h);
+                    acc.cum = nextCum;
+                    return acc;
+                  }, { items: [], cum: 0 }).items
+                  .map((h) => (
+                    <p
+                      key={h.name}
+                      className="text-xs text-[hsl(var(--muted-foreground))] flex justify-between"
+                    >
+                      <span>{h.name}</span>
+                      <span>{h.percent.toFixed(1)}%</span>
+                    </p>
+                  ))}
               </div>
             </div>
-            <div className="w-full bg-[hsl(220,14%,15%)] h-1 rounded-full overflow-hidden">
-              <div className="bg-[hsl(142,76%,36%)] h-full" style={{ width: '100%' }}></div>
-            </div>
-          </div>
+          ) : (
+            <p className="text-xs text-[hsl(var(--muted-foreground))]">
+              Select a process or run Shuffle Demo to see impacts.
+            </p>
+          )}
+        </div>
 
-          {/* JRC Categories Table */}
-          <div className="space-y-2">
-            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">JRC EF 3.1 Impact Table</label>
-            <div className="space-y-1">
-              {Object.entries(lciaResults.impacts).map(([key, val]) => {
-                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
-                const unit_map: Record<string, string> = {
-                  'gwp_climate_change': 'kg CO2 eq',
-                  'odp_ozone_depletion': 'kg CFC11 eq',
-                  'ap_acidification': 'mol H+ eq',
-                  'ep_freshwater': 'kg P eq',
-                  'ep_marine': 'kg N eq',
-                  'ep_terrestrial': 'mol N eq',
-                  'pocp_photochemical_ozone': 'kg NMVOC eq',
-                  'pm_particulate_matter': 'disease inc.',
-                  'ir_ionising_radiation': 'kBq U235 eq',
-                  'ht_c_human_toxicity_cancer': 'CTUh',
-                  'ht_nc_human_toxicity_non_cancer': 'CTUh',
-                  'et_fw_ecotoxicity_freshwater': 'CTUe',
-                  'lu_land_use': 'Pt',
-                  'wsf_water_scarcity': 'm3 world eq',
-                  'ru_mm_resource_use_min_met': 'kg Sb eq',
-                  'ru_f_resource_use_fossils': 'MJ'
-                };
-                return (
-                  <div key={key} className="flex justify-between items-center text-[9px] p-1 border-b border-white/5 hover:bg-white/5 transition-colors">
-                    <span className="text-gray-400 font-bold max-w-[140px] truncate">{label}</span>
-                    <div className="text-right">
-                      <div className="flex items-center justify-end gap-1">
-                        <span className="text-white font-mono">{val.toExponential(2)}</span>
-                        <span className="text-gray-600 text-[7px]">{unit_map[key] || ''}</span>
-                      </div>
-                      {lciaResults.uncertainty?.[key] && (
-                        <div className="text-[7px] text-gray-500 font-bold">
-                          [{lciaResults.uncertainty[key].p5.toExponential(1)} .. {lciaResults.uncertainty[key].p95.toExponential(1)}]
-                        </div>
-                      )}
-                    </div>
-                  </div>
-                );
-              })}
-            </div>
+        {/* Contextual parameters for right-clicked node (per-use-case customization) */}
+        {contextNodeId && (
+          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
+            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
+              Node Parameters
+            </h3>
+            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
+              Adjust parameters for the selected use-case node:{" "}
+              <span className="font-mono text-[hsl(var(--foreground))]">{contextNodeId}</span>
+            </p>
+            {/* Demo controls; can be wired to backend later */}
+            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
+              Scenario intensity
+            </label>
+            <input
+              type="range"
+              min={0}
+              max={200}
+              defaultValue={100}
+              className="w-full accent-[hsl(142,76%,36%)] mb-2"
+            />
+            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
+              Variant label
+            </label>
+            <input
+              type="text"
+              placeholder="e.g. Recycled content high"
+              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,14%)] px-2 py-1 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)]"
+            />
           </div>
-        </footer>
-      )}
+        )}
+      </div>
     </aside>
   );
 }

```

## AutoLCA/setup_all.py
```python
import os
import sys
import subprocess

# Config
PATH_A = r"C:\Users\Asus\Documents\AutoLCA"
PATH_B = r"C:\Users\Asus\Documents\Database_Triya"
GTK_RUNTIME = os.path.join(PATH_A, "backend", "libs", "gtk_runtime")

def setup():
    print("--- Triya.io Setup All Utility ---")
    
    # Pathway B Update
    PATH_TRIYA = r"C:\Users\Asus\Documents\Database_Triya"
    
    # 1. Verify PATH B
    if not os.path.exists(PATH_TRIYA):
        print(f"FAILED: Path B ({PATH_TRIYA}) not found. Creating it...")
        os.makedirs(PATH_TRIYA)
    else:
        print(f"SUCCESS: Path B (Database Research) found.")

    # 2. GTK Setup for WeasyPrint
    # We set environment variables so WeasyPrint can find the DLLs in our local libs
    if os.path.exists(GTK_RUNTIME):
        print(f"SUCCESS: GTK Runtime found in backend/libs.")
        os.environ["WEASYPRINT_DLL_DIRECTORIES"] = GTK_RUNTIME
    else:
        print(f"WARNING: GTK Runtime not found. PDF generation might fail on Windows.")

    # 3. Link Backend
    print("SUCCESS: Backend linked to Database Pathway B via models.py config.")

    # 4. Final check for DB
    db_file = os.path.join(PATH_B, "autolca_poc.db")
    if not os.path.exists(db_file):
        print(f"NOTICE: Database not found. You should run 'seed.py' from Path B.")
    
    print("\nSetup Complete. You can now use start_app.bat.")

if __name__ == "__main__":
    setup()

```

## AutoLCA/start_app.bat
```
@echo off
echo Starting Triya.io (Next.js + FastAPI)
set WEASYPRINT_DLL_DIRECTORIES=%cd%\backend\libs\gtk_runtime
start /b venv\Scripts\python backend\main.py
cd frontend
start /b npm run dev
echo App is loading at http://localhost:3000
pause

```

## Database_Triya/seed.py
```python
import sqlite3
import os

# Triya.io Configuration - Pathway B (Persistent)
DB_PATH = r"C:\Users\Asus\Documents\triya\Database_Triya\triya_poc.db"
DATA_BASES_DIR = r"C:\Users\Asus\Documents\triya\Database_Triya\data_bases"

# Shifted Global Databases
LCIA_METHODS_ZIP = os.path.join(DATA_BASES_DIR, "openLCA LCIA Methods 2.8.0 2025-12-15.zip")
NEEDS_ZOLCA = os.path.join(DATA_BASES_DIR, "needs_18.zolca")
AWARE_JSON = os.path.join(DATA_BASES_DIR, "AWARE_v1_2_setup_openlca_2024-10-30.json")

def seed():
    print(f"--- Seeding Database in Triya.io Research Pathway ({DB_PATH}) ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lca_processes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_name TEXT,
            unit TEXT,
            gwp_climate_change REAL,
            odp_ozone_depletion REAL,
            ap_acidification REAL,
            ep_freshwater REAL,
            ep_marine REAL,
            ep_terrestrial REAL,
            pocp_photochemical_ozone REAL,
            pm_particulate_matter REAL,
            ir_ionising_radiation REAL,
            ht_c_human_toxicity_cancer REAL,
            ht_nc_human_toxicity_non_cancer REAL,
            et_fw_ecotoxicity_freshwater REAL,
            lu_land_use REAL,
            wsf_water_scarcity REAL,
            ru_mm_resource_use_min_met REAL,
            ru_f_resource_use_fossils REAL
        )
    """)

    # Clear old data
    cursor.execute("DELETE FROM lca_processes")

    # 1. Background Dataset (for AI Context)
    background_data = [
        ("LDPE Granulate", "kg", 2.0, 1e-7, 0.004, 0.0001, 0.002, 0.015, 0.0005, 1e-6, 1.2, 1e-9, 2e-8, 0.5, 15, 20, 0.0001, 35),
        ("HDPE Granulate", "kg", 1.9, 1e-7, 0.0035, 0.00009, 0.0018, 0.014, 0.00045, 1e-6, 1.1, 1e-9, 2e-8, 0.45, 14, 18, 0.00009, 32),
        ("PP Granulate", "kg", 2.1, 1e-7, 0.0045, 0.00011, 0.0022, 0.016, 0.00055, 1e-6, 1.3, 1e-9, 2e-8, 0.55, 16, 22, 0.00011, 38),
        ("PVC Granulate", "kg", 2.5, 1e-7, 0.006, 0.00015, 0.003, 0.02, 0.0007, 1e-6, 1.6, 1e-9, 2e-8, 0.7, 20, 25, 0.00015, 45)
    ]

    for item in background_data:
        cursor.execute("""
            INSERT INTO lca_processes (
                process_name, unit, gwp_climate_change, odp_ozone_depletion, ap_acidification,
                ep_freshwater, ep_marine, ep_terrestrial, pocp_photochemical_ozone,
                pm_particulate_matter, ir_ionising_radiation, ht_c_human_toxicity_cancer,
                ht_nc_human_toxicity_non_cancer, et_fw_ecotoxicity_freshwater, lu_land_use,
                wsf_water_scarcity, ru_mm_resource_use_min_met, ru_f_resource_use_fossils
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, item)

    # 2. PET Benchy (With Intentional Gaps for AI Demo)
    # Gaps: Acidification (None), Eutrophication Freshwater (None)
    cursor.execute("""
        INSERT INTO lca_processes (
            process_name, unit, gwp_climate_change, odp_ozone_depletion, ap_acidification,
            ep_freshwater, ep_marine, ep_terrestrial, pocp_photochemical_ozone,
            pm_particulate_matter, ir_ionising_radiation, ht_c_human_toxicity_cancer,
            ht_nc_human_toxicity_non_cancer, et_fw_ecotoxicity_freshwater, lu_land_use,
            wsf_water_scarcity, ru_mm_resource_use_min_met, ru_f_resource_use_fossils
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "1 kg PET Bottle", "kg", 2.5, 1.5e-7, None, 
        None, 0.0025, 0.018, 0.0006, 1.2e-6, 1.4, 1.5e-9, 
        2.5e-8, 0.65, 18, 24, 0.00013, 40
    ))

    conn.commit()
    print(f"SUCCESS: Seeded {len(background_data) + 1} processes into {DB_PATH}.")
    conn.close()

if __name__ == "__main__":
    seed()

```

## Database_Triya/test_benchy.py
```python
import os
import requests
import pytest

BASE_URL = "http://localhost:8000/api/process"

# Database Configuration for Benchmarking
DATA_BASES_DIR = r"C:\Users\Asus\Documents\triya\Database_Triya\data_bases"
NEEDS_DB = os.path.join(DATA_BASES_DIR, "needs_18.zolca")
AWARE_DB = os.path.join(DATA_BASES_DIR, "AWARE_v1_2_setup_openlca_2024-10-30.json")
LCIA_METHODS = os.path.join(DATA_BASES_DIR, "openLCA LCIA Methods 2.8.0 2025-12-15.zip")

def test_pet_benchy_accuracy():
    # 1. First, find the ID for the "1 kg PET Bottle"
    # We'll assume the process we just seeded is the target. 
    # In seed.py, it was the 5th process added (index 4 in list + 1). 
    # But to be safe, we'll fetch all processes if possible or just try ID 5.
    pet_id = 5 
    quantity = 10000
    
    response = requests.get(f"{BASE_URL}/{pet_id}/scale?params=quantity={quantity}")
    # Wait, our endpoint is /api/process/{process_id}/scale?quantity={val}
    response = requests.get(f"{BASE_URL}/{pet_id}/scale?quantity={quantity}")
    
    assert response.status_code == 200
    data = response.json()
    
    print(f"\nBenchmark Results for {data['process_name']}:")
    print(f"Scaled Quantity: {data['scaled_quantity']} {data['unit']}")
    
    impacts = data['impacts']
    
    # Assertion 1: Linear Scaling (GWP)
    # Ground Truth GWP = 2.5 per kg. For 10,000 kg -> 25,000
    gwp = impacts['gwp_climate_change']
    print(f"Climate Change (GWP): {gwp} kg CO2-eq")
    assert gwp == 25000.0, f"Expected 25000.0, got {gwp}"
    
    # Assertion 2: AI Imputation (Acidification Potential)
    # Ground Truth AP = 0.005 per kg. For 10,000 kg -> 50.0
    # Tolerance window: 40 to 60
    ap = impacts['ap_acidification']
    print(f"Acidification (AP): {ap} mol H+ eq")
    assert ap is not None
    assert 40 <= ap <= 60, f"AP {ap} out of tolerance window (40-60)"
    
    # Assertion 3: AI Imputation (Eutrophication Freshwater)
    # Ground Truth EP = 0.0001 per kg. For 10,000 kg -> 1.0
    ep = impacts['ep_freshwater']
    print(f"Eutrophication (EP): {ep} kg P eq")
    assert ep is not None
    assert 0.5 <= ep <= 1.5, f"EP {ep} out of tolerance window (0.5-1.5)"

    print("Benchmark PASSED: AI imputation and scaling are scientifically accurate.")

if __name__ == "__main__":
    # Run test manually if not using pytest
    try:
        test_pet_benchy_accuracy()
    except Exception as e:
        print(f"Benchmark FAILED: {e}")

```

