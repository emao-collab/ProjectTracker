export type TaskStatus =
  | 'not-started'
  | 'in-progress'
  | 'review'
  | 'complete'
  | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface GanttTask {
  id: string;
  name: string;
  startWeek: number;   // 1–13
  endWeek: number;     // 1–13, must be >= startWeek
  status: TaskStatus;
  owner?: string;
  priority?: TaskPriority;
  jiraKey?: string;    // e.g. "PROJ-123"
  jiraUrl?: string;    // full browse URL
}

export interface JiraCredentials {
  domain: string;   // "yourcompany.atlassian.net"
  email: string;
  apiToken: string;
}

export interface GanttQuarter {
  label: string;       // e.g. "Q2 2025"
  startDate: string;   // ISO date string for Week 1
  tasks: GanttTask[];
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; token: string }> = {
  'not-started': { label: 'Not Started', color: '#f5f5f5',  token: 'surface-neutral-subtle' },
  'in-progress': { label: 'In Progress', color: '#e8f0fe',  token: 'surface-info-subtle' },
  'review':      { label: 'Review',      color: '#fef9e7',  token: 'surface-warning-subtle' },
  'complete':    { label: 'Complete',    color: '#e6f4ea',  token: 'surface-positive-subtle' },
  'blocked':     { label: 'Blocked',     color: '#fce8e6',  token: 'surface-critical-subtle' },
};

export const STATUS_BORDER: Record<TaskStatus, string> = {
  'not-started': '#d8d8d8',
  'in-progress': '#aecbfa',
  'review':      '#f9ca76',
  'complete':    '#81c995',
  'blocked':     '#f28b82',
};

export const WEEKS = 15;
export const CURRENT_WEEK_EXTRA = 28; // extra px for the current week column

/**
 * Convert a fractional 1-based week number to a pixel offset,
 * accounting for the wider current week column.
 */
export function weekToPixel(
  weekFloat: number,
  weekWidth: number,
  currentWeek: number | null,
): number {
  if (currentWeek === null) return (weekFloat - 1) * weekWidth;
  const wf = weekFloat - 1; // 0-based
  const cw = currentWeek - 1; // 0-based
  if (wf <= cw) return wf * weekWidth;
  if (wf >= cw + 1) return wf * weekWidth + CURRENT_WEEK_EXTRA;
  // within current week — interpolate
  return cw * weekWidth + (wf - cw) * (weekWidth + CURRENT_WEEK_EXTRA);
}
