import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import {
  Globe,
  Layers,
  Cpu,
  BarChart3,
  FileText,
  CheckCircle2,
  Activity,
  Zap,
  Radio,
  Sparkles
} from 'lucide-react';

interface PipelineGraphLoaderProps {
  progressPercent: number;
  processingStage: string;
  scenarioTitle?: string;
}

interface GraphNode {
  id: string;
  number: string;
  title: string;
  tag: string;
  desc: string;
  icon: typeof Globe;
  accentColor: string;
  activeThreshold: number;
  completeThreshold: number;
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: 'node_crs',
    number: '01',
    title: 'Spatial & CRS',
    tag: 'EPSG:32643',
    desc: 'WGS 84 / UTM 43N orthorectification',
    icon: Globe,
    accentColor: 'var(--accent-sky)',
    activeThreshold: 0,
    completeThreshold: 20,
  },
  {
    id: 'node_bands',
    number: '02',
    title: 'Spectral Calibration',
    tag: 'Band Math',
    desc: 'Radiometric & backscatter calibration',
    icon: Layers,
    accentColor: 'var(--accent-emerald)',
    activeThreshold: 20,
    completeThreshold: 40,
  },
  {
    id: 'node_neural',
    number: '03',
    title: 'Neural Tensors',
    tag: 'Deep Models',
    desc: 'Feature extraction & delta tensors',
    icon: Cpu,
    accentColor: '#a855f7',
    activeThreshold: 40,
    completeThreshold: 65,
  },
  {
    id: 'node_gis',
    number: '04',
    title: 'GIS Topology',
    tag: 'Vector Polygons',
    desc: 'Spatial polygon area clustering',
    icon: BarChart3,
    accentColor: '#f59e0b',
    activeThreshold: 65,
    completeThreshold: 85,
  },
  {
    id: 'node_dossier',
    number: '05',
    title: 'CEOS Dossier',
    tag: 'ISO 19115-1',
    desc: 'Executive report & intelligence synthesis',
    icon: FileText,
    accentColor: '#f43f5e',
    activeThreshold: 85,
    completeThreshold: 100,
  },
];

