'use client';

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GanttTask, GanttQuarter, TaskStatus } from './gantt.types';

const STORAGE_KEY = 'gantt_quarter';

function getCurrentQuarter(): GanttQuarter {
  return { label: 'Q2 2026', startDate: '2026-03-16', tasks: [] };
}

function loadQuarter(): GanttQuarter {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getCurrentQuarter();
}

export function useGanttState() {
  const [quarter, setQuarter] = useState<GanttQuarter>(getCurrentQuarter);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    setQuarter(loadQuarter());
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quarter));
  }, [quarter, hydrated]);

  const addTask = useCallback((name: string, jiraKey?: string, jiraUrl?: string) => {
    const newTask: GanttTask = {
      id: uuidv4(),
      name,
      startWeek: 1,
      endWeek: 2,
      status: 'not-started',
      ...(jiraKey ? { jiraKey, jiraUrl } : {}),
    };
    setQuarter(q => ({ ...q, tasks: [...q.tasks, newTask] }));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<GanttTask>) => {
    setQuarter(q => ({
      ...q,
      tasks: q.tasks.map(t => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setQuarter(q => ({ ...q, tasks: q.tasks.filter(t => t.id !== id) }));
  }, []);

  const reorderTasks = useCallback((fromIndex: number, toIndex: number) => {
    setQuarter(q => {
      const tasks = [...q.tasks];
      const [moved] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, moved);
      return { ...q, tasks };
    });
  }, []);

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    updateTask(id, { status });
  }, [updateTask]);

  const moveBar = useCallback((id: string, startWeek: number, endWeek: number) => {
    updateTask(id, { startWeek, endWeek });
  }, [updateTask]);

  const setQuarterLabel = useCallback((label: string) => {
    setQuarter(q => ({ ...q, label }));
  }, []);

  return { quarter, addTask, updateTask, deleteTask, reorderTasks, setStatus, moveBar, setQuarterLabel };
}
