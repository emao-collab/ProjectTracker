'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon, Text, PrimaryButton, SecondaryButton } from '@gfm-heart/components';
import { GanttTask, WEEKS, CURRENT_WEEK_EXTRA, HACKATHON_WEEK, weekToPixel } from './gantt.types';
import { GanttBar } from './GanttBar';
import styles from './QuarterlyGantt.module.scss';

interface GanttRowProps {
  task: GanttTask;
  weekWidth: number;
  taskColWidth: number;
  currentWeek: number | null;
  index: number;
  isDragging: boolean;
  isReadOnly: boolean;
  onUpdate: (patch: Partial<GanttTask>) => void;
  onDelete: () => void;
  onDragHandleMouseDown: (e: React.MouseEvent) => void;
}

export function GanttRow({
  task, weekWidth, taskColWidth, currentWeek, index, isDragging, isReadOnly,
  onUpdate, onDelete, onDragHandleMouseDown,
}: GanttRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed) onUpdate({ name: trimmed });
    else setDraft(task.name);
    setEditing(false);
  };

  useEffect(() => {
    if (!showDeleteConfirm) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDeleteConfirm(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showDeleteConfirm]);

  return (
    <>
    {showDeleteConfirm && (
      <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="delete-confirm-title">
          <Text as="h2" variant="heading-sm" id="delete-confirm-title">Delete task?</Text>
          <Text as="p" variant="body-sm" className={styles.subtitle}>
            "{task.name}" will be permanently removed.
          </Text>
          <div className={styles.modalActions}>
            <SecondaryButton as="button" size="medium" variant="default" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton as="button" size="medium" variant="destructive" onClick={onDelete}>
              Delete
            </PrimaryButton>
          </div>
        </div>
      </div>
    )}
    <div className={`${styles.row} ${isDragging ? styles.rowDragging : ''}`}>
      {/* ── Task label column ────────────────────────────── */}
      <div className={styles.taskCol} style={{ width: taskColWidth }}>
        <div className={styles.taskColInner}>

          {/* Drag handle */}
          {!isReadOnly && (
            <div
              className={styles.dragHandle}
              onMouseDown={onDragHandleMouseDown}
              title="Drag to reorder"
            >
              <span className={styles.dragHandleDots} />
            </div>
          )}

          {/* Task name (editable in edit mode, plain in read-only) */}
          {editing && !isReadOnly ? (
            <input
              ref={inputRef}
              className={styles.taskNameInput}
              value={draft}
              autoFocus
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') { setDraft(task.name); setEditing(false); }
              }}
            />
          ) : task.jiraUrl ? (
            <a
              href={task.jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.taskName} ${styles.taskNameLink}`}
              title={task.name}
              onDoubleClick={isReadOnly ? undefined : e => { e.preventDefault(); setDraft(task.name); setEditing(true); }}
            >
              {task.name}
            </a>
          ) : (
            <span
              className={styles.taskName}
              onClick={isReadOnly ? undefined : () => { setDraft(task.name); setEditing(true); }}
              title={isReadOnly ? task.name : 'Click to edit'}
              style={isReadOnly ? { cursor: 'default' } : undefined}
            >
              {task.name}
            </span>
          )}

          {/* Jira badge */}
          {task.jiraKey && task.jiraUrl && (
            <a
              href={task.jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.jiraBadge}
              title={task.jiraKey}
              onClick={e => e.stopPropagation()}
            >
              {task.jiraKey}
            </a>
          )}

          {/* Delete */}
          {!isReadOnly && (
            <button
              className={styles.deleteBtn}
              onClick={() => setShowDeleteConfirm(true)}
              aria-label={`Delete task: ${task.name}`}
            >
              <Icon name="close" size="small" />
            </button>
          )}
        </div>
      </div>

      {/* ── Timeline column ──────────────────────────────── */}
      <div className={styles.timelineCol} style={{ width: WEEKS * weekWidth + (currentWeek ? CURRENT_WEEK_EXTRA : 0) }}>
        {/* Week grid lines + current week highlight + hackathon */}
        {Array.from({ length: WEEKS }, (_, i) => {
          const weekNum = i + 1;
          const isCurrent = currentWeek === weekNum;
          const isHackathon = weekNum === HACKATHON_WEEK;
          const cls = [
            styles.gridLine,
            isCurrent ? styles.gridLineCurrent : '',
            isHackathon ? styles.gridLineHackathon : '',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={i}
              className={cls}
              style={{
                left: weekToPixel(weekNum, weekWidth, currentWeek),
                width: isCurrent ? weekWidth + CURRENT_WEEK_EXTRA : weekWidth,
              }}
            />
          );
        })}

        {/* Draggable bar */}
        <GanttBar
          task={task}
          weekWidth={weekWidth}
          currentWeek={currentWeek}
          isReadOnly={isReadOnly}
          onMove={(s, e) => onUpdate({ startWeek: s, endWeek: e })}
          onStatusChange={s => onUpdate({ status: s })}
        />
      </div>
    </div>
    </>
  );
}
