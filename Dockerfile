# ==============================================================================
# Multi-Stage Dockerfile for SatQuery AI (FastAPI + React/Vite Unified Service)
# ==============================================================================

# Stage 1: Build the React TypeScript Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend Service
FROM python:3.11-slim
WORKDIR /app

# Install basic system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files and demo data generator
COPY backend/ ./backend/
COPY demo-data/ ./demo-data/
COPY create_demo_data.py .

# Generate verified demo datasets
RUN python create_demo_data.py

# Copy compiled frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Default port for Render
ENV PORT=10000
EXPOSE 10000

# Launch Uvicorn
CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
