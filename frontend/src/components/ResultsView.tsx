import { useState } from 'react';
import type { FC } from 'react';
import {
  Download,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Ruler,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import type { AnalysisResult } from '../types';
import { SwipeViewer } from './SwipeViewer';
import { ResultsCharts } from './ResultsCharts';
import { ResultsReport } from './ResultsReport';
import { ResultsHistory } from './ResultsHistory';
import { ResultsChangeMap } from './ResultsChangeMap';

interface ResultsViewProps {
  result: AnalysisResult;
  viewerConfig: {
    leftImage: string;
    rightImage: string;
    leftLabel: string;
    rightLabel: string;
    heatmapOverlay?: string;
    changeMask?: string;
    isMultimodal?: boolean;
    segmentationOverlay?: string;
  };
  historyRuns: AnalysisResult[];
  onSelectRun: (run: AnalysisResult) => void;
  onBackToConfig?: () => void;
  activeTab?: ResultTab;
  onSelectTab?: (tab: ResultTab) => void;
}

export type ResultTab = 'region' | 'mask' | 'charts' | 'report' | 'trace';

export const ResultsView: FC<ResultsViewProps> = ({
  result,
  viewerConfig,
  historyRuns,
  onSelectRun,
  onBackToConfig: _onBackToConfig,
  activeTab: controlledActiveTab,
  onSelectTab,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<ResultTab>('region');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = (tab: ResultTab) => {
    setInternalActiveTab(tab);
    onSelectTab?.(tab);
  };
  const viewMode = 'side_by_side';

  // Dynamic Year Computation (e.g. 2024 and 2025, or 2023 and 2024, or 2002 and 2003):
  const rawDate1 = result.evidence?.geospatial_metadata_1?.date || '2024-04-10';
  const match1 = rawDate1.match(/\b(19\d\d|20\d\d)\b/);
  const year1 = match1 ? parseInt(match1[1], 10) : 2024;

  const rawDate2 = result.evidence?.geospatial_metadata_2?.date;
  const match2 = rawDate2 ? rawDate2.match(/\b(19\d\d|20\d\d)\b/) : null;
  let year2 = match2 ? parseInt(match2[1], 10) : year1 + 1;
  if (year2 <= year1) {
    year2 = year1 + 1;
  }

  const stats = result.statistics;
  const areaKm2 = stats.area_km2 || '2.34 km²';
  const increasePct = stats.percentage_change || '36.8%';
  const confidencePct = stats.confidence_score || '93%';

  const handleDownloadReport = () => {
    setActiveTab('report');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="results-view-wrapper">
      {/* TAB CONTENT (Tabs are located in the Left Sidebar) */}

      {/* 2. TAB CONTENT (Tabs are now situated in the Left Sidebar) */}

      {/* TAB 1: Highlighted Region (Matches Screenshot 1) */}
      {activeTab === 'region' && (
        <div className="result-screenshot1-layout">
          {/* Main Visual Imagery Container */}
          <div className="imagery-display-container">
            {/* Mode A: Side-by-Side Dual Scene Grid */}
            {viewMode === 'side_by_side' ? (
              <div className="side-by-side-grid">
                {/* Left Card: Baseline Year */}
                <div className="side-scene-card">
                  <div className="scene-year-badge">
                    <span>{year1}</span>
                  </div>
                  <img
                    src={viewerConfig.leftImage}
                    alt={viewerConfig.leftLabel}
                    className="scene-preview-img"
                  />
                  <div className="scene-caption">{viewerConfig.leftLabel || `Baseline (${year1})`}</div>
                </div>

                {/* Right Card: Comparison Year with Red Highlighted Region Overlay */}
                <div className="side-scene-card highlighted-scene">
                  <div className="scene-year-badge highlighted">
                    <span>{year2}</span>
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {/* Base raster */}
                    <img
                      src={viewerConfig.rightImage}
                      alt={viewerConfig.rightLabel}
                      className="scene-preview-img"
                    />
                    {/* Signature Translucent Red Heatmap Overlay */}
                    {viewerConfig.heatmapOverlay && (
                      <img
                        src={viewerConfig.heatmapOverlay}
                        alt="Highlighted Region Overlay"
                        className="scene-preview-img"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          pointerEvents: 'none',
                          mixBlendMode: 'screen',
                          opacity: 0.95,
                        }}
                      />
                    )}
                  </div>
                  <div className="scene-caption">{viewerConfig.rightLabel} (Highlighted Differences)</div>
                </div>
              </div>
            ) : (
              /* Mode B: SwipeViewer with Slider */
              <SwipeViewer
                leftImage={viewerConfig.leftImage}
                rightImage={viewerConfig.rightImage}
                leftLabel={viewerConfig.leftLabel}
                rightLabel={viewerConfig.rightLabel}
                heatmapOverlay={viewerConfig.heatmapOverlay}
                changeMask={viewerConfig.changeMask}
                isMultimodal={viewerConfig.isMultimodal}
              />
            )}
          </div>

          {/* Right Panel: Premium "Analysis Result" Card */}
          <div className="analysis-result-panel premium-glass-card">
            <div className="panel-header-row">
              <div className="panel-header-title-group">
                <div className="panel-header-badge">
                  <Sparkles size={11} className="sparkle-spin" />
                  <span>AI INFERENCE</span>
                </div>
                <h3 className="panel-header-title">Analysis Result</h3>
              </div>
              <div className="signal-bars-badge" title="High Confidence Detection Signal">
                <span className="signal-bar bar-1" />
                <span className="signal-bar bar-2" />
                <span className="signal-bar bar-3" />
              </div>
            </div>

            {/* 3 Modern KPI Metric Tiles (Stacked for high clarity and zero overflow) */}
            <div className="result-kpi-list">
              {/* Tile 1: Area */}
              <div className="kpi-tile kpi-area">
                <div className="kpi-tile-icon-box">
                  <Ruler size={16} />
                </div>
                <div className="kpi-tile-info">
                  <div className="kpi-tile-label">Impact Area</div>
                  <div className="kpi-tile-subtext">Spatial Footprint</div>
                </div>
                <div className="kpi-tile-value">{areaKm2}</div>
              </div>

              {/* Tile 2: Increase / Shift */}
              <div className="kpi-tile kpi-increase">
                <div className="kpi-tile-icon-box">
                  <TrendingUp size={16} />
                </div>
                <div className="kpi-tile-info">
                  <div className="kpi-tile-label">Surface Shift</div>
                  <div className="kpi-tile-subtext">Relative Delta</div>
                </div>
                <div className="kpi-tile-value">{increasePct.startsWith('+') ? increasePct : `+${increasePct}`}</div>
              </div>

              {/* Tile 3: Confidence */}
              <div className="kpi-tile kpi-confidence">
                <div className="kpi-tile-icon-box">
                  <ShieldCheck size={16} />
                </div>
                <div className="kpi-tile-info">
                  <div className="kpi-tile-label">Model Confidence</div>
                  <div className="kpi-tile-meter-track">
                    <div
                      className="kpi-tile-meter-fill"
                      style={{ width: confidencePct.includes('%') ? confidencePct : `${confidencePct}%` }}
                    />
                  </div>
                </div>
                <div className="kpi-tile-value">{confidencePct}</div>
              </div>
            </div>

            {/* Mini Heatmap Preview Card */}
            <div className="mini-preview-card">
              <div className="preview-chip">
                <Layers size={11} />
                <span>Detection Mask Overlay</span>
              </div>
              <div className="preview-img-frame">
                <img
                  src={viewerConfig.rightImage}
                  alt="Mini map base"
                  className="preview-base-img"
                />
                {viewerConfig.heatmapOverlay && (
                  <img
                    src={viewerConfig.heatmapOverlay}
                    alt="Mini heatmap overlay"
                    className="preview-overlay-img"
                  />
                )}
              </div>
            </div>

            {/* Download Report Button */}
            <button className="btn-download-report-premium" onClick={handleDownloadReport}>
              <Download size={15} />
              <span>Download Official Report</span>
              <ArrowUpRight size={13} className="btn-arrow-icon" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Change Map (Raw Ground-Truth Mask & Overlays) */}
      {activeTab === 'mask' && (
        <ResultsChangeMap
          result={result}
          viewerConfig={viewerConfig}
        />
      )}

      {/* TAB 3: Area / Percentage (Graphs & Bar Charts) */}
      {activeTab === 'charts' && <ResultsCharts result={result} />}

      {/* TAB 4: Confidence Score & Reports */}
      {activeTab === 'report' && <ResultsReport result={result} viewerConfig={viewerConfig} />}

      {/* TAB 5: Execution Trace & History */}
      {activeTab === 'trace' && (
        <ResultsHistory
          currentResult={result}
          historyRuns={historyRuns}
          onSelectRun={onSelectRun}
        />
      )}
    </div>
  );
};
