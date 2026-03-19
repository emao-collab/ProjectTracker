'use client';

import { useState, useRef, useEffect } from 'react';
import { PrimaryButton, SecondaryButton, Text, Icon } from '@gfm-heart/components';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import { AddTaskModal } from './AddTaskModal';
import { JiraAuthModal } from './JiraAuthModal';
import { useGanttState } from './useGanttState';
import { useJiraCredentials } from './useJiraCredentials';
import { STATUS_CONFIG, TaskStatus, WEEKS, CURRENT_WEEK_EXTRA, GanttQuarter } from './gantt.types';

import styles from './QuarterlyGantt.module.scss';

const MIN_WEEK_WIDTH = 48;
const DEFAULT_TASK_COL = 320;
const ROW_HEIGHT = 48;

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getCurrentWeek(startDate: string): number | null {
  const start = parseLocalDate(startDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const week = Math.floor(diffDays / 7) + 1;
  return week >= 1 && week <= WEEKS ? week : null;
}

function encodeShare(quarter: GanttQuarter): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(quarter))));
}

function decodeShare(raw: string): GanttQuarter | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  } catch {
    return null;
  }
}

export function QuarterlyGantt() {
  const { quarter, addTask, updateTask, deleteTask, reorderTasks } = useGanttState();
  const { credentials, save: saveCredentials, clear: clearCredentials } = useJiraCredentials();
  const [showModal, setShowModal] = useState(false);
  const [showJiraAuth, setShowJiraAuth] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharedView, setSharedView] = useState<GanttQuarter | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [weekWidth, setWeekWidth] = useState(MIN_WEEK_WIDTH);
  const [taskColWidth, setTaskColWidth] = useState(DEFAULT_TASK_COL);
  const [dragState, setDragState] = useState<{ fromIndex: number; dropLine: number } | null>(null);
  const dragStateRef = useRef<{ fromIndex: number; dropLine: number } | null>(null);

  // Detect share param on mount
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('share');
    if (param) setSharedView(decodeShare(param));
  }, []);

  const isReadOnly = sharedView !== null;
  const view = sharedView ?? quarter;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      const cw = getCurrentWeek(view.startDate);
      setWeekWidth(Math.max(MIN_WEEK_WIDTH, (width - taskColWidth - (cw ? CURRENT_WEEK_EXTRA : 0)) / WEEKS));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [taskColWidth, view.startDate]);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?share=${encodeShare(quarter)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDragHandleMouseDown = (fromIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const n = quarter.tasks.length;
    const initial = { fromIndex, dropLine: fromIndex };
    dragStateRef.current = initial;
    setDragState(initial);

    const onMouseMove = (ev: MouseEvent) => {
      if (!bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const relY = ev.clientY - rect.top;
      const dropLine = Math.max(0, Math.min(n, Math.round(relY / ROW_HEIGHT)));
      const next = { fromIndex, dropLine };
      dragStateRef.current = next;
      setDragState(next);
    };

    const onMouseUp = () => {
      const current = dragStateRef.current;
      if (current) {
        const toIndex = current.dropLine > current.fromIndex
          ? current.dropLine - 1
          : current.dropLine;
        if (toIndex !== current.fromIndex) reorderTasks(current.fromIndex, toIndex);
      }
      dragStateRef.current = null;
      setDragState(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const currentWeek = getCurrentWeek(view.startDate);

  return (
    <div className={styles.root}>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.toolbarTitleRow}>
            <Text as="h1" variant="heading-lg">{view.label}</Text>
            {isReadOnly && (
              <span className={styles.viewOnlyBadge}>View only</span>
            )}
          </div>

          {/* Status counts */}
          <div className={styles.legend}>
            {(Object.entries(STATUS_CONFIG) as [TaskStatus, typeof STATUS_CONFIG[TaskStatus]][]).map(
              ([key, cfg]) => {
                const count = view.tasks.filter(t => t.status === key).length;
                return (
                  <div key={key} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: cfg.color, border: `1px solid ${cfg.color === '#f5f5f5' ? '#d8d8d8' : cfg.color}` }} />
                    <Text as="span" variant="body-xs">{cfg.label}</Text>
                    <Text as="span" variant="body-xs" className={styles.legendCount}>{count}</Text>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {!isReadOnly && (
          <>
            {/* Jira connect (only shown when not connected) */}
            {!credentials && (
              <SecondaryButton as="button" size="medium" variant="default" onClick={() => setShowJiraAuth(true)}>
                Connect Jira
              </SecondaryButton>
            )}

            {/* Share button */}
            <SecondaryButton as="button" size="medium" variant="default" onClick={handleShare}>
              <Icon name="share" size="default" />
              {copied ? 'Link copied!' : 'Share'}
            </SecondaryButton>

            <PrimaryButton as="button" size="medium" variant="default" onClick={() => setShowModal(true)}>
              <Icon name="add" size="default" />
              Add Task
            </PrimaryButton>
          </>
        )}
      </div>

      {/* ── Gantt table ──────────────────────────────────── */}
      <div className={styles.ganttWrapper} ref={wrapperRef}>
        <GanttHeader
          startDate={view.startDate}
          weekWidth={weekWidth}
          taskColWidth={taskColWidth}
          onTaskColResize={isReadOnly ? () => {} : setTaskColWidth}
          currentWeek={currentWeek}
        />

        <div className={styles.ganttBody} ref={bodyRef} style={{ position: 'relative' }}>
          {view.tasks.length === 0 ? (
            <div className={styles.empty}>
              <Text as="p" variant="body-md">No tasks yet. Click "Add Task" to get started.</Text>
            </div>
          ) : (
            view.tasks.map((task, i) => (
              <GanttRow
                key={task.id}
                task={task}
                weekWidth={weekWidth}
                taskColWidth={taskColWidth}
                currentWeek={currentWeek}
                index={i}
                isReadOnly={isReadOnly}
                isDragging={dragState?.fromIndex === i}
                onUpdate={patch => updateTask(task.id, patch)}
                onDelete={() => deleteTask(task.id)}
                onDragHandleMouseDown={handleDragHandleMouseDown(i)}
              />
            ))
          )}

          {/* Drop indicator line */}
          {dragState && (
            <div
              className={styles.dropIndicator}
              style={{ top: dragState.dropLine * ROW_HEIGHT }}
            />
          )}
        </div>
      </div>

      {/* ── Add task modal ────────────────────────────────── */}
      {showModal && (
        <AddTaskModal
          jiraCredentials={credentials}
          existingJiraKeys={quarter.tasks.map(t => t.jiraKey).filter(Boolean) as string[]}
          onAdd={(name, jiraKey, jiraUrl) => addTask(name, jiraKey, jiraUrl)}
          onClose={() => setShowModal(false)}
          onConnectJira={() => { setShowModal(false); setShowJiraAuth(true); }}
        />
      )}

      {/* ── Jira auth modal ───────────────────────────────── */}
      {showJiraAuth && (
        <JiraAuthModal
          onConnect={creds => { saveCredentials(creds); setShowJiraAuth(false); }}
          onClose={() => setShowJiraAuth(false)}
        />
      )}

      {/* ── Disconnect Jira confirmation ──────────────────── */}
      {showDisconnectConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDisconnectConfirm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="disconnect-title">
            <Text as="h2" variant="heading-sm" id="disconnect-title">Disconnect Jira?</Text>
            <Text as="p" variant="body-sm" className={styles.subtitle}>
              Your credentials will be removed from this browser. Existing tasks linked to Jira tickets will keep their links.
            </Text>
            <div className={styles.modalActions}>
              <SecondaryButton as="button" size="medium" variant="default" onClick={() => setShowDisconnectConfirm(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton as="button" size="medium" variant="destructive" onClick={() => { clearCredentials(); setShowDisconnectConfirm(false); }}>
                Disconnect
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
