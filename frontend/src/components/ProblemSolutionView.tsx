import type { FC } from 'react';

export const ProblemSolutionView: FC = () => {

  return (
    <div>
      <div className="arch-header">
        <h2 className="arch-title">Problem vs. Solution Comparison</h2>
        <p className="arch-desc">
          Why SatQuery AI transforms remote sensing: bridging the bottleneck between raw satellite observations
          and timely decision-making for government departments.
        </p>
      </div>

      <div className="comparison-grid">
        {/* Traditional Workflow */}
        <div className="comparison-card traditional">
          <div className="comp-header">
            <div className="comp-title" style={{ color: '#f87171' }}>
              Traditional Fragmented Workflow
            </div>
            <div className="comp-sub">
              Requires 4+ isolated desktop packages and specialized remote sensing personnel
            </div>
          </div>

          <div className="comp-steps-list">
            <div className="comp-step">
              <span style={{ color: '#ef4444' }}>1.</span> Raw Satellite Imagery Download (Bhuvan / Copernicus / USGS)
            </div>
            <div className="comp-step">
              <span style={{ color: '#ef4444' }}>2.</span> Manual Preprocessing in QGIS / ArcGIS (Reprojection, Clipping, Masking)
            </div>
            <div className="comp-step">
              <span style={{ color: '#ef4444' }}>3.</span> Specialist Software for Band Math & SAR Despeckling (ENVI / SNAP)
            </div>
            <div className="comp-step">
              <span style={{ color: '#ef4444' }}>4.</span> Disconnected AI Scripting for Segmentation / Feature Detection
            </div>
            <div className="comp-step">
              <span style={{ color: '#ef4444' }}>5.</span> Manual Interpretation, Word/PDF Report Generation
            </div>
          </div>

          <div className="comp-points-box">
            <div className="comp-points-title" style={{ color: '#f87171' }}>
              Systemic Inefficiencies:
            </div>
            <ul style={{ fontSize: '0.78rem', color: '#cbd5e1', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li><strong>Severe Expert Dependency:</strong> Non-technical administrators cannot directly query spatial imagery.</li>
              <li><strong>Turnaround Latency:</strong> Hours to days elapsed before emergency field teams receive actionable maps.</li>
              <li><strong>Fragmented Toolchain:</strong> Proprietary licenses, disparate file formats, and manual data copy steps.</li>
              <li><strong>Ungrounded Output:</strong> Raw charts lack interactive verification and auditable reasoning traces.</li>
            </ul>
          </div>
        </div>

        {/* SatQuery AI Unified Agentic Workflow */}
        <div className="comparison-card satquery">
          <div className="comp-header">
            <div className="comp-title" style={{ color: '#34d399' }}>
              SatQuery AI Agentic Workflow
            </div>
            <div className="comp-sub">
              Single conversational interface orchestrating specialized geospatial models
            </div>
          </div>

          <div className="comp-steps-list">
            <div className="comp-step" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <span style={{ color: '#10b981' }}>1.</span> Ingest Satellite Data + Natural Language Query
            </div>
            <div className="comp-step" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <span style={{ color: '#10b981' }}>2.</span> Autonomous Sensor Modality & Intent Classification
            </div>
            <div className="comp-step" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <span style={{ color: '#10b981' }}>3.</span> Intelligent Task Routing to Specialized Algorithm
            </div>
            <div className="comp-step" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <span style={{ color: '#10b981' }}>4.</span> Automated Spatial Alignment & Sub-Pixel Co-registration
            </div>
            <div className="comp-step" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <span style={{ color: '#10b981' }}>5.</span> Evidence-Grounded Answer + Interactive Swipe Map & Process Trace
            </div>
          </div>

          <div className="comp-points-box">
            <div className="comp-points-title" style={{ color: '#34d399' }}>
              Transformative Benefits:
            </div>
            <ul style={{ fontSize: '0.78rem', color: '#cbd5e1', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li><strong>Zero GIS Barrier:</strong> Anyone asks in plain English (and Phase 2 Indian regional languages).</li>
              <li><strong>Instant Results (5-15s):</strong> Rapid emergency triage for disaster response, flood mapping, and encroachments.</li>
              <li><strong>Scientific Integrity:</strong> Baseline pixel differences are never disguised as fake semantic predictions.</li>
              <li><strong>Auditable Transparency:</strong> Complete 7-step process trace reveals every validation check and parameter.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
