'use client';

import { useRef, useEffect } from 'react';
import { TaskStatus, STATUS_CONFIG, STATUS_BORDER } from './gantt.types';
import styles from './QuarterlyGantt.module.scss';

interface StatusDropdownProps {
  current: TaskStatus;
  onSelect: (s: TaskStatus) => void;
  onClose: () => void;
}

export function StatusDropdown({ current, onSelect, onClose }: StatusDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className={styles.statusDropdown}>
      {(Object.entries(STATUS_CONFIG) as [TaskStatus, typeof STATUS_CONFIG[TaskStatus]][]).map(
        ([key, cfg]) => (
          <button
            key={key}
            className={`${styles.statusOption} ${key === current ? styles.statusOptionActive : ''}`}
            onClick={() => { onSelect(key); onClose(); }}
          >
            <span
              className={styles.statusOptionDot}
              style={{ background: STATUS_BORDER[key] }}
            />
            {cfg.label}
          </button>
        )
      )}
    </div>
  );
}
