'use client';

import { JiraCredentials } from './gantt.types';

export interface JiraIssue {
  key: string;
  summary: string;
  url: string;
}

function browseUrl(domain: string, key: string): string {
  return `https://${domain}/browse/${key}`;
}

/** Parse a raw input into an issue key.
 *  Accepts full URLs like https://foo.atlassian.net/browse/PROJ-123
 *  or bare keys like PROJ-123.
 */
export function parseIssueKey(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/browse\/([A-Z][A-Z0-9_]+-\d+)/i);
  if (urlMatch) return urlMatch[1].toUpperCase();
  const keyMatch = trimmed.match(/^([A-Z][A-Z0-9_]+-\d+)$/i);
  if (keyMatch) return keyMatch[1].toUpperCase();
  return null;
}

async function jiraFetch(creds: JiraCredentials, path: string) {
  const res = await fetch('/api/jira', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: creds.domain, email: creds.email, apiToken: creds.apiToken, path }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      res.status === 401 ? 'Invalid credentials' :
      res.status === 404 ? 'Issue not found' :
      `Jira error: ${res.status}`
    );
  }
  return data;
}

/** Validate credentials by fetching the current user profile. */
export async function validateJiraCredentials(creds: JiraCredentials): Promise<void> {
  await jiraFetch(creds, '/rest/api/3/myself');
}

/** Fetch a single Jira issue by key. */
export async function fetchJiraIssue(creds: JiraCredentials, key: string): Promise<JiraIssue> {
  const data = await jiraFetch(creds, `/rest/api/3/issue/${key}?fields=summary`);
  return {
    key: data.key,
    summary: data.fields.summary,
    url: browseUrl(creds.domain, data.key),
  };
}
