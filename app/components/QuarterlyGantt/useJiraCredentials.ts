'use client';

import { useState, useEffect, useCallback } from 'react';
import { JiraCredentials } from './gantt.types';

const STORAGE_KEY = 'gantt_jira_credentials';

export function useJiraCredentials() {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCredentials(JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
  }, []);

  const save = useCallback((creds: JiraCredentials) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setCredentials(creds);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCredentials(null);
  }, []);

  return { credentials, save, clear };
}
