# Quarterly Design Gantt Chart

A designer-facing tool to add, track, and manage design tasks across a single quarter using a draggable Gantt chart, built with Heart Design System components from the Heart Playground repo.

---

## Overview

| Property | Value |
|---|---|
| **Project** | Consumer Page Redesign |
| **Tool type** | Internal design planning utility |
| **Design System** | Heart (GoFundMe) |
| **Component source** | `heart-playground` repo |
| **Time frame** | 1 quarter (13 weeks / ~3 months) |
| **Axes** | Y = Design tasks · X = Weekly timeline |

---

## Feature Requirements

### 1. Gantt Chart View

- **X-axis (Timeline):** Divided into weeks spanning the full quarter (e.g., Week 1 – Week 13). Display month labels as major markers and week numbers as minor markers.
- **Y-axis (Tasks):** Each row represents one design task/project. Rows are dynamically added or removed as the designer manages their list.
- **Task bars:** Horizontal bars representing the start and end week of each task. Bars are resizable via drag handles on either end to adjust the timeline.

### 2. Task Management

Designers can:

- **Add** a new task row via a "+ Add Task" button, prompting input for task name and optional metadata (owner, status, priority).
- **Edit** a task name inline by clicking on the label in the Y-axis.
- **Delete** a task row via a trash/remove icon that appears on hover.
- **Reorder** tasks by dragging rows up and down the Y-axis.

### 3. Bar/Timeline Interaction

- **Drag to move:** Click and drag the entire bar left or right to shift the task's start and end dates.
- **Resize:** Drag the left or right edge handle of a bar to extend or shorten the task duration.
- **Snap to week:** All movements snap to weekly increments.
- **Minimum duration:** 1 week.

### 4. Task Status

Each task bar supports a status indicator:

| Status | Heart Token | Color |
|---|---|---|
| Not Started | `surface-neutral-subtle` | Gray |
| In Progress | `surface-info-subtle` | Blue |
| Review | `surface-warning-subtle` | Yellow |
| Complete | `surface-positive-subtle` | Green |
| Blocked | `surface-critical-subtle` | Red |

Status can be toggled via a dropdown or right-click context menu on the bar.

---

## Heart Design System Components

> Import all components from the Heart Playground repo.
> Update import paths to match your internal package alias (e.g., `@gofundme/heart`).

```tsx
import { Button } from '@gofundme/heart/Button';
import { IconButton } from '@gofundme/heart/IconButton';
import { TextInput } from '@gofundme/heart/TextInput';
import { Select } from '@gofundme/heart/Select';
import { Badge } from '@gofundme/heart/Badge';
import { Tooltip } from '@gofundme/heart/Tooltip';
import { Modal } from '@gofundme/heart/Modal';
import { Text } from '@gofundme/heart/Text';
import { tokens } from '@gofundme/heart/tokens';
```

### Component Mapping

| UI Element | Heart Component |
|---|---|
| "+ Add Task" button | `<Button variant="secondary" iconLeft={<PlusIcon />}>Add Task</Button>` |
| Delete task | `<IconButton icon={<TrashIcon />} aria-label="Delete task" />` |
| Edit task name | `<TextInput size="sm" />` (inline, on row click) |
| Status selector | `<Select options={statusOptions} />` |
| Task label | `<Text variant="body-sm" weight="medium" />` |
| Week header | `<Text variant="label-xs" color="text-subtle" />` |
| Quarter label | `<Text variant="heading-sm" />` |
| Status pill on bar | `<Badge variant={statusVariant} />` |
| Hover actions | `<Tooltip content="Delete" />` wrapping `<IconButton />` |
| Add task modal | `<Modal title="Add New Task" />` |

### Design Tokens in Use

```ts
// Spacing
tokens.space[2]   // row padding
tokens.space[4]   // section gap

// Typography
tokens.font.size.sm   // task labels
tokens.font.size.xs   // week numbers

// Radius
tokens.radius.sm   // task bar corners

// Color (semantic)
tokens.color['surface-neutral-subtle']
tokens.color['surface-info-subtle']
tokens.color['surface-positive-subtle']
tokens.color['surface-warning-subtle']
tokens.color['surface-critical-subtle']
tokens.color['border-default']
tokens.color['text-default']
tokens.color['text-subtle']
```

---

## Component File Structure

```
src/
└── components/
    └── QuarterlyGantt/
        ├── QuarterlyGantt.tsx       # Root component
        ├── GanttHeader.tsx          # X-axis week/month labels
        ├── GanttRow.tsx             # Single task row (label + bar)
        ├── GanttBar.tsx             # Draggable/resizable task bar
        ├── AddTaskModal.tsx         # Modal for adding a new task
        ├── StatusDropdown.tsx       # Status selector using Heart Select
        ├── useGanttState.ts         # State management hook
        ├── gantt.types.ts           # TypeScript interfaces
        └── QuarterlyGantt.stories.tsx  # Heart Playground / Storybook story
```

---

## Data Model

