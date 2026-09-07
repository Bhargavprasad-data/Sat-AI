import type { FC } from 'react';
import { RefreshCw, ServerCrash } from 'lucide-react';

interface SkeletonLoaderProps {
  isBackendOffline?: boolean;
  onRetry?: () => void;
}

export const SkeletonLoader: FC<SkeletonLoaderProps> = ({ isBackendOffline, onRetry }) => {
  return (
    <div className="skeleton-container" aria-busy="true" aria-live="polite">
      {/* Offline Alert Banner if backend is disconnected */}
      {isBackendOffline && (
        <div className="skeleton-offline-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ServerCrash size={18} color="#f87171" className="skeleton-pulse-icon" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fca5a5' }}>
                Waiting for Backend Engine — Shimmer Active
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                Attempting connection to local FastAPI engine (http://127.0.0.1:8000). The workspace will automatically activate as soon as the backend comes online.
              </div>
            </div>
          </div>
          {onRetry && (
            <button className="btn-secondary" onClick={onRetry} style={{ padding: '0.35rem 0.75rem' }}>
              <RefreshCw size={13} /> Retry Handshake
            </button>
          )}
        </div>
      )}

      {/* Main Workspace Skeleton Layout */}
      <div className="workspace-grid">
        {/* Left Column Skeleton */}
        <div className="panel-card">
          <div className="skeleton-shimmer" style={{ width: '60%', height: '22px', marginBottom: '1.25rem' }}></div>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '45%', height: '14px', marginBottom: '0.6rem' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '54px', borderRadius: '6px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '54px', borderRadius: '6px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '54px', borderRadius: '6px' }}></div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '40%', height: '14px', marginBottom: '0.6rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              <div className="skeleton-shimmer" style={{ height: '32px' }}></div>
              <div className="skeleton-shimmer" style={{ height: '32px' }}></div>
              <div className="skeleton-shimmer" style={{ height: '32px' }}></div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '50%', height: '14px', marginBottom: '0.6rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div className="skeleton-shimmer" style={{ height: '130px', borderRadius: '6px' }}></div>
              <div className="skeleton-shimmer" style={{ height: '130px', borderRadius: '6px' }}></div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '40%', height: '14px', marginBottom: '0.6rem' }}></div>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '70px', borderRadius: '6px' }}></div>
          </div>

          <div className="skeleton-shimmer" style={{ width: '100%', height: '46px', borderRadius: '6px' }}></div>
        </div>

        {/* Right Column Skeleton */}
        <div className="results-panel">
          <div className="result-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div className="skeleton-shimmer" style={{ width: '220px', height: '26px' }}></div>
              <div className="skeleton-shimmer" style={{ width: '140px', height: '22px' }}></div>
            </div>

            <div className="skeleton-shimmer" style={{ width: '100%', height: '72px', marginBottom: '1.25rem', borderRadius: '6px' }}></div>

            <div className="skeleton-shimmer" style={{ width: '100%', height: '360px', marginBottom: '1.25rem', borderRadius: '6px' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="skeleton-shimmer" style={{ height: '70px', borderRadius: '6px' }}></div>
              <div className="skeleton-shimmer" style={{ height: '70px', borderRadius: '6px' }}></div>
              <div className="skeleton-shimmer" style={{ height: '70px', borderRadius: '6px' }}></div>
              <div className="skeleton-shimmer" style={{ height: '70px', borderRadius: '6px' }}></div>
            </div>

            <div className="skeleton-shimmer" style={{ width: '100%', height: '120px', borderRadius: '6px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
