import { useState, useRef, useCallback } from 'react';
import type { FC, MouseEvent, TouchEvent } from 'react';
import { Sliders, Eye, ChevronLeft, ChevronRight, CircleDot, Layers } from 'lucide-react';

interface SwipeViewerProps {
  leftImage: string;
  rightImage: string;
  leftLabel?: string;
  rightLabel?: string;
  heatmapOverlay?: string;
  changeMask?: string;
  isMultimodal?: boolean;
}

export const SwipeViewer: FC<SwipeViewerProps> = ({
  leftImage,
  rightImage,
  leftLabel = 'Baseline Image (T1)',
  rightLabel = 'Analysis Image (T2)',
  heatmapOverlay,
  changeMask,
  isMultimodal = false,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showMaskOnly, setShowMaskOnly] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="swipe-viewer-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* Under layer (Right Image: e.g. 2026 or SAR) */}
        <img
          src={showMaskOnly && changeMask ? changeMask : rightImage}
          alt={rightLabel}
          className="swipe-img-layer"
        />

        {/* Change Heatmap Overlay if toggled */}
        {showHeatmap && heatmapOverlay && !showMaskOnly && (
          <img
            src={heatmapOverlay}
            alt="Change Heatmap"
            className="swipe-img-layer"
            style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.9 }}
          />
        )}

        {/* Clipped Over layer (Left Image: e.g. 2024 or Optical) */}
        {!showMaskOnly && (
          <div
            className="swipe-clip-layer"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={leftImage}
              alt={leftLabel}
              className="swipe-img-layer"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                maxWidth: 'none',
              }}
            />
          </div>
        )}

        {/* Divider line & handle */}
        {!showMaskOnly && (
          <div
            className="swipe-divider-line"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={handleMouseDown}
          >
            <div className="swipe-handle-badge">
              <Sliders size={16} />
            </div>
          </div>
        )}

        {/* Floating Labels with Outline Icons */}
        {!showMaskOnly && (
          <>
            <div className="swipe-floating-badge swipe-badge-left">
              <ChevronLeft size={13} style={{ display: 'inline', marginRight: '3px' }} />
              {leftLabel}
            </div>
            <div className="swipe-floating-badge swipe-badge-right">
              {rightLabel}
              <ChevronRight size={13} style={{ display: 'inline', marginLeft: '3px' }} />
            </div>
          </>
        )}

        {showMaskOnly && (
          <div className="swipe-floating-badge swipe-badge-left" style={{ background: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CircleDot size={12} />
            <span>Binary Change Mask Raster (Ground Truth)</span>
          </div>
        )}

        {/* Overlay toggle controls */}
        <div className="swipe-controls-bar">
          {heatmapOverlay && (
            <button
              className={`btn-overlay-toggle ${showHeatmap && !showMaskOnly ? 'active' : ''}`}
              onClick={() => {
                setShowHeatmap(!showHeatmap);
                setShowMaskOnly(false);
              }}
              title="Toggle highlighted difference heatmap overlay"
            >
              <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {showHeatmap ? 'Heatmap: ON' : 'Heatmap: OFF'}
            </button>
          )}

          {changeMask && (
            <button
              className={`btn-overlay-toggle ${showMaskOnly ? 'active' : ''}`}
              onClick={() => setShowMaskOnly(!showMaskOnly)}
              title="Inspect raw binary change mask raster"
            >
              <Layers size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {showMaskOnly ? 'Exit Mask View' : 'Binary Mask'}
            </button>
          )}

          {isMultimodal && (
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '4px' }}>
              Swipe to inspect Optical vs SAR penetration
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
