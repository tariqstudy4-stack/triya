# Triya.io: Open-Source Strategic LCA Platform

<div align="center">
  <img src="https://img.shields.io/badge/Status-Beta-emerald?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-teal?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Math-PyTorch-red?style=for-the-badge&logo=pytorch" alt="PyTorch"/>
</div>

<br/>

Triya.io is a Life Cycle Assessment (LCA) instrument designed for open-source environmental engineering. It provides a bridge between visual product design and parametric modeling aligned with ISO 14044 standards. 

The application is built on a React Flow and FastAPI stack. It includes interactive IDEF0 mapping, background sparse matrix solvers, and JRC EF 3.1 impact characterization.

## Key Capabilities

*   **ISO 14040/44 Guardrails**: Goal and Scope configurations for functional units, system boundaries, cut-off thresholds, and LCIA methodologies.
*   **IDEF0 Canvas**: Standard-compliant workflow modeling using a drag-and-drop interface. Connections manage the mapping from Inputs and Resources to Processes and Outputs or Emissions.
*   **Parametric Monte Carlo Engine**: Support for Lognormal, Normal, and Uniform distributions on physical exchanges for probabilistic modeling via the Python backend.
*   **AM_Pri Integration**: Graph Neural Network hooks for analyzing .stl geometries to predict material efficiency and translate geometry into energy and material lifecycles.

## Installation and Setup

Python 3.10 or higher and Node 18 or higher are required.

### 1. Backend Configuration (FastAPI)

Navigate to the backend directory to initialize the API and mathematical engine.

```bash
cd AutoLCA/backend

# Initialize environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
python main.py
```
The API is served at http://localhost:8000.

### 2. Frontend Configuration (Next.js)

Navigate to the frontend directory to initialize the user interface.

```bash
cd AutoLCA/frontend

# Install dependencies
npm install

# Start the application
npm run dev
```
The dashboard is accessible at http://localhost:3000.

## Architecture

```text
Triya.io/
├── AutoLCA/
│   ├── frontend/        (Next.js 14, Zustand, React Flow)
│   │   ├── components/  (Goal & Scope, Canvas Nodes, 3D Dropzones)
│   │   └── lib/         (Zustand State, Matrix Data Sync)
│   ├── backend/         (FastAPI, Pydantic Validation)
│   │   ├── core/        (LCA Solvers, Monte Carlo Engines)
│   │   └── main.py      (Root Endpoints)
├── Database_Triya/      (SQLite / LCI Datasets)
└── docker-compose.yml   (Containerized environment)
```

### Data Synchronization

1.  **Frontend**: Zustand manages parametric changes and goal modifications, including allocation methodologies such as mass or economic ratios.
2.  **Validation**: A Pydantic schema ensures ISO methodology rules are maintained during data transfer.
3.  **Backend Engine**: Interprets cutoff thresholds and computes the Life Cycle Inventory matrix using allocation algorithms. 

## Project Standards

*   Configuration files (.env) are excluded from version control.
*   Machine learning weights and local databases are ignored to maintain repository efficiency.
*   All project data and LCI databases are stored locally in the AutoLCA/backend/data directory using SQLite. No external cloud connection is required for operation.

Copyright 2026 Triya.io. Released under Open Source License.
