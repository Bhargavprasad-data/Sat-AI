import { useState } from 'react';
import type { FC } from 'react';
import {
  Home,
  ChevronRight,
  MapPin,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  FileText,
  Compass
} from 'lucide-react';
import type { ResultTab } from '../types';

interface SidebarProps {
  onGoHome: () => void;
  onGoSatelliteSearch?: () => void;
  isHomeActive: boolean;
  isBackendConnected: boolean;
  activeView?: 'config' | 'results' | 'satellite_search';
  activeResultTab?: ResultTab;
  onSelectResultTab?: (tab: ResultTab) => void;
  hasResult?: boolean;
  isProcessing?: boolean;
}

export const Sidebar: FC<SidebarProps> = ({
  onGoHome,
  onGoSatelliteSearch,
  isHomeActive,
  isBackendConnected,
  activeView: _activeView = 'config',
  activeResultTab = 'region',
  onSelectResultTab,
  hasResult = false,
  isProcessing = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <>
      {/* 1. Fixed Desktop Layout Anchor (w-16 / 68px). Prevents page shift on hover! */}
      <div className="sidebar-anchor-rail" aria-hidden="true" />

      {/* 2. Absolutely / Fixed Positioned Inner Sidebar (Hotstar/JioCinema Style Overlay) */}
      <aside
        className={`sidebar-floating-container ${isHovered ? 'expanded' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Logo & Brand Bar */}
        <div
          className="sidebar-brand-strip"
          onClick={onGoHome}
          style={{ cursor: 'pointer' }}
          title="Return to Analysis Configuration Home"
        >
          <div
            className="sidebar-logo-square"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              border: '2px solid rgba(56, 189, 248, 0.55)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              flexShrink: 0,
              padding: 0,
            }}
          >
            <img
              src="/logo_circle.png"
              alt="SatQuery AI Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">
              SatQuery AI
            </div>
            <div className="sidebar-brand-caption">Geospatial Intelligence</div>
          </div>
        </div>

        {/* Navigation / Main Home Path */}
        <div className="sidebar-nav-list">
          <div className="sidebar-nav-section-title">
            <span className="section-title-full">NAVIGATION</span>
            <span className="section-title-dot">•</span>
          </div>

          {/* Primary Home Button */}
          <button
            type="button"
            className={`sidebar-nav-item ${isHomeActive ? 'active' : ''}`}
            onClick={onGoHome}
            title="Analysis Configuration Home"
          >
            {/* Active Indicator Bar */}
            {isHomeActive && <div className="sidebar-active-pill-bar" />}

            <div className="sidebar-icon-wrap">
              <Home size={18} className="sidebar-nav-icon" />
            </div>

            <div className="sidebar-label-wrap">
              <div className="sidebar-nav-label">Home</div>
              <div className="sidebar-nav-subtext">Analysis Configuration</div>
            </div>

            <ChevronRight size={14} className="sidebar-chevron" />
          </button>

          {/* Satellite Search Button */}
          <button
            type="button"
            className={`sidebar-nav-item ${_activeView === 'satellite_search' ? 'active' : ''}`}
            onClick={onGoSatelliteSearch}
            title="Auto Data Retrieval"
          >
            {_activeView === 'satellite_search' && <div className="sidebar-active-pill-bar" />}
            
            <div className="sidebar-icon-wrap">
              <Compass size={18} className="sidebar-nav-icon" />
            </div>

            <div className="sidebar-label-wrap">
              <div className="sidebar-nav-label">Satellite Search</div>
              <div className="sidebar-nav-subtext">Auto Data Retrieval</div>
            </div>

            <ChevronRight size={14} className="sidebar-chevron" />
          </button>

          {/* Result Tabs (Shown strictly AFTER completion of loading animation when result is ready) */}
          {hasResult && !isProcessing && (
            <div className="sidebar-results-tab-group results-tabs-animated-in">
              <div className="sidebar-nav-section-title" style={{ marginTop: '0.75rem' }}>
                <span className="section-title-full">RESULT TABS</span>
                <span className="section-title-dot">•</span>
              </div>

              {/* 1. Highlighted Region */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeResultTab === 'region' && !isHomeActive ? 'active' : ''}`}
                onClick={() => onSelectResultTab?.('region')}
                title="Highlighted Region"
              >
                {activeResultTab === 'region' && !isHomeActive && (
                  <div className="sidebar-active-pill-bar" style={{ background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                )}
                <div className="sidebar-icon-wrap" style={{ color: '#ef4444' }}>
                  <MapPin size={18} />
                </div>
                <div className="sidebar-label-wrap">
                  <div className="sidebar-nav-label">Highlighted Region</div>
                  <div className="sidebar-nav-subtext">Spatial Detection Overlay</div>
                </div>
                <ChevronRight size={14} className="sidebar-chevron" />
              </button>

              {/* 2. Change Map */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeResultTab === 'mask' && !isHomeActive ? 'active' : ''}`}
                onClick={() => onSelectResultTab?.('mask')}
                title="Change Map"
              >
                {activeResultTab === 'mask' && !isHomeActive && (
                  <div className="sidebar-active-pill-bar" style={{ background: '#0284c7', boxShadow: '0 0 10px #0284c7' }} />
                )}
                <div className="sidebar-icon-wrap" style={{ color: '#0284c7' }}>
                  <BarChart2 size={18} />
                </div>
                <div className="sidebar-label-wrap">
                  <div className="sidebar-nav-label">Change Map</div>
                  <div className="sidebar-nav-subtext">Difference Matrix</div>
                </div>
                <ChevronRight size={14} className="sidebar-chevron" />
              </button>

              {/* 3. Area / Percentage */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeResultTab === 'charts' && !isHomeActive ? 'active' : ''}`}
                onClick={() => onSelectResultTab?.('charts')}
                title="Area / Percentage"
              >
                {activeResultTab === 'charts' && !isHomeActive && (
                  <div className="sidebar-active-pill-bar" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                )}
                <div className="sidebar-icon-wrap" style={{ color: '#10b981' }}>
                  <TrendingUp size={18} />
                </div>
                <div className="sidebar-label-wrap">
                  <div className="sidebar-nav-label">Area / Percentage</div>
                  <div className="sidebar-nav-subtext">Hectares & Metrics</div>
                </div>
                <ChevronRight size={14} className="sidebar-chevron" />
              </button>

              {/* 4. Confidence Score */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeResultTab === 'report' && !isHomeActive ? 'active' : ''}`}
                onClick={() => onSelectResultTab?.('report')}
                title="Confidence Score"
              >
                {activeResultTab === 'report' && !isHomeActive && (
                  <div className="sidebar-active-pill-bar" style={{ background: '#059669', boxShadow: '0 0 10px #059669' }} />
                )}
                <div className="sidebar-icon-wrap" style={{ color: '#059669' }}>
                  <ShieldCheck size={18} />
                </div>
                <div className="sidebar-label-wrap">
                  <div className="sidebar-nav-label">Confidence Score</div>
                  <div className="sidebar-nav-subtext">Model Reliability & Dossier</div>
                </div>
                <ChevronRight size={14} className="sidebar-chevron" />
              </button>

              {/* 5. Execution Trace */}
              <button
                type="button"
                className={`sidebar-nav-item ${activeResultTab === 'trace' && !isHomeActive ? 'active' : ''}`}
                onClick={() => onSelectResultTab?.('trace')}
                title="Execution Trace"
              >
                {activeResultTab === 'trace' && !isHomeActive && (
                  <div className="sidebar-active-pill-bar" style={{ background: '#6366f1', boxShadow: '0 0 10px #6366f1' }} />
                )}
                <div className="sidebar-icon-wrap" style={{ color: '#6366f1' }}>
                  <FileText size={18} />
                </div>
                <div className="sidebar-label-wrap">
                  <div className="sidebar-nav-label">Execution Trace</div>
                  <div className="sidebar-nav-subtext">DAG Provenance Log</div>
                </div>
                <ChevronRight size={14} className="sidebar-chevron" />
              </button>
            </div>
          )}
        </div>
        {/* Bottom Health & Status Bar */}
        <div className="sidebar-footer">
          <div className="sidebar-health-pill">
            {isBackendConnected ? (
              <>
                <span className="sidebar-status-dot online" />
                <div className="sidebar-health-info">
                  <div className="sidebar-health-status">Engine Connected</div>
                  <div className="sidebar-health-details">Local CPU • 8ms</div>
                </div>
              </>
            ) : (
              <>
                <span className="sidebar-status-dot offline" />
                <div className="sidebar-health-info">
                  <div className="sidebar-health-status" style={{ color: '#f87171' }}>
                    Connecting...
                  </div>
                  <div className="sidebar-health-details">Automatic Shimmer</div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
