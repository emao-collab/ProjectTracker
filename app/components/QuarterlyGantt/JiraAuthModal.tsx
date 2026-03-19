'use client';

import { useState, useEffect } from 'react';
import { PrimaryButton, SecondaryButton, Text } from '@gfm-heart/components';
import { JiraCredentials } from './gantt.types';
import { validateJiraCredentials } from './jira.api';
import styles from './QuarterlyGantt.module.scss';

interface JiraAuthModalProps {
  onConnect: (creds: JiraCredentials) => void;
  onClose: () => void;
}

export function JiraAuthModal({ onConnect, onClose }: JiraAuthModalProps) {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const connect = async () => {
    setError('');
    const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const cleanEmail = email.trim();
    const cleanToken = apiToken.trim();

    if (!cleanDomain || !cleanEmail || !cleanToken) {
      setError('All fields are required.');
      return;
    }

    const creds: JiraCredentials = { domain: cleanDomain, email: cleanEmail, apiToken: cleanToken };
    setLoading(true);
    try {
      await validateJiraCredentials(creds);
      onConnect(creds);
    } catch (e: any) {
      setError(e.message || 'Could not connect to Jira. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="jira-modal-title">
        <div className={styles.jiraModalHeader}>
          <Text as="h2" variant="heading-sm" id="jira-modal-title">Connect Jira</Text>
          <Text as="p" variant="body-sm" className={styles.subtitle}>
            Enter your Atlassian credentials. They're stored locally in your browser only.
          </Text>
        </div>

        <div className={styles.modalField}>
          <label className={styles.modalLabel} htmlFor="jira-domain">Jira domain</label>
          <input
            id="jira-domain"
            className={styles.modalInput}
            placeholder="yourcompany.atlassian.net"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') connect(); }}
          />
        </div>

        <div className={styles.modalField}>
          <label className={styles.modalLabel} htmlFor="jira-email">Email</label>
          <input
            id="jira-email"
            type="email"
            className={styles.modalInput}
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') connect(); }}
          />
        </div>

        <div className={styles.modalField}>
          <label className={styles.modalLabel} htmlFor="jira-token">
            API token
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.jiraTokenLink}
            >
              Get a token ↗
            </a>
          </label>
          <input
            id="jira-token"
            type="password"
            className={styles.modalInput}
            placeholder="API token from Atlassian"
            value={apiToken}
            onChange={e => setApiToken(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') connect(); }}
          />
        </div>

        {error && (
          <Text as="p" variant="body-sm" className={styles.jiraError}>{error}</Text>
        )}

        <div className={styles.modalActions}>
          <SecondaryButton as="button" size="medium" variant="default" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            as="button"
            size="medium"
            variant="default"
            onClick={connect}
            disabled={loading || !domain.trim() || !email.trim() || !apiToken.trim()}
          >
            {loading ? 'Connecting…' : 'Connect'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
