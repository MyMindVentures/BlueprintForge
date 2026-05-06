import { BookOpen, Github, Bell, Bot, History, Users, Eye, PlayCircle, ShieldCheck, Star, Rocket } from 'lucide-react';

export type GuideAudience = 'founder' | 'builder' | 'visitor' | 'investor' | 'demo' | 'admin' | 'all';

export interface TranslatedGuideSection {
  id: string;
  title: string;
  audience: GuideAudience;
  summary: string;
  statusLabel: string;
  steps: string[];
  nextAction: string;
}

export interface TranslatedScreenGuidance {
  title: string;
  purpose: string;
  state: string;
  nextAction: string;
  disabledReason: string;
  empty: string;
  loading: string;
  error: string;
  success: string;
}

export interface TranslatedStatusGlossaryItem {
  label: string;
  meaning: string;
}

export const GUIDE_SECTION_KEYS = [
  'founder',
  'builder',
  'visitor',
  'investor',
  'demo',
  'github',
  'openrouter',
  'versionPopup',
  'notifications'
] as const;

export const SCREEN_GUIDANCE_KEYS = [
  'landing',
  'bootstrap',
  'liveFeed',
  'profile',
  'settings',
  'guide',
  'adminPersistence'
] as const;

export const guideIcons = { BookOpen, Github, Bell, Bot, History, Users, Eye, PlayCircle, ShieldCheck, Star, Rocket };
