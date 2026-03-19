'use client';

import { useRef, useCallback } from 'react';
import { GanttTask, STATUS_CONFIG, STATUS_BORDER, WEEKS, weekToPixel } from './gantt.types';
import styles from './QuarterlyGantt.module.scss';

interface GanttBarProps {
  task: GanttTask;
  weekWidth: number;
  currentWeek: number | null;
  isReadOnly: boolean;
  onMove: (startWeek: number, endWeek: number) => void;
  onStatusClick: () => void;
}

export function GanttBar({ task, weekWidth, currentWeek, isReadOnly, onMove, onStatusClick }: GanttBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    origStart: number;
    origEnd: number;
    didMove: boolean;
  } | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const onMouseDown = useCallback((
    e: React.MouseEvent,
    type: 'move' | 'resize-left' | 'resize-right'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = {
      type,
      startX: e.clientX,
      origStart: task.startWeek,
      origEnd: task.endWeek,
      didMove: false,
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const dx = ev.clientX - dragState.current.startX;
      if (Math.abs(dx) > 4) dragState.current.didMove = true;
      const weekDelta = dx / weekWidth;
      const { type, origStart, origEnd } = dragState.current;
      const minDuration = 0.25;

      let newStart = origStart;
      let newEnd = origEnd;

      if (type === 'move') {
        const duration = origEnd - origStart;
        newStart = clamp(origStart + weekDelta, 1, WEEKS + 1 - duration);
        newEnd = newStart + duration;
      } else if (type === 'resize-left') {
        newStart = clamp(origStart + weekDelta, 1, origEnd - minDuration);
        newEnd = origEnd;
      } else if (type === 'resize-right') {
        newStart = origStart;
        newEnd = clamp(origEnd + weekDelta, origStart + minDuration, WEEKS + 1);
      }

      onMove(newStart, newEnd);
    };

    const onMouseUp = () => {
      const wasDrag = dragState.current?.didMove ?? false;
      const isMove = dragState.current?.type === 'move';
      dragState.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (!wasDrag && isMove) onStatusClick();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [task.startWeek, task.endWeek, weekWidth, onMove]);

  const MIN_BAR_PX = 40;
  const left = weekToPixel(task.startWeek, weekWidth, currentWeek);
  const right = weekToPixel(task.endWeek, weekWidth, currentWeek);
  const width = Math.max(MIN_BAR_PX, right - left);
  const cfg = STATUS_CONFIG[task.status];
  const borderColor = STATUS_BORDER[task.status];

  return (
    <div
      ref={barRef}
      className={styles.bar}
      style={{ left, width, background: cfg.color, borderColor, cursor: isReadOnly ? 'default' : undefined }}
      onMouseDown={isReadOnly ? undefined : e => onMouseDown(e, 'move')}
      title={`${task.name} · ${cfg.label}${isReadOnly ? '' : '\nClick to change status'}`}
    >
      {!isReadOnly && <div
        className={`${styles.handle} ${styles.handleLeft}`}
        onMouseDown={e => onMouseDown(e, 'resize-left')}
      />}
      <span className={styles.barLabel}>{task.name}</span>
      <span className={styles.statusDot} style={{ background: borderColor }} />
      {!isReadOnly && <div
        className={`${styles.handle} ${styles.handleRight}`}
        onMouseDown={e => onMouseDown(e, 'resize-right')}
      />}
    </div>
  );
}
