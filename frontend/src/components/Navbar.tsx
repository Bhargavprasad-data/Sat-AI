import type { FC } from 'react';

import { Activity, Server, GitPullRequest, ShieldCheck, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'workspace' | 'architecture' | 'problem-solution' | 'use-cases';
  setActiveTab: (tab: 'workspace' | 'architecture' | 'problem-solution' | 'use-cases') => void;
  onResetDemo: () => void;
}

export const Navbar: FC<NavbarProps> = ({

  activeTab,
  setActiveTab,
  onResetDemo,
}) => {
  return (
    <header className="header-bar">
      <div className="header-inner">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="brand-logo-badge"
            style={{
              width: '42px',
              height: '42px',
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
              src="/logo_symbol.png"
              alt="SatQuery AI Logo Symbol"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/logo_text.png"
              alt="SatQuery AI - Earth Insights Made Simple"
              className="brand-text-logo-dark-theme"
              style={{
                height: '38px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <img
              src="/logo_text_dark.png"
              alt="SatQuery AI - Earth Insights Made Simple"
              className="brand-text-logo-light-theme"
              style={{
                height: '38px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <span
              className="status-badge badge-live-demo"
              title="SIH 2026 Evaluation Sandbox"
              style={{ alignSelf: 'flex-start', marginTop: '2px' }}
            >
              <span className="badge-pulse-dot"></span>
              DEMO MODE
            </span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspace')}
          >
            <Activity size={15} />
            Analysis Workspace
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <Server size={15} />
            System Architecture
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'problem-solution' ? 'active' : ''}`}
            onClick={() => setActiveTab('problem-solution')}
          >
            <GitPullRequest size={15} />
            Traditional vs SatQuery
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'use-cases' ? 'active' : ''}`}
            onClick={() => setActiveTab('use-cases')}
          >
            <ShieldCheck size={15} />
            Use Cases & Roadmap
          </button>
        </nav>

        <div className="header-controls">
          <button className="btn-secondary" onClick={onResetDemo} title="Reset demo inputs and states">
            <RefreshCw size={14} />
            Reset Demo
          </button>
        </div>
      </div>
    </header>
  );
};
