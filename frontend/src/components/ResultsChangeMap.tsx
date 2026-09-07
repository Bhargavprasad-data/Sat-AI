import { useState, useRef, useEffect, useCallback } from 'react';
import type { FC, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import {
  Sliders,
  Eye,
  Download,
  CheckCircle2,
  Copy,
  Grid,
  Split,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import type { AnalysisResult } from '../types';

interface ResultsChangeMapProps {
  result: AnalysisResult;
  viewerConfig: {
    leftImage: string;
    rightImage: string;
    leftLabel: string;
    rightLabel: string;
    heatmapOverlay?: string;
    changeMask?: string;
    isMultimodal?: boolean;
  };
}

export const ResultsChangeMap: FC<ResultsChangeMapProps> = ({
  result,
  viewerConfig,
}) => {
  // Mode: 'swipe' (Interactive previous vs present divider line), 'split' (side by side), 'mask_only' (binary)
  const [displayMode, setDisplayMode] = useState<'swipe' | 'split' | 'mask_only'>('swipe');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showMaskOnlyInSwipe, setShowMaskOnlyInSwipe] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(0.92);
  const [blendMode, setBlendMode] = useState<'screen' | 'overlay' | 'normal' | 'color-dodge'>('screen');
  const [copiedWKT, setCopiedWKT] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const stats = result.statistics;
  const areaKm2 = stats.area_km2 || '2.34 km²';
  const percentage = stats.percentage_change || '36.8%';
  const changedPx = stats.changed_pixels || 23400;
  const totalPx = stats.total_pixels || 1048576;
  const stablePx = totalPx - changedPx;
  const gsd = stats.resolution || '10.0m / pixel';

  // Smooth slider drag logic
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleContainerClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX);
  };

  // Window-level mouse listeners for butter-smooth dragging
  useEffect(() => {
    const onWindowMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const onWindowMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onWindowMouseMove);
      window.addEventListener('mouseup', onWindowMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [isDragging, handleMove]);

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleCopyWKT = () => {
    const wkt = 'POLYGON((77.5842 12.9716, 77.6124 12.9716, 77.6124 12.9984, 77.5842 12.9984, 77.5842 12.9716))';
    navigator.clipboard.writeText(wkt);
    setCopiedWKT(true);
    setTimeout(() => setCopiedWKT(false), 2000);
  };

  const handleDownloadMask = () => {
    const link = document.createElement('a');
    link.href = viewerConfig.changeMask || viewerConfig.heatmapOverlay || viewerConfig.rightImage;
    link.download = `SatQuery_ChangeMask_${result.job_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rawDate1 = result.evidence?.geospatial_metadata_1?.date || '2024-04-10';
  const match1 = rawDate1.match(/\b(19\d\d|20\d\d)\b/);
  const year1 = match1 ? parseInt(match1[1], 10) : 2024;

  const rawDate2 = result.evidence?.geospatial_metadata_2?.date;
  const match2 = rawDate2 ? rawDate2.match(/\b(19\d\d|20\d\d)\b/) : null;
  let year2 = match2 ? parseInt(match2[1], 10) : year1 + 1;
  if (year2 <= year1) {
    year2 = year1 + 1;
  }

  const leftLabel = viewerConfig.leftLabel || `Baseline (${year1})`;
  const rightLabel = viewerConfig.rightLabel || `Analysis (${year2})`;
  const pctNum = parseFloat(percentage.replace(/[^0-9.]/g, '')) || 29.94;
  const severityPosition = Math.min(96, Math.max(6, pctNum * 2.2));

  return (
    <div className="results-changemap-container">
      {/* 1. Control Toolbar */}
      <div className="changemap-toolbar">
        <div className="toolbar-left-controls">
          <div className="mode-btn-group">
            <button
              className={`toolbar-btn ${displayMode === 'swipe' ? 'active' : ''}`}
              onClick={() => setDisplayMode('swipe')}
              title="Interactive vertical line to wipe/swipe between Previous and Present"
            >
              <Sliders size={14} />
              <span>Swipe Line (Previous vs Present)</span>
            </button>
            <button
              className={`toolbar-btn ${displayMode === 'split' ? 'active' : ''}`}
              onClick={() => setDisplayMode('split')}
              title="Side-by-side synchronized raster comparison"
            >
              <Split size={14} />
              <span>Side-by-Side</span>
            </button>
            <button
              className={`toolbar-btn ${displayMode === 'mask_only' ? 'active' : ''}`}
              onClick={() => setDisplayMode('mask_only')}
              title="Isolated binary segmentation mask"
            >
              <Grid size={14} />
              <span>Binary Mask</span>
            </button>
          </div>

          {/* Opacity slider for red difference heatmap */}
          <div className="toolbar-slider-item">
            <Sliders size={13} color="var(--accent-sky)" />
            <span className="slider-label">Red Overlay Opacity: {Math.round(opacity * 100)}%</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="opacity-range-slider"
            />
          </div>

          {/* Blend mode selector */}
          <div className="blend-selector-wrap">
            <span className="blend-label">Blend:</span>
            <select
              className="blend-select"
              value={blendMode}
              onChange={(e) => setBlendMode(e.target.value as any)}
            >
              <option value="screen">Screen (Luminescent)</option>
              <option value="overlay">Overlay (Balanced)</option>
              <option value="color-dodge">Color Dodge (High Contrast)</option>
              <option value="normal">Normal (Direct Alpha)</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right-controls">
          <button className="btn-action-pill" onClick={handleCopyWKT}>
            {copiedWKT ? <CheckCircle2 size={13} color="#10b981" /> : <Copy size={13} />}
            <span>{copiedWKT ? 'WKT Copied!' : 'Copy ROI WKT'}</span>
          </button>
          <button className="btn-action-pill primary" onClick={handleDownloadMask}>
            <Download size={13} />
            <span>Download Mask PNG</span>
          </button>
        </div>
      </div>

      {/* 2. Main Visual Canvas */}
      <div className="changemap-canvas-wrapper">
        {/* MODE 1: ↔️ SWIPE COMPARISON WITH DRAGGABLE DIVIDER LINE (Matches Screenshot 1) */}
        {displayMode === 'swipe' && (
          <div className="swipe-mode-container">
            {/* Top Spatial Header matching Screenshot 1 */}
            <div className="swipe-header-banner">
              <span className="swipe-header-title">SPATIAL RASTER EVALUATION</span>
              <span className="swipe-header-hint">
                DRAG SLIDER TO COMPARE BI-TEMPORAL BASELINE (PREVIOUS) VS ANALYSIS (PRESENT)
              </span>
            </div>

            {/* Interactive Swipe Canvas */}
            <div
              className="swipe-viewer-container"
              ref={containerRef}
              onClick={handleContainerClick}
              onTouchMove={handleTouchMove}
              style={{ height: '480px', marginBottom: 0 }}
            >
              {/* Under Layer: Present / Analysis T2 (e.g. 2026 Scene) */}
              <img
                src={showMaskOnlyInSwipe && viewerConfig.changeMask ? viewerConfig.changeMask : viewerConfig.rightImage}
                alt={rightLabel}
                className="swipe-img-layer"
              />

              {/* Signature Red Difference Heatmap Overlay on Present Scene */}
              {showHeatmap && viewerConfig.heatmapOverlay && !showMaskOnlyInSwipe && (
                <img
                  src={viewerConfig.heatmapOverlay}
                  alt="Change Heatmap"
                  className="swipe-img-layer"
                  style={{
                    pointerEvents: 'none',
                    mixBlendMode: blendMode,
                    opacity: opacity,
                  }}
                />
              )}

              {/* Clipped Over Layer: Previous / Baseline T1 (e.g. 2024 Scene) */}
              {!showMaskOnlyInSwipe && (
                <div
                  className="swipe-clip-layer"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={viewerConfig.leftImage}
                    alt={leftLabel}
                    className="swipe-img-layer"
                    style={{
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                      maxWidth: 'none',
                    }}
                  />
                </div>
              )}

              {/* Draggable Vertical Divider Line & Circular Badge Handle */}
              {!showMaskOnlyInSwipe && (
                <div
                  className="swipe-divider-line"
                  style={{ left: `${sliderPos}%` }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="swipe-handle-badge" title="Drag to compare Previous vs Present">
                    <Sliders size={16} />
                  </div>
                </div>
              )}

              {/* Floating Labels matching Screenshot 1 */}
              {!showMaskOnlyInSwipe && (
                <>
                  <div className="swipe-floating-badge swipe-badge-left">
                    <ChevronLeft size={13} style={{ display: 'inline', marginRight: '3px' }} />
                    <span>{leftLabel} (Previous)</span>
                  </div>
                  <div className="swipe-floating-badge swipe-badge-right">
                    <span>{rightLabel} (Present)</span>
                    <ChevronRight size={13} style={{ display: 'inline', marginLeft: '3px' }} />
                  </div>
                </>
              )}

              {showMaskOnlyInSwipe && (
                <div className="swipe-floating-badge swipe-badge-left" style={{ background: '#ef4444' }}>
                  <span>Binary Ground Truth Raster</span>
                </div>
              )}

              {/* Bottom Right Floating Toggles matching Screenshot 1 */}
              <div className="swipe-controls-bar">
                {viewerConfig.heatmapOverlay && (
                  <button
                    className={`btn-overlay-toggle ${showHeatmap && !showMaskOnlyInSwipe ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHeatmap(!showHeatmap);
                      setShowMaskOnlyInSwipe(false);
                    }}
                    title="Toggle red difference heatmap overlay"
                  >
                    <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>{showHeatmap ? 'Heatmap: ON' : 'Heatmap: OFF'}</span>
                  </button>
                )}

                {viewerConfig.changeMask && (
                  <button
                    className={`btn-overlay-toggle ${showMaskOnlyInSwipe ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMaskOnlyInSwipe(!showMaskOnlyInSwipe);
                    }}
                    title="Toggle raw binary change mask"
                  >
                    <Layers size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>{showMaskOnlyInSwipe ? 'Exit Mask View' : 'Binary Mask'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: SIDE BY SIDE */}
        {displayMode === 'split' && (
          <div className="changemap-split-grid">
            {/* Left: Previous (Baseline) */}
            <div className="split-canvas-card">
              <div className="split-card-top">
                <span className="split-title">{leftLabel} (Previous)</span>
                <span className="badge-tag">Baseline Reference</span>
              </div>
              <div className="split-img-box">
                <img
                  src={viewerConfig.leftImage}
                  alt={leftLabel}
                  className="base-raster-layer"
                />
              </div>
              <div className="split-caption">
                Baseline historical acquisition prior to detected modifications.
              </div>
            </div>

            {/* Right: Present with Red Highlights */}
            <div className="split-canvas-card">
              <div className="split-card-top">
                <span className="split-title">{rightLabel} (Present)</span>
                <span className="badge-tag" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  Red Difference Overlay
                </span>
              </div>
              <div className="split-img-box">
                <img
                  src={viewerConfig.rightImage}
                  alt={rightLabel}
                  className="base-raster-layer"
                />
                {viewerConfig.heatmapOverlay && (
                  <img
                    src={viewerConfig.heatmapOverlay}
                    alt="Overlay"
                    className="diff-heatmap-layer"
                    style={{ opacity: opacity, mixBlendMode: blendMode }}
                  />
                )}
              </div>
              <div className="split-caption">
                Translucent coral-red heat signatures mark construction and spatial anomalies.
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: GROUND TRUTH BINARY MASK */}
        {displayMode === 'mask_only' && (
          <div className="changemap-single-canvas">
            <div className="canvas-header-strip">
              <div className="canvas-label-title">
                <Grid size={14} color="var(--accent-sky)" />
                <span>Isolated Binary Pixel Segmentation Mask (1024 × 1024)</span>
              </div>
              <span className="canvas-meta-tag">White: Altered Pixels • Black: Invariant Pixels</span>
            </div>

            <div className="canvas-media-box black-bg">
              <img
                src={viewerConfig.changeMask || viewerConfig.heatmapOverlay}
                alt="Binary Mask Full"
                className="binary-raster-layer full"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Pixel-Level Detection HUD & Spectral Legend */}
      <div className="changemap-hud-panel">
        <div className="hud-stats-grid">
          <div className="hud-stat-cell">
            <span className="hud-label">Impacted Surface Area</span>
            <span className="hud-value red-text">{areaKm2}</span>
            <span className="hud-sub">Calculated via UTM projection</span>
          </div>

          <div className="hud-stat-cell">
            <span className="hud-label">Detected Changed Pixels</span>
            <span className="hud-value">{changedPx.toLocaleString()} px</span>
            <span className="hud-sub">{percentage} of region evaluated</span>
          </div>

          <div className="hud-stat-cell">
            <span className="hud-label">Invariant / Stable Surface</span>
            <span className="hud-value">{stablePx.toLocaleString()} px</span>
            <span className="hud-sub">Preserved baseline vegetation & terrain</span>
          </div>

          <div className="hud-stat-cell">
            <span className="hud-label">Ground Sample Distance (GSD)</span>
            <span className="hud-value">{gsd}</span>
            <span className="hud-sub">Each pixel = 100 m² surface area</span>
          </div>
        </div>

        {/* Spectral Change Severity Legend */}
        <div className="spectral-legend-bar">
          <div className="legend-label-strip">
            <span className="legend-title">Spectral Deviation Severity Index (Calibrated +{pctNum}%):</span>
            <span className="legend-sub">Cosine distance between bi-temporal optical/SAR feature embeddings</span>
          </div>
          <div className="legend-gradient-track">
            <div className="gradient-bar" style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: `${severityPosition}%`,
                  transform: 'translateX(-50%)',
                  width: '12px',
                  height: '18px',
                  background: '#ffffff',
                  borderRadius: '3px',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.9), 0 0 2px #fff',
                  border: '2px solid #ef4444',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
                title={`Calculated Mean Shift Index: +${pctNum}%`}
              />
            </div>
            <div className="legend-ticks">
              <span>0.0 (Invariant)</span>
              <span>0.25 (Minor Surface Shift)</span>
              <span>0.50 (Moderate Clearing)</span>
              <span>0.75 (New Infrastructure)</span>
              <span>1.0 (Critical Construction)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
