import type { FC } from 'react';
import { ArrowRight, Eye, RefreshCw, Radio, Cpu, FileCheck, MapPin, CheckCircle } from 'lucide-react';

interface LandingSectionProps {
  onStartAnalysis: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const LandingSection: FC<LandingSectionProps> = ({

  onStartAnalysis,
  onSelectScenario,
}) => {
  return (
    <section className="hero-container">
      <div className="hero-grid">
        <div>
          <div className="hero-badge">
            Smart India Hackathon 2026 • Government Evaluation Demo
          </div>
          <h1 className="hero-title">SatQuery AI</h1>
          <div className="hero-tagline">
            Ask questions. Analyze satellite imagery. Get evidence.
          </div>
          <p className="hero-desc">
            An agentic geospatial intelligence assistant that converts natural language questions
            and satellite imagery into validated, GIS-aware insights — eliminating manual multi-tool remote sensing pipelines.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={onStartAnalysis}>
              Start Analysis <ArrowRight size={16} />
            </button>
          </div>

          <div className="capabilities-strip">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Demonstrated Capabilities:
            </span>
            <button
              className="capability-pill"
              onClick={() => onSelectScenario('scenario_a_vqa')}
              title="Click to load Optical VQA demo"
            >
              <Eye size={12} color="var(--accent-sky)" />
              Optical VQA
            </button>
            <button
              className="capability-pill"
              onClick={() => onSelectScenario('scenario_b_change')}
              title="Click to load Change Analysis demo"
            >
              <RefreshCw size={12} color="var(--accent-emerald)" />
              Bi-temporal Change Analysis
            </button>
            <button
              className="capability-pill"
              onClick={() => onSelectScenario('scenario_c_optical_sar')}
              title="Click to load Optical + SAR demo"
            >
              <Radio size={12} color="var(--accent-cyan)" />
              Optical + SAR Joint Analysis
            </button>
          </div>
        </div>

        <div>
          <div className="workflow-steps-card">
            <div className="workflow-header">
              Three-Step Autonomous Workflow
            </div>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div>
                  <div className="step-title">Upload Imagery</div>
                  <div className="step-desc">
                    Provide single-scene, bi-temporal, or multimodal (Optical/SAR) GeoTIFF or preview tiles.
                  </div>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div>
                  <div className="step-title">Ask in Plain Language</div>
                  <div className="step-desc">
                    Formulate queries without GIS jargon (e.g. "What changed between these two dates?").
                  </div>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div>
                  <div className="step-title">Analyze & Verify Evidence</div>
                  <div className="step-desc">
                    AI agent routes to the specialist model, validates CRS & alignment, and outputs auditable GIS evidence.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline (How it works) */}
      <div className="pipeline-visual-container">
        <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Autonomous Execution Pipeline:
        </div>
        <div className="pipeline-diagram">
          <div className="pipeline-node">
            <div className="pipeline-node-icon"><Eye size={16} /></div>
            <div className="pipeline-node-title">Images + Query</div>
            <div className="pipeline-node-sub">Optical / SAR / Dates</div>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon"><FileCheck size={16} /></div>
            <div className="pipeline-node-title">Input Validation</div>
            <div className="pipeline-node-sub">CRS, GSD & Co-reg</div>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon"><Cpu size={16} /></div>
            <div className="pipeline-node-title">AI Agent Router</div>
            <div className="pipeline-node-sub">Intent & Modality Parse</div>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon"><RefreshCw size={16} /></div>
            <div className="pipeline-node-title">Specialist Analysis</div>
            <div className="pipeline-node-sub">Diff / VQA / Fusion</div>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon"><CheckCircle size={16} /></div>
            <div className="pipeline-node-title">Validation & Evidence</div>
            <div className="pipeline-node-sub">Masks & Pixel Area</div>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon"><MapPin size={16} /></div>
            <div className="pipeline-node-title">GIS-Aware Answer</div>
            <div className="pipeline-node-sub">Evidence Grounded</div>
          </div>
        </div>
      </div>
    </section>
  );
};
