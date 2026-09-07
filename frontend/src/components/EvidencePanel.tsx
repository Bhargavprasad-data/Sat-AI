import type { FC } from 'react';
import { CheckCircle2, AlertTriangle, Info, MapPin } from 'lucide-react';
import type { AnalysisEvidence, AnalysisStatistics, AnalysisReliability } from '../types';

interface EvidencePanelProps {
  evidence: AnalysisEvidence;
  statistics: AnalysisStatistics;
  reliability: AnalysisReliability;
  limitations: string[];
}

export const EvidencePanel: FC<EvidencePanelProps> = ({

  evidence,
  statistics,
  reliability,
  limitations,
}) => {
  return (
    <div>
      {/* 1. Quantitative Statistics Cards */}
      <div className="statistics-grid">
        {statistics.area_km2 && (
          <div className="stat-card">
            <div className="stat-label">Changed Surface Area</div>
            <div className="stat-value" style={{ color: 'var(--accent-sky)' }}>
              {statistics.area_km2}
            </div>
            <div className="stat-sub">Ground sample metric</div>
          </div>
        )}

        {statistics.percentage_change && (
          <div className="stat-card">
            <div className="stat-label">Changed Pixels</div>
            <div className="stat-value" style={{ color: 'var(--accent-rose)' }}>
              {statistics.percentage_change}
            </div>
            <div className="stat-sub">
              {statistics.changed_pixels?.toLocaleString()} / {statistics.total_pixels?.toLocaleString()} px
            </div>
          </div>
        )}

        {statistics.predominant_class && (
          <div className="stat-card">
            <div className="stat-label">Predominant Class</div>
            <div className="stat-value" style={{ fontSize: '1rem', color: 'var(--accent-emerald)' }}>
              {statistics.predominant_class}
            </div>
            <div className="stat-sub">{statistics.river_length_in_roi || 'Spectral clustering'}</div>
          </div>
        )}

        {statistics.high_backscatter_area && (
          <div className="stat-card">
            <div className="stat-label">High SAR Backscatter</div>
            <div className="stat-value" style={{ fontSize: '1.05rem', color: 'var(--accent-purple)' }}>
              {statistics.high_backscatter_area}
            </div>
            <div className="stat-sub">Corner structural reflection</div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-label">Spatial Resolution (GSD)</div>
          <div className="stat-value" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            {statistics.resolution || statistics.optical_resolution || '10.0m / pixel'}
          </div>
          <div className="stat-sub">Sentinel MSI sensor grid</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Algorithm Reliability</div>
          <div className="stat-value" style={{ fontSize: '1.05rem', color: reliability.level === 'Moderate' ? 'var(--accent-amber)' : 'var(--accent-sky)' }}>
            {reliability.level}
          </div>
          <div className="stat-sub">{reliability.basis.slice(0, 32)}...</div>
        </div>
      </div>

      {/* 2. Detected Classes Bar if present (Scenario A) */}
      {evidence.classes_detected && evidence.classes_detected.length > 0 && (
        <div style={{ marginBottom: '1.25rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Detected Surface Classes (Spectral Grounding):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {evidence.classes_detected.map((cls, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                  borderLeft: `3px solid ${cls.color}`,
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cls.name}</span>
                <span style={{ color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)' }}>{cls.share}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Optical vs SAR Complementary Contributions (Scenario C) */}
      {evidence.optical_contribution && evidence.sar_contribution && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--accent-brand-subtle)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-accent)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-sky)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Optical Sensor Contribution
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {evidence.optical_contribution}
            </div>
          </div>
          <div style={{ background: 'rgba(124, 58, 237, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              SAR Microwave Contribution
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {evidence.sar_contribution}
            </div>
          </div>
        </div>
      )}

      {/* 4. Spatial Validation Checklist */}
      <div className="evidence-checks-card">
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={13} color="var(--accent-emerald)" />
          GIS & Preprocessing Validation Record
        </div>
        {evidence.spatial_validation.map((item, index) => (
          <div className="check-item" key={index}>
            <span className="check-name">
              <CheckCircle2 size={13} color="var(--accent-emerald)" />
              {item.check}
            </span>
            <span className="check-val">{item.result}</span>
          </div>
        ))}
      </div>

      {/* 5. Scientific Honest Limitations Banner */}
      <div className="limitations-banner">
        <div className="limitations-title">
          <AlertTriangle size={14} />
          Scientific Transparency & Known Limitations
        </div>
        <ul className="limitations-list">
          {limitations.map((lim, i) => (
            <li key={i} style={{ marginBottom: '0.25rem' }}>
              {lim}
            </li>
          ))}
        </ul>
      </div>

      {/* Suppressed confidence note if confidence is not defensible */}
      {statistics.confidence_available === false && statistics.confidence_note && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
          <Info size={12} />
          {statistics.confidence_note}
        </div>
      )}
    </div>
  );
};
