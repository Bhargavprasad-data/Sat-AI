import { useState } from 'react';
import type { FC } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import type { ExecutionTraceStep } from '../types';

interface ExecutionTraceProps {
  trace: ExecutionTraceStep[];
}

export const ExecutionTrace: FC<ExecutionTraceProps> = ({ trace }) => {

  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="trace-container">
      <div className="trace-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Terminal size={14} color="var(--accent-sky)" />
          <span>Execution Process Trace (Auditable Decision Log)</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {isOpen && (
        <div className="trace-body">
          {trace.map((item, idx) => (
            <div className="trace-line" key={idx}>
              <span className="trace-num">[{idx + 1}]</span>
              <div>
                <strong style={{ color: '#fff', marginRight: '6px' }}>{item.step}:</strong>
                <span>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
