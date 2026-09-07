import type { FC } from 'react';
import { Waves, Building2, Sprout, Trees, HardHat } from 'lucide-react';

interface UseCase {
  sector: string;
  icon: any;
  problem: string;
  query: string;
  analysis: string;
  evidence: string;
  decisionSupport: string;
}

export const UseCasesRoadmapView: FC = () => {

  const useCases: UseCase[] = [
    {
      sector: 'Disaster Management',
      icon: Waves,
      problem: 'Post-monsoon river swelling and flash floods submerge agricultural and residential zones without instant spatial extent boundaries.',
      query: '"What significant changes occurred in this river corridor after the heavy rainfall?"',
      analysis: 'Bi-temporal pixel-difference and water index thresholding (NDWI / SAR low-backscatter specular reflection).',
      evidence: 'Co-registered inundation raster, changed area in km², affected quadrant coordinates.',
      decisionSupport: 'Enables National Disaster Response Force (NDRF) teams to prioritize relief boats and evacuation routes.',
    },
    {
      sector: 'Urban Planning',
      icon: Building2,
      problem: 'Unauthorized urban sprawl, unauthorized colony construction, and lakebed encroachments occur faster than manual municipal field surveys.',
      query: '"Where has significant surface change occurred on the city periphery between 2024 and 2026?"',
      analysis: 'High SAR double-bounce corner reflection correlated with optical spectral brightness shifts.',
      evidence: 'Delineated construction polygons, change percentage metrics, time-stamped comparison slider.',
      decisionSupport: 'Empowers municipal authorities to issue targeted inspection notices before structures are fully erected.',
    },
    {
      sector: 'Agriculture & Environment',
      icon: Sprout,
      problem: 'Crop failure tracking and seasonal fallow transitions across thousands of acres require rapid, automated screening.',
      query: '"What land cover types and crop parcel health patterns are visible in this agricultural belt?"',
      analysis: 'Single-scene and bi-temporal multispectral vegetation index segmentation (NDVI).',
      evidence: 'Class percentage breakdown, parcel boundary consistency checks, spectral index distributions.',
      decisionSupport: 'Assists Ministry of Agriculture and insurance assessors in validating PM Fasal Bima Yojana claims.',
    },
    {
      sector: 'Forest & Water Conservation',
      icon: Trees,
      problem: 'Deforestation along protected wildlife corridors and shrinking natural water bodies require continuous, unbiased oversight.',
      query: '"Quantify the loss of dense vegetation canopy in this reserve forest over the past 24 months."',
      analysis: 'Optical canopy density difference with cloud/shadow masking exclusion.',
      evidence: 'Vegetation loss heatmap, net square kilometers altered, historical baseline overlay.',
      decisionSupport: 'Informs Forest Departments of illegal logging hotspots requiring immediate ranger patrolling.',
    },
    {
      sector: 'Infrastructure & Highways',
      icon: HardHat,
      problem: 'Monitoring greenfield highway corridors and industrial park grading across hundreds of linear kilometers.',
      query: '"Identify changes around highway expansion rights-of-way and developed plots."',
      analysis: 'Joint Optical-SAR linear feature analysis resilient to cloud cover and rain events.',
      evidence: 'Cleared linear corridor masks, earthwork area measurements, ground resolution validation.',
      decisionSupport: 'Assists NHAI project directors in verifying contractor milestone progress before disbursing payments.',
    },
  ];

  return (
    <div>
      <div className="arch-header" style={{ marginBottom: '2rem' }}>
        <h2 className="arch-title">Government Use Cases & Roadmap</h2>
        <p className="arch-desc">
          Providing objective, evidence-grounded spatial analytics to empower human decision makers
          across key public sector ministries — without replacing official statutory judgment.
        </p>
      </div>

      {/* 5 Government Use-Case Cards */}
      <div className="use-cases-grid">
        {useCases.map((uc, i) => {
          const IconComponent = uc.icon;
          return (
            <div className="use-case-card" key={i}>
              <div className="use-case-icon">
                <IconComponent size={20} />
              </div>
              <div className="use-case-name">{uc.sector}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {uc.problem}
              </div>

              <div className="use-case-query-quote">
                {uc.query}
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <strong style={{ color: '#fff' }}>Analysis:</strong> {uc.analysis}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                <strong style={{ color: '#38bdf8' }}>Evidence:</strong> {uc.evidence}
              </div>
              <div className="use-case-impact">
                <strong style={{ color: 'var(--accent-emerald)' }}>Decision Support:</strong> {uc.decisionSupport}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Roadmap Matrix */}
      <div className="arch-header" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
          Evolution Roadmap: Phase 0 (Today) → Phase 2 (Production System)
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Clear separation between prototype baseline demonstrations and the planned enterprise release.
        </p>
      </div>

      <div className="roadmap-table-container">
        <table className="roadmap-table">
          <thead>
            <tr>
              <th>Capability Domain</th>
              <th>Phase 0 Demonstration (Today)</th>
              <th>Phase 2 Production Hardening (Planned)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Change Detection</strong></td>
              <td>
                <span className="roadmap-pill-phase1">Baseline Implemented</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Normalized pixel difference + Otsu adaptive thresholding on co-registered scenes.
                </div>
              </td>
              <td>
                <span className="roadmap-pill-phase2">Planned</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Supervised Siamese CNN / ChangeFormer with semantic land-cover transition labeling.
                </div>
              </td>
            </tr>

            <tr>
              <td><strong>Remote Sensing VQA</strong></td>
              <td>
                <span className="roadmap-pill-phase1">Baseline Implemented</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Remote sensing feature parsing with spectral index grounding (NDVI/NDWI/NDBI).
                </div>
              </td>
              <td>
                <span className="roadmap-pill-phase2">Planned</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Fine-tuned EarthGPT / RemoteCLIP Vision-Language Models with bounding polygon grounding.
                </div>
              </td>
            </tr>

            <tr>
              <td><strong>Multimodal Fusion (Optical + SAR)</strong></td>
              <td>
                <span className="roadmap-pill-phase1">Baseline Implemented</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Re-projection to common spatial grid, backscatter normalization, false-color composite.
                </div>
              </td>
              <td>
                <span className="roadmap-pill-phase2">Planned</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Deep Cross-Attention Optical-SAR Fusion Network for all-weather flood and infrastructure tracking.
                </div>
              </td>
            </tr>

            <tr>
              <td><strong>Query Languages</strong></td>
              <td>
                <span className="roadmap-pill-phase1">English Only</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Natural English queries with sample query helpers.
                </div>
              </td>
              <td>
                <span className="roadmap-pill-phase2">Multilingual India</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Multilingual queries supporting Hindi, Bengali, Tamil, Telugu, Marathi, and Kannada.
                </div>
              </td>
            </tr>

            <tr>
              <td><strong>Deployment & Security</strong></td>
              <td>
                <span className="roadmap-pill-phase1">Zero Auth / Localhost</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Completely local execution on presenter laptop CPU; zero cloud dependency during pitch.
                </div>
              </td>
              <td>
                <span className="roadmap-pill-phase2">Government Cloud</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  MeitY empaneled cloud hosting, PostGIS database, Role-Based Access Control, and audit logs.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
