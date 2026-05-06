import type { UserContext } from './types/buildFeed';

export const FOUNDER_ROLE = 'ROLE-01' as const;
export const LEGACY_ADMIN_ROLE = 'admin' as const;
export const BUILDER_ROLE = 'vibe_coder' as const;
export const ANONYMOUS_ROLE = 'anonymous' as const;

export type BlueprintForgeRole = typeof FOUNDER_ROLE | typeof LEGACY_ADMIN_ROLE | typeof BUILDER_ROLE | typeof ANONYMOUS_ROLE | string;

const roleAliases: Record<string, typeof FOUNDER_ROLE | typeof BUILDER_ROLE | typeof ANONYMOUS_ROLE> = {
  [FOUNDER_ROLE]: FOUNDER_ROLE,
  [LEGACY_ADMIN_ROLE]: FOUNDER_ROLE,
  founder: FOUNDER_ROLE,
  architect: FOUNDER_ROLE,
  administrator: FOUNDER_ROLE,
  vibe_coder: BUILDER_ROLE,
  builder: BUILDER_ROLE,
  anonymous: ANONYMOUS_ROLE,
  visitor: ANONYMOUS_ROLE
};

export function normalizeRole(role?: string | null) {
  return roleAliases[String(role || ANONYMOUS_ROLE).trim().toLowerCase()] || String(role || ANONYMOUS_ROLE);
}

export function isFounderAdminRole(role?: string | null) {
  return normalizeRole(role) === FOUNDER_ROLE;
}

export function adminAccessDebugEnabled() {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  if (viteEnv?.VITE_AUTH_DEBUG === 'true') return true;
  if (typeof window !== 'undefined') return window.localStorage.getItem('blueprintforge.authDebug') === 'true';
  return false;
}

export function logAdminAccessDebug(event: string, details: Record<string, unknown>) {
  if (!adminAccessDebugEnabled()) return;
  const safeDetails = { ...details };
  if ('email' in safeDetails && typeof safeDetails.email === 'string') {
    safeDetails.email = safeDetails.email.replace(/^(.{2}).*(@.*)$/, '$1***$2');
  }
  console.info(`[BlueprintForge auth] ${event}`, safeDetails);
}

export function describeMissingAdminAccess(profile: UserContext | null | undefined, view: string) {
  const resolvedRole = normalizeRole(profile?.role);
  return {
    title: 'Founder/Admin access required',
    message: 'This screen is protected for ROLE-01 Founder/Admin users only.',
    view,
    resolvedRole,
    missingPermission: 'ROLE-01'
  };
}
