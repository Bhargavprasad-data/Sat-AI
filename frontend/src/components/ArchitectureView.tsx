import { useState } from 'react';
import type { FC } from 'react';
import { Server, Cpu, Layers, GitMerge, FileCheck, MapPin, Shield } from 'lucide-react';

interface ArchLayer {

  id: string;
  name: string;
  icon: any;
  purpose: string;
  phase0: string;
  phase2: string;
}

export const ArchitectureView: FC = () => {

  const [activeLayer, setActiveLayer] = useState<string>('agent-router');

  const layers: ArchLayer[] = [
    {
      id: 'ui-layer',
      name: 'Client Presentation Layer (React 18 + Vite + TypeScript)',
      icon: Layers,
      purpose: 'Provides executive government UI, multi-temporal swipe comparison maps, and auditable process inspectors.',
      phase0: 'Local single-page React app with zero cloud/auth dependencies, optimized for 1080p laptop projectors.',
      phase2: 'Micro-frontend architecture integrated into State GIS portals with WebGL 3D terrain rendering and Leaflet/MapLibre tiles.',
    },
    {
      id: 'api-layer',
      name: 'API Gateway & Job Orchestrator (FastAPI)',
      icon: Server,
      purpose: 'Ingests natural language queries and satellite tiles, coordinates asynchronous pipeline execution, and exposes REST endpoints.',
      phase0: 'Lightweight local Uvicorn process managing in-memory job queues and streaming real-feel progress.',
      phase2: 'Horizontally scaled FastAPI with Celery / Redis distributed queues, OAuth2 / OIDC government SSO, and rate-limiting.',
    },
    {
      id: 'validation-layer',
      name: 'Input & Geospatial Validation Engine',
      icon: FileCheck,
      purpose: 'Ensures spatial alignment, CRS consistency, identical Ground Sample Distance (GSD), and sub-pixel co-registration.',
      phase0: 'NumPy/Pillow spatial dimension verification, bounding box verification, and automatic histogram normalization.',
      phase2: 'Automated GCP (Ground Control Point) matching using SIFT/ORB, sensor-specific orthorectification, and atmospheric 6S correction.',
    },
    {
      id: 'agent-router',
      name: 'Agentic Task Router & Intent Classifier',
      icon: GitMerge,
      purpose: 'Determines the exact specialist analysis required from user intent tokens and available sensor modalities.',
      phase0: 'Deterministic rule-assisted semantic parser routing to VQA, Change Detection, or Optical+SAR baselines.',
      phase2: 'Local lightweight fine-tuned SLM (e.g. Llama-3-8B / Mistral) with JSON function-calling and autonomous multi-step GIS plan generation.',
    },
    {
      id: 'specialist-models',
      name: 'Specialist Remote Sensing Model Layer',
      icon: Cpu,
      purpose: 'Executes domain-specific algorithms on multispectral optical, SAR, or multi-temporal inputs.',
      phase0: 'CPU-friendly spectral difference vector arithmetic (Otsu thresholding) and multimodal band combinations.',
      phase2: 'Fine-tuned Siamese ChangeFormer, RemoteCLIP / EarthGPT vision-language models, and deep Cross-Attention SAR-Optical transformers.',
    },
    {
      id: 'gis-layer',
      name: 'Spatial Evidence & PostGIS Engine',
      icon: MapPin,
      purpose: 'Translates raw pixel activations into real-world geographic surface area (km²), bounding vectors, and administrative polygons.',
      phase0: 'Python pixel-to-metric calculations using sensor metadata (10m GSD), generating raster masks and quadrant localization.',
      phase2: 'PostgreSQL + PostGIS spatial queries, administrative boundary masking (Survey of India shapefiles), and GeoJSON export.',
    },
    {
      id: 'security-audit',
      name: 'Government Hardening & Audit Layer (Phase 2)',
      icon: Shield,
      purpose: 'Guarantees compliance with national geospatial data guidelines (National Geospatial Policy 2022).',
      phase0: 'Intentionally omitted for local evaluation demo — runs on localhost without network or auth overhead.',
      phase2: 'Role-Based Access Control (RBAC), tamper-evident cryptographic execution logs, and air-gapped secure cloud deployment.',
    },
  ];

  return (
    <div className="arch-page-container">
      <div className="arch-header">
        <h2 className="arch-title">System Technical Architecture</h2>
        <p className="arch-desc">
          Designed as an agentic geospatial platform that decouples natural language interaction
          from specialized remote sensing computation. Click any layer below to inspect its design.
        </p>
      </div>

      <div className="arch-pipeline-visual">
        {layers.map((layer) => {
          const IconComp = layer.icon;
          const isSelected = activeLayer === layer.id;

          return (
            <div
              key={layer.id}
              className="arch-layer-card"
              style={{
                borderColor: isSelected ? 'var(--accent-sky)' : undefined,
                background: isSelected ? 'rgba(30, 41, 59, 0.9)' : undefined,
              }}
              onClick={() => setActiveLayer(layer.id)}
            >
              <div className="arch-layer-header">
                <div className="arch-layer-title">
                  <IconComp size={18} color="var(--accent-cyan)" />
                  <span>{layer.name}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isSelected ? 'Selected' : 'Click to inspect'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {layer.purpose}
              </p>

              <div className="arch-layer-diff">
                <div className="diff-box phase0">
                  <div className="diff-title">Phase 0 (This Evaluation Demo)</div>
                  <div className="diff-desc">{layer.phase0}</div>
                </div>
                <div className="diff-box phase2">
                  <div className="diff-title">Phase 2 (Production Hardening)</div>
                  <div className="diff-desc">{layer.phase2}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
