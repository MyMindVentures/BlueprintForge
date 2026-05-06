import React from "react";
import { BuildStatus } from "../../types/buildFeed";
import { useI18n } from "../../i18n/I18nProvider";

type BadgeColor = "success" | "warning" | "error" | "info" | "idle";

type KnownStatus = BuildStatus |
  "Draft" | "Published" | "Archived" | "In Review" | "Changes Requested" |
  "Incomplete" | "Complete" | "Verified" | "Not Verified" | "Eligible to Claim" | "Not Eligible to Claim" |
  "Repo Not Connected" | "Repo Connected" | "Issue Pending" | "Issue Created" | "Issue Failed" | "PR Waiting" | "PR Submitted" | "PR Reviewed" |
  "Not Configured" | "Configured" | "Connection Untested" | "Connected" | "Connection Failed" | "Model Synced" |
  "Not tested" | "Invalid" | "No Credits" | "Rate Limited" | "Error" | "Network Error" |
  "Unread" | "Read" | "Action Required" |
  "Demo Mode" | "Demo Data Active" | "Production Protected" |
  "Draft Version" | "Published Version" | "Latest Version" | "Acknowledged" | "Not Yet Acknowledged" |
  "Active" | "Converted" | "Updated" | "Ready" | "Missing" | "Nominal";

interface StatusBadgeProps {
  status?: KnownStatus | BadgeColor | string;
  /** Already-localized or explicitly dynamic display text. Prefer labelKey for canonical status labels. */
  label?: string;
  labelKey?: string;
  className?: string;
  dot?: boolean;
}

const colors: BadgeColor[] = ["success", "warning", "error", "info", "idle"];

const mapping: Partial<Record<KnownStatus, { color: BadgeColor; labelKey: string }>> = {
  'Open': { color: 'info', labelKey: 'statuses.open' },
  'Claimed': { color: 'warning', labelKey: 'statuses.claimed' },
  'In Progress': { color: 'warning', labelKey: 'statuses.inProgress' },
  'Ready for Review': { color: 'warning', labelKey: 'statuses.readyForReview' },
  'Draft': { color: 'idle', labelKey: 'statuses.draft' },
  'Published': { color: 'info', labelKey: 'statuses.published' },
  'Archived': { color: 'idle', labelKey: 'statuses.archived' },
  'In Review': { color: 'warning', labelKey: 'statuses.inReview' },
  'Changes Requested': { color: 'error', labelKey: 'statuses.changesRequested' },
  'Accepted': { color: 'success', labelKey: 'statuses.accepted' },
  'Rejected': { color: 'error', labelKey: 'statuses.rejected' },
  'Needs Changes': { color: 'error', labelKey: 'statuses.needsChanges' },
  'Done': { color: 'success', labelKey: 'statuses.done' },
  'Incomplete': { color: 'warning', labelKey: 'statuses.incomplete' },
  'Complete': { color: 'success', labelKey: 'statuses.complete' },
  'Verified': { color: 'success', labelKey: 'statuses.verified' },
  'Not Verified': { color: 'idle', labelKey: 'statuses.notVerified' },
  'Eligible to Claim': { color: 'success', labelKey: 'statuses.eligibleToClaim' },
  'Not Eligible to Claim': { color: 'warning', labelKey: 'statuses.notEligibleToClaim' },
  'Repo Not Connected': { color: 'idle', labelKey: 'statuses.repoNotConnected' },
  'Repo Connected': { color: 'success', labelKey: 'statuses.repoConnected' },
  'Issue Pending': { color: 'warning', labelKey: 'statuses.issuePending' },
  'Issue Created': { color: 'success', labelKey: 'statuses.issueCreated' },
  'Issue Failed': { color: 'error', labelKey: 'statuses.issueFailed' },
  'PR Waiting': { color: 'idle', labelKey: 'statuses.prWaiting' },
  'PR Submitted': { color: 'warning', labelKey: 'statuses.prSubmitted' },
  'PR Reviewed': { color: 'success', labelKey: 'statuses.prReviewed' },
  'Not Configured': { color: 'idle', labelKey: 'statuses.notConfigured' },
  'Configured': { color: 'info', labelKey: 'statuses.configured' },
  'Connection Untested': { color: 'warning', labelKey: 'statuses.connectionUntested' },
  'Connected': { color: 'success', labelKey: 'statuses.connected' },
  'Connection Failed': { color: 'error', labelKey: 'statuses.connectionFailed' },
  'Model Synced': { color: 'success', labelKey: 'statuses.modelSynced' },
  'Not tested': { color: 'idle', labelKey: 'statuses.notTested' },
  'Invalid': { color: 'error', labelKey: 'statuses.invalid' },
  'No Credits': { color: 'warning', labelKey: 'statuses.noCredits' },
  'Rate Limited': { color: 'warning', labelKey: 'statuses.rateLimited' },
  'Error': { color: 'error', labelKey: 'statuses.error' },
  'Network Error': { color: 'error', labelKey: 'statuses.networkError' },
  'Unread': { color: 'warning', labelKey: 'statuses.unread' },
  'Read': { color: 'idle', labelKey: 'statuses.read' },
  'Action Required': { color: 'error', labelKey: 'statuses.actionRequired' },
  'Demo Mode': { color: 'info', labelKey: 'statuses.demoMode' },
  'Demo Data Active': { color: 'warning', labelKey: 'statuses.demoDataActive' },
  'Production Protected': { color: 'success', labelKey: 'statuses.productionProtected' },
  'Draft Version': { color: 'idle', labelKey: 'statuses.draftVersion' },
  'Published Version': { color: 'info', labelKey: 'statuses.publishedVersion' },
  'Latest Version': { color: 'success', labelKey: 'statuses.latestVersion' },
  'Acknowledged': { color: 'success', labelKey: 'statuses.acknowledged' },
  'Not Yet Acknowledged': { color: 'warning', labelKey: 'statuses.notYetAcknowledged' },
  'Active': { color: 'success', labelKey: 'statuses.active' },
  'Converted': { color: 'success', labelKey: 'statuses.converted' },
  'Updated': { color: 'warning', labelKey: 'statuses.updated' },
  'Ready': { color: 'success', labelKey: 'statuses.ready' },
  'Missing': { color: 'error', labelKey: 'statuses.missing' },
  'Nominal': { color: 'info', labelKey: 'statuses.nominal' }
};

/**
 * Displays consistent state labels for build requests, profiles, integrations, notifications, demo and version flows.
 * Used wherever users need quick confirmation of what state something is in and what may happen next.
 */
export function StatusBadge({ status, label: manualLabel, labelKey, className = "", dot = true }: StatusBadgeProps) {
  const { t } = useI18n();

  let color: BadgeColor = 'idle';
  let resolvedLabelKey = labelKey;

  if (status && mapping[status as KnownStatus]) {
    const mapped = mapping[status as KnownStatus]!;
    color = mapped.color;
    resolvedLabelKey = labelKey || mapped.labelKey;
  } else if (status && colors.includes(status as BadgeColor)) {
    color = status as BadgeColor;
  }

  const label = manualLabel || (resolvedLabelKey ? t(resolvedLabelKey) : status || '');

  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    idle: "bg-white/5 text-white/40 border-white/10"
  };

  const dotStyles = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    idle: "bg-white/20"
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${styles[color] || styles.idle} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[color] || dotStyles.idle} ${color === 'success' ? 'animate-pulse' : ''}`} />}
      {label}
    </div>
  );
}
