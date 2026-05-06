import React from "react";
import { BuildStatus } from "../../types/buildFeed";
import { useI18n } from "../../i18n/I18nProvider";

type BadgeColor = "success" | "warning" | "error" | "info" | "idle";

type KnownStatus = BuildStatus |
  "Draft" | "Published" | "Archived" | "In Review" | "Changes Requested" |
  "Incomplete" | "Complete" | "Verified" | "Not Verified" | "Eligible to Claim" | "Not Eligible to Claim" |
  "Repo Not Connected" | "Repo Connected" | "Issue Pending" | "Issue Created" | "Issue Failed" | "PR Waiting" | "PR Submitted" | "PR Reviewed" |
  "Not Configured" | "Configured" | "Connection Untested" | "Connected" | "Connection Failed" | "Model Synced" |
  "Unread" | "Read" | "Action Required" |
  "Demo Mode" | "Demo Data Active" | "Production Protected" |
  "Draft Version" | "Published Version" | "Latest Version" | "Acknowledged" | "Not Yet Acknowledged";

interface StatusBadgeProps {
  status?: KnownStatus | BadgeColor | string;
  label?: string;
  className?: string;
  dot?: boolean;
}

/**
 * Displays consistent state labels for build requests, profiles, integrations, notifications, demo and version flows.
 * Used wherever users need quick confirmation of what state something is in and what may happen next.
 */
export function StatusBadge({ status, label: manualLabel, className = "", dot = true }: StatusBadgeProps) {
  const { t } = useI18n();
  const mapping: Partial<Record<KnownStatus, { color: BadgeColor; label: string }>> = {
    'Open': { color: 'info', label: 'Open' },
    'Claimed': { color: 'warning', label: 'Claimed' },
    'In Progress': { color: 'warning', label: 'In Progress' },
    'Ready for Review': { color: 'warning', label: 'Ready for Review' },
    'Draft': { color: 'idle', label: 'Draft' },
    'Published': { color: 'info', label: 'Published' },
    'Archived': { color: 'idle', label: 'Archived' },
    'In Review': { color: 'warning', label: 'In Review' },
    'Changes Requested': { color: 'error', label: 'Changes Requested' },
    'Accepted': { color: 'success', label: 'Accepted' },
    'Rejected': { color: 'error', label: 'Rejected' },
    'Needs Changes': { color: 'error', label: 'Changes Requested' },
    'Done': { color: 'success', label: 'Done' },
    'Incomplete': { color: 'warning', label: 'Incomplete' },
    'Complete': { color: 'success', label: 'Complete' },
    'Verified': { color: 'success', label: 'Verified' },
    'Not Verified': { color: 'idle', label: 'Not Verified' },
    'Eligible to Claim': { color: 'success', label: 'Eligible to Claim' },
    'Not Eligible to Claim': { color: 'warning', label: 'Not Eligible to Claim' },
    'Repo Not Connected': { color: 'idle', label: 'Repo Not Connected' },
    'Repo Connected': { color: 'success', label: 'Repo Connected' },
    'Issue Pending': { color: 'warning', label: 'Issue Pending' },
    'Issue Created': { color: 'success', label: 'Issue Created' },
    'Issue Failed': { color: 'error', label: 'Issue Failed' },
    'PR Waiting': { color: 'idle', label: 'PR Waiting' },
    'PR Submitted': { color: 'warning', label: 'PR Submitted' },
    'PR Reviewed': { color: 'success', label: 'PR Reviewed' },
    'Not Configured': { color: 'idle', label: 'Not Configured' },
    'Configured': { color: 'info', label: 'Configured' },
    'Connection Untested': { color: 'warning', label: 'Connection Untested' },
    'Connected': { color: 'success', label: 'Connected' },
    'Connection Failed': { color: 'error', label: 'Connection Failed' },
    'Model Synced': { color: 'success', label: 'Model Synced' },
    'Unread': { color: 'warning', label: 'Unread' },
    'Read': { color: 'idle', label: 'Read' },
    'Action Required': { color: 'error', label: 'Action Required' },
    'Demo Mode': { color: 'info', label: 'Demo Mode' },
    'Demo Data Active': { color: 'warning', label: 'Demo Data Active' },
    'Production Protected': { color: 'success', label: 'Production Protected' },
    'Draft Version': { color: 'idle', label: 'Draft Version' },
    'Published Version': { color: 'info', label: 'Published Version' },
    'Latest Version': { color: 'success', label: 'Latest Version' },
    'Acknowledged': { color: 'success', label: 'Acknowledged' },
    'Not Yet Acknowledged': { color: 'warning', label: 'Not Yet Acknowledged' }
  };

  const statusTranslationKeys: Partial<Record<KnownStatus, string>> = {
    'Open': 'statuses.open',
    'Claimed': 'statuses.claimed',
    'In Progress': 'statuses.inProgress',
    'Ready for Review': 'statuses.readyForReview',
    'Accepted': 'statuses.accepted',
    'Done': 'statuses.done',
    'Needs Changes': 'statuses.needsChanges',
    'Rejected': 'statuses.rejected'
  };

  let color: BadgeColor = 'idle';
  let label: string = manualLabel || '';

  if (status && mapping[status as KnownStatus]) {
    const mapped = mapping[status as KnownStatus]!;
    color = mapped.color;
    label = manualLabel || (statusTranslationKeys[status as KnownStatus] ? t(statusTranslationKeys[status as KnownStatus]!) : mapped.label);
  } else if (status) {
    // If it's a direct color keyword
    const colors: BadgeColor[] = ["success", "warning", "error", "info", "idle"];
    if (colors.includes(status as BadgeColor)) {
      color = status as BadgeColor;
      label = manualLabel || status;
    } else {
      color = 'idle';
      label = manualLabel || status;
    }
  }

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
