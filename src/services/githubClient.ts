import { BuildRequest, GithubSettings } from '../types/buildFeed';

/**
 * Handles the create github issue workflow for BlueprintForge users or services.
 * Used where this module coordinates UI state, persistence, integrations or user actions.
 */
export async function createGithubIssue(request: BuildRequest, settings: GithubSettings) {
  if (!settings.github_token || !settings.repo_owner || !settings.repo_name) {
    throw new Error('Missing GitHub configuration');
  }

  const url = `https://api.github.com/repos/${settings.repo_owner}/${settings.repo_name}/issues`;
  
  const bodyContent = `
## Context
${request.polished_context}

## Requested Change
${request.polished_change}

## Expected UI/UX
${request.polished_ui_ux}

## Acceptance Criteria
${request.acceptance_criteria.map(c => `- [ ] ${c}`).join('\n')}

---
**Priority:** ${request.priority}
**Difficulty:** ${request.difficulty}
**Type:** ${request.type}
`;

  const labels = [
    `priority:${request.priority.toLowerCase()}`,
    `difficulty:${request.difficulty.toLowerCase()}`,
    `type:${request.type.toLowerCase().replace(/\s+/g, '-')}`,
    `status:open`
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${settings.github_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: request.polished_title,
      body: bodyContent,
      labels: labels,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
  }

  const data = await response.json();
  
  return {
    url: data.html_url,
    number: data.number,
  };
}
