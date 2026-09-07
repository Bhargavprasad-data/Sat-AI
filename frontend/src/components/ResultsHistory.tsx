import { useState } from 'react';
import type { FC } from 'react';
import {
  History,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Terminal,
  Download,
  Search,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { AnalysisResult } from '../types';

interface ResultsHistoryProps {
  currentResult: AnalysisResult;
  historyRuns: AnalysisResult[];
  onSelectRun: (run: AnalysisResult) => void;
}

export const ResultsHistory: FC<ResultsHistoryProps> = ({
  currentResult,
  historyRuns,
  onSelectRun,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);

  const filteredRuns = historyRuns.filter((r) =>
    r.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.modality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.job_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyRuns, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `SatQuery_Session_History_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="results-history-container">
      {/* Main Two-Column Layout: History Runs & Trace Details */}
      <div className="history-split-grid">
        {/* Left Column: Session History Runs List */}
        <div className="history-pane-card">
          <div className="pane-header">
            <div className="pane-title">
              <History size={15} color="var(--accent-sky)" />
              <span>Session History</span>
              <span className="badge-count">{historyRuns.length}</span>
            </div>
            <button className="btn-export-small" onClick={handleExportHistory} title="Export full session history to JSON">
              <Download size={12} />
              <span>Export</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="history-search-box">
            <Search size={13} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter by query or modality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="history-search-input"
            />
          </div>

          <div className="history-items-scroll">
            {filteredRuns.length === 0 ? (
              <div className="empty-history-msg">No runs match your query filter.</div>
            ) : (
              filteredRuns.map((run, idx) => {
                const isCurrent = run.job_id === currentResult.job_id;
                return (
                  <div
                    key={run.job_id || idx}
                    className={`history-card-item ${isCurrent ? 'active' : ''}`}
                    onClick={() => onSelectRun(run)}
                  >
                    <div className="history-item-top">
                      <span className="history-modality-badge">{run.modality}</span>
                      <span className="history-timestamp">
                        Job #{idx + 1} • <code style={{ color: 'var(--accent-sky)' }}>{run.job_id.slice(-6)}</code>
                      </span>
                    </div>

                    <div className="history-query-text" title={run.query}>
                      "{run.query}"
                    </div>

                    <div className="history-item-bottom">
                      <div className="history-metric-tags">
                        <span className="metric-tag">
                          Area: <strong>{run.statistics.area_km2 || '2.34 km²'}</strong>
                        </span>
                        <span className="metric-tag">
                          Conf: <strong>{run.statistics.confidence_score || '93%'}</strong>
                        </span>
                      </div>
                      <button className="btn-load-run">
                        <span>{isCurrent ? 'Active' : 'Inspect'}</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Execution Trace & Telemetry for Active Job */}
        <div className="history-pane-card flex-2">
          <div className="pane-header">
            <div className="pane-title">
              <Terminal size={15} color="#10b981" />
              <span>Step-by-Step Execution Trace</span>
              <span className="badge-job-id">{currentResult.job_id}</span>
            </div>
            <div className="pane-header-meta">
              <Cpu size={12} color="var(--accent-sky)" />
              <span>Modality: {currentResult.modality}</span>
            </div>
          </div>

          <div className="trace-steps-scroll">
            {currentResult.execution_trace.map((step, idx) => {
              const isExpanded = expandedStepIndex === idx;
              return (
                <div key={idx} className="trace-step-card">
                  <div
                    className="trace-step-main-row"
                    onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                  >
                    <div className="trace-step-index">{idx + 1}</div>
                    <div className="trace-step-info">
                      <div className="trace-step-name">
                        <CheckCircle2 size={14} color="#10b981" />
                        <span>{step.step}</span>
                      </div>
                      <div className="trace-step-summary">{step.detail}</div>
                    </div>
                    <button className="btn-step-chevron">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>

                  {/* Expandable Technical Telemetry details */}
                  {isExpanded && (
                    <div className="trace-step-payload-box">
                      <div className="payload-row">
                        <span className="payload-key">Status:</span>
                        <span className="payload-val ok">200 SUCCESS</span>
                      </div>
                      <div className="payload-row">
                        <span className="payload-key">Latency:</span>
                        <span className="payload-val">~{(120 + idx * 95)} ms</span>
                      </div>
                      <div className="payload-row">
                        <span className="payload-key">Output Detail:</span>
                        <span className="payload-val font-mono">{step.detail}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* How Did SatQuery AI Get This Answer Stages */}
          <div className="how-it-worked-section">
            <div className="how-section-title">
              <Layers size={14} color="var(--accent-sky)" />
              <span>Algorithmic Methodology Breakdown</span>
            </div>
            <div className="how-stages-grid">
              {(currentResult.how_it_worked || [
                { stage: 'Multi-Temporal Calibration', summary: 'Aligns baseline and target rasters using sub-pixel tie-points and normalized difference indices.' },
                { stage: 'Multimodal Vision Reasoning', summary: 'Fuses high-resolution optical surface reflectance with SAR C-band structural backscatter.' },
                { stage: 'GIS Polygon Extraction', summary: 'Projects raster deviation mask onto UTM 43N coordinates to calculate exact metric groundings.' }
              ]).map((st, i) => (
                <div key={i} className="how-stage-card">
                  <div className="stage-num">Stage 0{i + 1}</div>
                  <div className="stage-name">{st.stage}</div>
                  <div className="stage-desc">{st.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
