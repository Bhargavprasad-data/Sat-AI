import type { FC } from 'react';
import { X, HelpCircle, CheckCircle2, GitBranch, Cpu, Database, MapPin } from 'lucide-react';
import type { HowItWorkedStage } from '../types';

interface HowItWorkedModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: HowItWorkedStage[];
  query: string;
  method: string;
}

const icons = [HelpCircle, GitBranch, Cpu, Database, MapPin, CheckCircle2];

export const HowItWorkedModal: FC<HowItWorkedModalProps> = ({

  isOpen,
  onClose,
  stages,
  query,
  method,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <HelpCircle size={20} color="var(--accent-cyan)" />
            How Did SatQuery AI Get This Answer?
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-sky)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            Query Evaluated
          </div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
            "{query}"
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
            Specialist Pipeline: {method}
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          SatQuery AI is not an ungrounded LLM hallucinating text. Below is the exact step-by-step
          geospatial reasoning pipeline executed to produce this validated result:
        </p>

        <div className="stage-tree">
          {stages.map((stg, index) => {
            const IconComponent = icons[index % icons.length];
            return (
              <div className="stage-tree-item" key={index}>
                <div className="stage-tree-icon">
                  <IconComponent size={18} />
                </div>
                <div className="stage-tree-info">
                  <div className="stage-tree-title">{stg.stage}</div>
                  <div className="stage-tree-desc">{stg.summary}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={onClose}>
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
