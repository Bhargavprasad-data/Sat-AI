# 🛰️ SatQuery AI (Sat-AI) — Autonomous Geospatial Intelligence Assistant

[![GitHub Repository](https://img.shields.io/badge/GitHub-Sat--AI-181717.svg?logo=github)](https://github.com/Bhargavprasad-data/Sat-AI.git)
[![Render Deployment](https://img.shields.io/badge/Deploy%20to-Render-46E3B7.svg?logo=render&logoColor=white)](https://render.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61dafb.svg?logo=react&logoColor=white)](https://vitejs.dev)
[![STAC API](https://img.shields.io/badge/STAC%20Catalogue-AWS%20Earth%20Search-FF9900.svg?logo=amazon-aws&logoColor=white)](https://earth-search.aws.element84.com/v1)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

**SatQuery AI** is an autonomous geospatial intelligence system engineered for multi-sensor satellite imagery analysis. It ingests optical multispectral imagery (Sentinel-2 MSI) and synthetic aperture radar (SAR Sentinel-1 GRD) rasters, dynamically extracts authentic GeoTIFF metadata (CRS, resolution, acquisition date, and spectral bands), and executes grounded remote sensing workflows with natural language querying. 

It features **Automatic Satellite Data Retrieval** from open STAC catalogs (AWS Earth Search / Element 84), an interactive Leaflet map with geocoding, bi-temporal change detection with swipe-comparison heatmaps, and a modern design supporting both **Dark and Light modes**.

---

## 🌟 Key Features

### 1. 🛰️ Automatic Live Satellite Data Retrieval (AWS STAC API)
* **Live STAC Catalog Search**: Directly queries the open [AWS Earth Search](https://earth-search.aws.element84.com/v1) STAC v1.0.0 API to search Sentinel-2 L2A (Surface Reflectance) and Sentinel-1 GRD (SAR) data worldwide — **no paid API token required**.
* **Dual Location Controls (Dropdown & Direct Input)**:
  * **Quick Preset Dropdown**: Immediate selection of major Indian cities (**Mumbai, Delhi, Bengaluru, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad, Jaipur, Surat, Lucknow, Kochi, Goa**).
  * **Direct Location Input Field**: Type any city, region name, or coordinate pair (e.g. *"Pune"*, *"Jaipur"*, *"18.52, 73.85"*), and click **Locate** (or press `Enter`) to automatically geocode and center the map.
  * **Granular Bounding Box Coordinates**: Real-time display and manual editing of West, South, East, and North coordinates.
* **Filter Controls**: Configurable date range pickers and a max cloud cover slider (0%–100%).
* **Intelligent Scene Selection**:
  * Select **1 scene** for single-image VQA & spectral clustering.
  * Select **2 optical scenes** for multi-temporal Change Detection.
  * Select **1 Optical + 1 SAR scene** for cross-sensor visible/microwave fusion.
* **Background Download & Validation**: Download scenes asynchronously with live progress tracking, validated by the `SatelliteValidator` engine before ingestion.
* **⚡ Offline Sample Fallback**: Instant test mode via the *"Load Sample Preset"* button if network connectivity to STAC is limited.

### 2. 📡 Multi-Sensor Satellite Imagery Analysis
* **🛰️ Optical Multispectral Imagery**: GeoTIFF (`.tif`/`.tiff`), PNG, and JPG ingestion with Sentinel-2 MSI band recognition (RGB, NIR, Surface Reflectance).
* **📻 Synthetic Aperture Radar (SAR)**: Ingestion of Sentinel-1 C-Band SAR rasters (VV, VH polarizations) for all-weather, cloud-penetrating structural and hydrological mapping.
* **🔄 Bi-temporal Change Detection**: Surface reflectance diffing between Baseline (T1) and Analysis (T2) scenes to reveal flood extent, construction grading, and vegetative shifts.
* **🔗 Optical + SAR Cross-Sensor Fusion**: Synergistic pairing of surface optical bands with active radar microwave backscatter for comprehensive ground assessment.

### 3. 🗺️ Interactive GIS Viewer & Difference Overlays
* **Translucent Red Heatmap Overlay (`#ef4444`)**: Highlights high-probability change areas, building footprints, and radar reflectors with sharp contrast.
* **SwipeViewer**: Split-screen comparative slider allowing real-time swiping between baseline imagery and the classified output.
* **Layer Toggles**: One-click toggling of `[ 👁 Heatmap Overlay ]` and `[ 📦 Binary Change Mask ]`.

### 4. 🌗 Full-Width Responsive UI with Dark & Light Themes
* **Full-Width Edge-to-Edge Design**: Zero side gaps; the interactive Leaflet map and results grid dynamically expand to fill any monitor resolution.
* **Theme Support**: Seamless toggling between **Dark Mode** (deep space navy palette) and **Light Mode** (high-contrast slate & snow palette) with crystal-clear typography.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SatQuery AI Frontend (React 18 + Vite)          │
│          TypeScript  •  Vanilla CSS Design Tokens  •  React Leaflet    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON / Multipart
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Application                      │
│            Python 3.11  •  Uvicorn  •  Pydantic  •  Pillow  •  NumPy    │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
     ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────┐
     │ Geospatial Tag   │ │ Pipeline Router  │ │ Satellite Engine  │
     │ Parser (tifffile)│ │ • Change Engine  │ │ • EarthSearch STAC│
     │ • CRS / EPSG     │ │ • SAR Structural │ │ • Geo-Validator   │
     │ • GSD Resolution │ │ • Cross Fusion   │ │ • Async Downloader│
     │ • Sensor Bands   │ │ • Spectral VQA   │ │ • Fallback Preset │
     └──────────────────┘ └──────────────────┘ └───────────────────┘
```

---

## ☁️ Deployment on Render

This repository is pre-configured for seamless deployment on [Render](https://render.com) using the included `Dockerfile` and `render.yaml`.

Repository URL: **`https://github.com/Bhargavprasad-data/Sat-AI.git`**

### Method 1: Docker Web Service (Recommended — Single Free Tier Service)

Deploy the entire full-stack app (React frontend + FastAPI backend) in a single service:

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/Bhargavprasad-data/Sat-AI.git`.
4. Configure the service settings:
   * **Name**: `sat-ai`
   * **Region**: Any (e.g. *Oregon, US West* or *Frankfurt, EU*)
   * **Branch**: `main`
   * **Runtime**: **Docker**
   * **Instance Type**: **Free**
5. (Optional) Under **Environment Variables**, add:
   * `SATELLITE_PROVIDER` = `aws_earth_search`
   * `PYTHONUNBUFFERED` = `1`
6. Click **Deploy Web Service**.
Render will automatically build the React frontend using the multi-stage `Dockerfile`, start Uvicorn, and serve your app at `https://sat-ai.onrender.com`.

---

### Method 2: Render Blueprint (`render.yaml`)

1. In Render Dashboard, click **Blueprints** → **New Blueprint Instance**.
2. Select your repository `https://github.com/Bhargavprasad-data/Sat-AI.git`.
3. Render will read `render.yaml` and set up the service with zero manual configuration.
4. Click **Apply**.

---

### Method 3: Native Python Web Service (Without Docker)

If you prefer using Render's native Python runtime:

1. Click **New +** → **Web Service**.
2. Select **Runtime**: **Python**.
3. **Build Command**:
   ```bash
   npm install --prefix frontend && npm run build --prefix frontend && pip install -r requirements.txt && python create_demo_data.py
   ```
4. **Start Command**:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
5. **Environment Variables**:
   * `NODE_VERSION` = `20.11.0`
   * `PYTHON_VERSION` = `3.11.8`
   * `SATELLITE_PROVIDER` = `aws_earth_search`

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: `v18+` or `v20+`
* **Python**: `3.10+` or `3.11+`
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Bhargavprasad-data/Sat-AI.git
cd Sat-AI
```

### 2. Install Dependencies

#### Python Backend:
```bash
pip install -r requirements.txt
python create_demo_data.py
```

#### React Frontend:
```bash
cd frontend
npm install
cd ..
```

### 3. Run the Development Servers

#### Option A: Running from root (simultaneous terminals)
```bash
# Terminal 1: Backend API (Port 8000)
npm run dev:backend

# Terminal 2: Frontend Client (Port 5173)
npm run dev:frontend
```

#### Option B: Direct commands
```bash
# Start backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# In another terminal, start frontend
cd frontend
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🛰️ Using Automatic Satellite Retrieval

1. Open the sidebar and click **Satellite Search** (compass/satellite icon).
2. **Choose Area of Interest**:
   * Pick a city from the **Quick Preset** dropdown (*Mumbai, Delhi, Bengaluru, etc.*), OR
   * Type any city or location into the input box (*e.g. "Pune"* or *"18.52, 73.85"*) and click **Locate**.
3. **Set Acquisition Filter**:
   * Choose start & end dates.
   * Pick platform: Sentinel-2 (Optical) or Sentinel-1 (SAR).
   * Adjust max cloud cover threshold.
4. Click **Search Satellite Data**.
5. Select 1 or 2 scenes from the live search results grid.
6. Click **Use Selected Data** to automatically ingest the scenes into the workspace and trigger geospatial analysis.

---

## 📡 API Endpoints

### Core Analysis Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/demo/scenarios` | Lists prepared demonstration scenarios |
| `GET` | `/api/demo/scenarios/{id}` | Fetches scenario metadata and rasters |
| `POST` | `/api/demo/upload` | Upload custom `.tif`, `.png`, or `.jpg` raster |
| `POST` | `/api/demo/run` | Triggers agentic analysis pipeline (returns `job_id`) |
| `GET` | `/api/demo/jobs/{job_id}` | Polls pipeline execution progress |
| `GET` | `/api/demo/results/{job_id}` | Retrieves final results, heatmaps, and evidence |

### Satellite Retrieval Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/satellite/sources` | Lists supported satellite collections |
| `POST` | `/api/satellite/search` | Queries STAC catalogue with Bbox, dates, platform |
| `POST` | `/api/satellite/download` | Asynchronously downloads scene raster |
| `GET` | `/api/satellite/jobs/{id}` | Checks download and validation job progress |

---

## 📁 Repository Structure

```
Sat-AI/
├── backend/
│   ├── main.py                     # FastAPI server, metadata parser, pipelines & static mount
│   ├── package.json                # Backend scripts
│   ├── requirements.txt            # Python dependencies
│   └── providers/
│       ├── base.py                 # SatelliteProvider base classes and models
│       ├── earth_search_provider.py# AWS Earth Search STAC v1.0.0 integration
│       └── validator.py            # GeoTIFF integrity & compatibility validator
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend scripts and packages
│   ├── vite.config.ts              # Vite proxy configuration
│   └── src/
│       ├── App.tsx                 # Root application component & theme synchronization
│       ├── index.css               # Design system tokens, light/dark themes, full-width rules
│       └── components/
│           ├── Workspace.tsx       # Core orchestrator component
│           ├── SatelliteSearchSection.tsx # STAC UI with Leaflet map, geocoding & presets
│           ├── Sidebar.tsx         # Navigation drawer
│           ├── TopBar.tsx          # Status indicators & Dark/Light mode toggle
│           ├── SwipeViewer.tsx     # Comparison swipe slider with difference overlay
│           ├── EvidencePanel.tsx   # GIS metrics & classification summary
│           └── ExecutionTrace.tsx  # Multi-stage reasoning pipeline tracer
├── demo-data/                      # Pre-bundled verified sample datasets
├── create_demo_data.py             # Procedural demo data generator
├── Dockerfile                      # Multi-stage production container for Render
├── render.yaml                     # Render Blueprint specification
├── requirements.txt                # Root Python dependencies
└── README.md                       # Documentation
```

---

## 📄 License
Distributed under the **MIT License**.
