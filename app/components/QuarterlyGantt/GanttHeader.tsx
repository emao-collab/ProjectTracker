'use client';

import { useRef } from 'react';
import styles from './QuarterlyGantt.module.scss';
import { WEEKS, CURRENT_WEEK_EXTRA, HACKATHON_WEEK, weekToPixel } from './gantt.types';

const MIN_TASK_COL = 120;
const MAX_TASK_COL = 480;

// Compute month label spans from a quarter start date
function getMonthSpans(startDate: string) {
  const start = new Date(startDate);
  const spans: { label: string; weeks: number }[] = [];
  let week = 0;
  let current = new Date(start);

  while (week < WEEKS) {
    const month = current.toLocaleString('default', { month: 'long' });
    let count = 0;
    while (week + count < WEEKS) {
      const d = new Date(start);
      d.setDate(d.getDate() + (week + count) * 7);
      if (d.toLocaleString('default', { month: 'long' }) !== month) break;
      count++;
    }
    spans.push({ label: month, weeks: count });
    current.setDate(current.getDate() + count * 7);
    week += count;
  }
  return spans;
}

interface GanttHeaderProps {
  startDate: string;
  weekWidth: number;
  taskColWidth: number;
  onTaskColResize: (width: number) => void;
  currentWeek: number | null;
}

export function GanttHeader({ startDate, weekWidth, taskColWidth, onTaskColResize, currentWeek }: GanttHeaderProps) {
  const monthSpans = getMonthSpans(startDate);
  const startXRef = useRef<number | null>(null);
  const startWidthRef = useRef<number>(taskColWidth);

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = taskColWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (startXRef.current === null) return;
      const dx = ev.clientX - startXRef.current;
      const next = Math.max(MIN_TASK_COL, Math.min(MAX_TASK_COL, startWidthRef.current + dx));
      onTaskColResize(next);
    };
    const onMouseUp = () => {
      startXRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className={styles.header}>
      {/* Task column header + resize handle */}
      <div className={styles.headerTaskCol} style={{ width: taskColWidth }}>
        <span className={styles.headerTaskColLabel}>Design tasks</span>
        <div className={styles.colResizeHandle} onMouseDown={onResizeMouseDown} />
      </div>

      <div className={styles.headerTimeline}>
        {/* Month row */}
        <div className={styles.monthRow}>
          {monthSpans.map((m, i) => {
            // compute pixel width for this month span
            const spanStart = monthSpans.slice(0, i).reduce((s, x) => s + x.weeks, 0);
            const left = weekToPixel(spanStart + 1, weekWidth, currentWeek);
            const right = weekToPixel(spanStart + m.weeks + 1, weekWidth, currentWeek);
            return (
              <div key={i} className={styles.monthCell} style={{ width: right - left }}>
                {m.label}
              </div>
            );
          })}
        </div>

        {/* Week row */}
        <div className={styles.weekRow}>
          {Array.from({ length: WEEKS }, (_, i) => {
            const weekNum = i + 1;
            const isCurrent = currentWeek === weekNum;
            const isHackathon = weekNum === HACKATHON_WEEK;
            const cls = [
              styles.weekCell,
              isCurrent ? styles.weekCellCurrent : '',
              isHackathon ? styles.weekCellHackathon : '',
            ].filter(Boolean).join(' ');
            return (
              <div
                key={i}
                className={cls}
                style={{ width: isCurrent ? weekWidth + CURRENT_WEEK_EXTRA : weekWidth }}
                title={isHackathon ? 'Hackathon – Jun 1–5' : undefined}
              >
                {isHackathon ? '🎉 Hack' : `W${weekNum}`}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