```ts
// gantt.types.ts

export type TaskStatus =
  | 'not-started'
  | 'in-progress'
  | 'review'
  | 'complete'
  | 'blocked';

export interface GanttTask {
  id: string;           // UUID
  name: string;
  startWeek: number;    // 1–13
  endWeek: number;      // 1–13, must be >= startWeek
  status: TaskStatus;
  owner?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface GanttQuarter {
  label: string;        // e.g., "Q2 2025"
  startDate: string;    // ISO date string for Week 1
  tasks: GanttTask[];
}
```

---

## Storybook Story (Heart Playground)

```tsx
// QuarterlyGantt.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { QuarterlyGantt } from './QuarterlyGantt';

const meta: Meta<typeof QuarterlyGantt> = {
  title: 'Design Tools / Quarterly Gantt',
  component: QuarterlyGantt,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof QuarterlyGantt>;

export const Default: Story = {
  args: {
    quarter: {
      label: 'Q2 2025',
      startDate: '2025-04-01',
      tasks: [
        { id: '1', name: 'Discovery & Research', startWeek: 1, endWeek: 3, status: 'complete' },
        { id: '2', name: 'Wireframing', startWeek: 3, endWeek: 5, status: 'in-progress' },
        { id: '3', name: 'Visual Design', startWeek: 5, endWeek: 9, status: 'not-started' },
        { id: '4', name: 'Prototype & Handoff', startWeek: 9, endWeek: 11, status: 'not-started' },
        { id: '5', name: 'QA & Review', startWeek: 11, endWeek: 13, status: 'not-started' },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    quarter: {
      label: 'Q3 2025',
      startDate: '2025-07-01',
      tasks: [],
    },
  },
};
```

---

## Accessibility

- All interactive elements (bar handles, row actions) must be keyboard-navigable.
- Use `aria-label` on all `<IconButton>` instances (e.g., `"Delete task: Wireframing"`).
- Task status changes should announce via `aria-live="polite"`.
- Color alone must not convey status — always pair color with a text label or icon (Heart `<Badge>` handles this by default).
- Minimum touch target: 44×44px for drag handles on mobile.

---

## Jira Integration

### Overview

Designers can optionally paste a Jira ticket URL or issue key when adding a task. The Gantt chart will display the Jira ticket's summary as the task name (truncated on overflow), and clicking it opens the ticket in a new tab.

The integration is multi-user friendly: Jira credentials are entered via an in-app auth flow so any designer on the team can connect their own account without touching environment variables.

### Auth Flow

1. On first use of the Jira feature (or when credentials are missing/expired), a **"Connect Jira"** modal appears.
2. The designer enters:
   - **Jira domain** — e.g. `yourcompany.atlassian.net`
   - **Email** — their Atlassian account email
   - **API token** — generated at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Credentials are validated by fetching the user's profile from the Jira REST API.
4. On success, credentials are saved to `localStorage` so the designer stays connected across sessions.
5. A **"Disconnect Jira"** option is available in the toolbar to clear stored credentials.

### Add Task with Jira Ticket

- In the **Add Task** modal, an optional **"Jira ticket"** field accepts:
  - A full URL: `https://yourcompany.atlassian.net/browse/PROJ-123`
  - A bare issue key: `PROJ-123`
- On submit, the app calls the Jira REST API (`GET /rest/api/3/issue/{key}`) to fetch the issue summary.
- The fetched summary becomes the task name in the Gantt.
- If the API call fails (invalid key, auth error), the user is shown an inline error and can still add the task with a manual name.

### Gantt Row Display

- Tasks linked to a Jira ticket show the issue key as a small badge (e.g. `PROJ-123`) next to the task name.
- The task name text is truncated with ellipsis on overflow (existing behavior).
- Clicking the issue key badge opens the Jira ticket URL in a new tab (`target="_blank" rel="noopener noreferrer"`).

### Data Model Update

```ts
export interface GanttTask {
  id: string;
  name: string;
  startWeek: number;
  endWeek: number;
  status: TaskStatus;
  owner?: string;
  priority?: 'low' | 'medium' | 'high';
  // Jira integration
  jiraKey?: string;    // e.g. "PROJ-123"
  jiraUrl?: string;    // full browse URL
}
```

### Jira Credentials (localStorage shape)

```ts
interface JiraCredentials {
  domain: string;   // "yourcompany.atlassian.net"
  email: string;
  apiToken: string;
}
// stored under key: "gantt_jira_credentials"
```

### File Structure Additions

```
QuarterlyGantt/
├── JiraAuthModal.tsx       # Connect Jira credentials modal
├── useJiraCredentials.ts   # Read/write credentials from localStorage
├── jira.api.ts             # Jira REST API helpers (fetchIssue, validateCredentials)
```

---

## Open Questions / To Confirm with Team

- [ ] What is the exact Heart Playground import path for this team's repo? (e.g., `@gofundme/heart`, `@heart/ui`, etc.)
- [ ] Should task data persist to a backend/API or be session-only?
- [ ] Is there a quarter-switcher needed (Q1/Q2/Q3/Q4 navigation)?
- [ ] Should tasks support subtasks or dependencies (arrows between bars)?
- [ ] Who is the audience — individual designers, or shared team view?
