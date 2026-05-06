import { BookOpen, Github, Bell, Bot, History, Users, Eye, PlayCircle, ShieldCheck, Star, Rocket } from 'lucide-react';

export type GuideAudience = 'founder' | 'builder' | 'visitor' | 'investor' | 'demo' | 'admin' | 'all';

export interface GuideSection {
  id: string;
  title: string;
  audience: GuideAudience;
  summary: string;
  statusLabel: string;
  steps: string[];
  nextAction: string;
}

type TFunction = (key: string) => string;

const guideSectionKeys = [
  { key: 'founderGuide', id: 'founder-guide', audience: 'founder', stepCount: 5 },
  { key: 'builderGuide', id: 'builder-guide', audience: 'builder', stepCount: 5 },
  { key: 'visitorGuide', id: 'visitor-guide', audience: 'visitor', stepCount: 4 },
  { key: 'investorObserverGuide', id: 'investor-observer-guide', audience: 'investor', stepCount: 4 },
  { key: 'demoGuide', id: 'demo-guide', audience: 'demo', stepCount: 4 },
  { key: 'githubContributionGuide', id: 'github-contribution-guide', audience: 'builder', stepCount: 5 },
  { key: 'openrouterAiGuide', id: 'openrouter-ai-guide', audience: 'admin', stepCount: 5 },
  { key: 'versionChangelogGuide', id: 'version-changelog-guide', audience: 'all', stepCount: 4 },
  { key: 'notificationsGuide', id: 'notifications-guide', audience: 'all', stepCount: 4 }
] as const;

export const createGuideSections = (t: TFunction): GuideSection[] => guideSectionKeys.map((section) => ({
  id: section.id,
  audience: section.audience,
  title: t(`guideContent.sections.${section.key}.title`),
  summary: t(`guideContent.sections.${section.key}.summary`),
  statusLabel: t(`guideContent.sections.${section.key}.statusLabel`),
  steps: Array.from({ length: section.stepCount }, (_, index) => t(`guideContent.sections.${section.key}.steps.${index}`)),
  nextAction: t(`guideContent.sections.${section.key}.nextAction`)
}));

const screenKeys = [
  'landing',
  'bootstrap',
  'liveFeed',
  'profile',
  'settings',
  'guide',
  'adminPersistence'
] as const;

export const createScreenGuidance = (t: TFunction) => Object.fromEntries(screenKeys.map((key) => [key, {
  title: t(`guideContent.screens.${key}.title`),
  purpose: t(`guideContent.screens.${key}.purpose`),
  state: t(`guideContent.screens.${key}.state`),
  nextAction: t(`guideContent.screens.${key}.nextAction`),
  disabledReason: t(`guideContent.screens.${key}.disabledReason`),
  empty: t(`guideContent.screens.${key}.empty`),
  loading: t(`guideContent.screens.${key}.loading`),
  error: t(`guideContent.screens.${key}.error`),
  success: t(`guideContent.screens.${key}.success`)
}])) as Record<typeof screenKeys[number], { title: string; purpose: string; state: string; nextAction: string; disabledReason: string; empty: string; loading: string; error: string; success: string }>;

export const createStatusGlossary = (t: TFunction) => Array.from({ length: 20 }, (_, index) => [
  t(`guideContent.statusGlossary.${index}.term`),
  t(`guideContent.statusGlossary.${index}.description`)
] as const);

export const guideIcons = { BookOpen, Github, Bell, Bot, History, Users, Eye, PlayCircle, ShieldCheck, Star, Rocket };