export const PipelineGraphLoader: FC<PipelineGraphLoaderProps> = ({
  progressPercent,
  processingStage,
  scenarioTitle,
}) => {
  const [wavePhase, setWavePhase] = useState<number>(0);

  useEffect(() => {
    const animInterval = setInterval(() => {
      setWavePhase((prev) => (prev + 0.15) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(animInterval);
  }, []);

  const generateWavePath = (amplitude: number, frequency: number, phaseOffset: number, yOffset: number) => {
    const points: string[] = [];
    const width = 1200;
    for (let x = 0; x <= width; x += 15) {
      const y = yOffset + Math.sin(x * frequency + wavePhase + phaseOffset) * amplitude;
      points.push(`${x === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  const wavePath1 = generateWavePath(9, 0.016, 0, 23);
  const wavePath2 = generateWavePath(6, 0.025, Math.PI / 3, 23);

  return (
    <div className="pipeline-graph-loader-card">
      {/* 1. Header Bar with Radar Pulse & Live Progress */}
      <div className="pgl-header">
        <div className="pgl-title-col">
          <div className="pgl-badge-row">
            <span className="pgl-live-badge">
              <span className="pgl-radar-dot"></span>
              <span>GRAPH EXECUTION ACTIVE</span>
            </span>
            <span className="pgl-meta-badge">
              <Activity size={12} color="var(--accent-sky)" />
              <span>DAG V2.4</span>
            </span>
            {scenarioTitle && (
              <span className="pgl-scenario-pill">
                {scenarioTitle}
              </span>
            )}
          </div>
          <h2 className="pgl-main-title">
            SatQuery AI • Neural Pipeline Graph Execution
          </h2>
        </div>

        <div className="pgl-progress-col">
          <div className="pgl-percent-row">
            <span className="pgl-percent-label">Pipeline Progress</span>
            <span className="pgl-percent-number">{progressPercent}%</span>
          </div>
          <div className="pgl-track">
            <div className="pgl-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. Active Phase Subtitle */}
      <div className="pgl-phase-indicator">
        <div className="pgl-phase-left">
          <Sparkles size={14} color="var(--accent-sky)" />
          <span>Current Phase:</span>
          <strong>{processingStage || 'Initializing execution graph...'}</strong>
        </div>
        <div className="pgl-phase-right">
          <span className="pgl-telemetry-chip">
            <Zap size={11} color="#34d399" />
            <span>WebGPU Tensor DMA</span>
          </span>
          <span className="pgl-telemetry-chip">
            <Radio size={11} color="#38bdf8" />
            <span>10.0m Sentinel MSI/SAR</span>
          </span>
        </div>
      </div>

      {/* 3. Interactive DAG Computational Graph Nodes & Connecting Edges */}
      <div className="pgl-graph-canvas">
        <div className="pgl-nodes-grid">
          {GRAPH_NODES.map((node, index) => {
            const isCompleted = progressPercent >= node.completeThreshold;
            const isActive = !isCompleted && progressPercent >= node.activeThreshold;
            const NodeIcon = node.icon;

            return (
              <React.Fragment key={node.id}>
                {/* Graph Node Card */}
                <div
                  className={`pgl-node-card ${
                    isCompleted ? 'completed' : isActive ? 'active' : 'queued'
                  }`}
                  style={{
                    borderColor: isCompleted
                      ? 'rgba(16, 185, 129, 0.45)'
                      : isActive
                      ? node.accentColor
                      : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {/* Node Header */}
                  <div className="pgl-node-top">
                    <span className="pgl-node-number">NODE {node.number}</span>
                    <span
                      className={`pgl-node-status-badge ${
                        isCompleted ? 'done' : isActive ? 'running' : 'wait'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={11} color="var(--accent-emerald)" />
                          <span>DONE</span>
                        </>
                      ) : isActive ? (
                        <>
                          <span className="pgl-pulse-ring"></span>
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <span>QUEUED</span>
                      )}
                    </span>
                  </div>

                  {/* Node Icon & Title */}
                  <div className="pgl-node-body">
                    <div
                      className="pgl-node-icon-box"
                      style={{
                        color: isCompleted
                          ? 'var(--accent-emerald)'
                          : isActive
                          ? node.accentColor
                          : 'var(--text-muted)',
                        background: isCompleted
                          ? 'rgba(16, 185, 129, 0.12)'
                          : isActive
                          ? 'rgba(56, 189, 248, 0.14)'
                          : 'rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      <NodeIcon size={14} />
                    </div>
                    <div>
                      <div className="pgl-node-title">{node.title}</div>
                      <div className="pgl-node-tag">{node.tag}</div>
                    </div>
                  </div>

                  {/* Node Description */}
                  <div className="pgl-node-desc">{node.desc}</div>

                  {/* Active scanning bar for active node */}
                  {isActive && (
                    <div className="pgl-node-scan-line">
                      <div className="pgl-scan-beam" style={{ background: node.accentColor }}></div>
                    </div>
                  )}
                </div>

                {/* Connecting Graph Edge between adjacent nodes */}
                {index < GRAPH_NODES.length - 1 && (
                  <div className="pgl-connector-col">
                    <svg
                      className="pgl-connector-svg"
                      width="20"
                      height="14"
                      viewBox="0 0 20 14"
                      fill="none"
                    >
                      <path
                        d="M 2 7 L 16 7"
                        stroke={
                          isCompleted
                            ? '#10b981'
                            : isActive
                            ? 'url(#connector-gradient)'
                            : 'rgba(255, 255, 255, 0.12)'
                        }
                        strokeWidth="1.5"
                        strokeDasharray={isActive ? '3 2' : 'none'}
                        className={isActive ? 'pgl-flowing-edge' : ''}
                      />
                      <path
                        d="M 12 4 L 16 7 L 12 10"
                        stroke={
                          isCompleted
                            ? '#10b981'
                            : isActive
                            ? '#38bdf8'
                            : 'rgba(255, 255, 255, 0.18)'
                        }
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 4. Real-Time Spectral Waveform & Telemetry Oscilloscope Graph */}
      <div className="pgl-oscilloscope-container">
        <div className="pgl-oscilloscope-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} color="var(--accent-sky)" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fff', letterSpacing: '0.4px' }}>
              REAL-TIME SENSOR SPECTRAL / RADAR WAVEFORM GRAPH
            </span>
          </div>
          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            4.2 GHz C-Band • BOA Reflectance λ (400-900nm)
          </span>
        </div>

        <div className="pgl-oscilloscope-canvas-wrap">
          <svg className="pgl-wave-svg" viewBox="0 0 1200 46" preserveAspectRatio="none">
            {/* Horizontal reference grid lines */}
            <line x1="0" y1="11" x2="1200" y2="11" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
            <line x1="0" y1="23" x2="1200" y2="23" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="1" />
            <line x1="0" y1="35" x2="1200" y2="35" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />

            {/* Vertical coordinate marks */}
            {[120, 240, 360, 480, 600, 720, 840, 960, 1080].map((vx) => (
              <line
                key={vx}
                x1={vx}
                y1="0"
                x2={vx}
                y2="46"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeDasharray="2 3"
              />
            ))}

            <defs>
              <linearGradient id="wave1-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="wave2-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.55" />
              </linearGradient>
            </defs>

            <path
              d={wavePath2}
              fill="none"
              stroke="url(#wave2-gradient)"
              strokeWidth="1.3"
              strokeDasharray="2 2"
            />

            <path
              d={wavePath1}
              fill="none"
              stroke="url(#wave1-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 5. Live Telemetry Strip */}
        <div className="pgl-telemetry-strip">
          <div className="pgl-telem-item">
            <span className="pgl-telem-k">CO-REGISTRATION:</span>
            <span className="pgl-telem-v" style={{ color: 'var(--accent-emerald)' }}>
              RMSE 0.12px • CALIBRATED
            </span>
          </div>
          <div className="pgl-telem-item">
            <span className="pgl-telem-k">SPECTRAL INDEX:</span>
            <span className="pgl-telem-v" style={{ color: 'var(--accent-sky)' }}>
              NDVI + NDWI Tensors (10m)
            </span>
          </div>
          <div className="pgl-telem-item">
            <span className="pgl-telem-k">THROUGHPUT:</span>
            <span className="pgl-telem-v" style={{ color: '#a855f7' }}>
              4.8 GB/s Streaming
            </span>
          </div>
          <div className="pgl-telem-item">
            <span className="pgl-telem-k">CONFIDENCE:</span>
            <span className="pgl-telem-v" style={{ color: '#f59e0b' }}>
              93.4% Level-2A BOA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
