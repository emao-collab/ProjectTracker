'use client';

import { useState, useEffect, useRef } from 'react';
import { PrimaryButton, SecondaryButton, Text } from '@gfm-heart/components';
import { JiraCredentials } from './gantt.types';
import { fetchJiraIssue, parseIssueKey, JiraIssue } from './jira.api';
import styles from './QuarterlyGantt.module.scss';

interface AddTaskModalProps {
  jiraCredentials: JiraCredentials | null;
  existingJiraKeys: string[];
  onAdd: (name: string, jiraKey?: string, jiraUrl?: string) => void;
  onClose: () => void;
  onConnectJira: () => void;
}

export function AddTaskModal({ jiraCredentials, existingJiraKeys, onAdd, onClose, onConnectJira }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [jiraInput, setJiraInput] = useState('');
  const [jiraIssue, setJiraIssue] = useState<JiraIssue | null>(null);
  const [jiraError, setJiraError] = useState('');
  const [jiraLoading, setJiraLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const jiraInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasInput = () => name.trim().length > 0 || jiraInput.trim().length > 0;

  const handleCancel = () => {
    if (hasInput()) setShowCancelConfirm(true);
    else onClose();
  };

  useEffect(() => {
    jiraInputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const lookupJira = async () => {
    if (!jiraCredentials) { onConnectJira(); return; }
    setJiraError('');
    setJiraIssue(null);
    const key = parseIssueKey(jiraInput);
    if (!key) { setJiraError('Invalid Jira ticket key or URL.'); return; }
    if (existingJiraKeys.includes(key)) {
      setJiraError(`${key} is already on the board.`);
      return;
    }
    setJiraLoading(true);
    try {
      const issue = await fetchJiraIssue(jiraCredentials, key);
      setJiraIssue(issue);
      if (!name.trim()) setName(issue.summary);
    } catch (e: any) {
      setJiraError(e.message || 'Could not fetch Jira issue.');
    } finally {
      setJiraLoading(false);
    }
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, jiraIssue?.key, jiraIssue?.url);
    onClose();
  };

  if (showCancelConfirm) {
    return (
      <div className={styles.modalOverlay} onClick={() => setShowCancelConfirm(false)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="cancel-confirm-title">
          <Text as="h2" variant="heading-sm" id="cancel-confirm-title">Discard task?</Text>
          <Text as="p" variant="body-sm" className={styles.subtitle}>
            You have unsaved changes. Are you sure you want to discard them?
          </Text>
          <div className={styles.modalActions}>
            <SecondaryButton as="button" size="medium" variant="default" onClick={() => setShowCancelConfirm(false)}>
              Keep editing
            </SecondaryButton>
            <PrimaryButton as="button" size="medium" variant="destructive" onClick={onClose}>
              Discard
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="modal-title">
        <Text as="h2" variant="heading-sm" id="modal-title">Add New Task</Text>

        {/* Jira ticket field */}
        <div className={styles.modalField}>
          <label className={styles.modalLabel} htmlFor="jira-ticket">
            Jira ticket
            <span className={styles.modalLabelOptional}> — optional</span>
          </label>
          <div className={styles.jiraInputRow}>
            <input
              ref={jiraInputRef}
              id="jira-ticket"
              className={styles.modalInput}
              placeholder="PROJ-123 or paste Jira URL"
              value={jiraInput}
              onChange={e => { setJiraInput(e.target.value); setJiraIssue(null); setJiraError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') lookupJira(); }}
            />
            <SecondaryButton
              as="button"
              size="medium"
              variant="default"
              onClick={lookupJira}
              disabled={!jiraInput.trim() || jiraLoading}
            >
              {jiraLoading ? '…' : 'Look up'}
            </SecondaryButton>
          </div>
          {!jiraCredentials && (
            <button className={styles.jiraConnectPrompt} onClick={onConnectJira} type="button">
              Connect Jira to look up tickets →
            </button>
          )}
          {jiraIssue && (
            <div className={styles.jiraIssuePill}>
              <span className={styles.jiraKey}>{jiraIssue.key}</span>
              <span className={styles.jiraIssueSummary}>{jiraIssue.summary}</span>
            </div>
          )}
          {jiraError && (
            <Text as="p" variant="body-sm" className={styles.jiraError}>{jiraError}</Text>
          )}
        </div>

        {/* Task name */}
        <div className={styles.modalField}>
          <label className={styles.modalLabel} htmlFor="task-name">Task name</label>
          <input
            ref={inputRef}
            id="task-name"
            className={styles.modalInput}
            placeholder="e.g. Visual Design"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          />
        </div>

        <div className={styles.modalActions}>
          <SecondaryButton as="button" size="medium" variant="default" onClick={handleCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton as="button" size="medium" variant="default" onClick={submit} disabled={!name.trim()}>
            Add Task
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
