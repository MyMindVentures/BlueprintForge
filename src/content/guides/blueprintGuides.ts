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

export const guideSections: GuideSection[] = [
  {
    id: 'founder-guide',
    title: 'Founder Guide',
    audience: 'founder',
    summary: 'Turn raw thoughts into reviewed build requests that builders can claim and ship.',
    statusLabel: 'Founder workflow active',
    steps: [
      'Enter the raw thought, goal, bug, improvement or app idea in the Bootstrap Page.',
      'Use AI polish only after OpenRouter is configured; the draft remains editable before publishing.',
      'Review problem, goal, expected behavior, UI/UX notes and acceptance criteria before publishing.',
      'Publish when the request is ready for the Live Build Feed and optional GitHub issue creation.',
      'Review builder progress updates and PR URLs, then accept completed work and award stars.'
    ],
    nextAction: 'Open Bootstrap Page and prepare the next build request.'
  },
  {
    id: 'builder-guide',
    title: 'Builder Guide',
    audience: 'builder',
    summary: 'Complete your profile, claim a build request, ship through GitHub and earn reputation.',
    statusLabel: 'Builder workflow ready',
    steps: [
      'Create a builder profile with skills, stack, availability and GitHub or portfolio links.',
      'Read Current Founder Focus first, then inspect Open requests in the Live Build Feed.',
      'Use GitHub issue links for implementation context when a ticket has been synced.',
      'Claim one ticket only when you can start; post progress updates as you work.',
      'Submit a PR URL for review. Accepted work increases stars and reputation.'
    ],
    nextAction: 'Complete your profile, then claim an Open or Current Focus request.'
  },
  {
    id: 'visitor-guide',
    title: 'Visitor Guide',
    audience: 'visitor',
    summary: 'Visitors can observe platform momentum and decide whether to become builders.',
    statusLabel: 'Read-only visitor mode',
    steps: [
      'View the Landing Page, Founder Vision, Guide, Builder Directory and public Live Build Feed.',
      'Read public build requests to understand what the platform is building now.',
      'Sign in when you want to create a profile, claim requests or post updates.',
      'Public feed items are real platform work unless they are labeled Demo Mode or Demo Data Active.'
    ],
    nextAction: 'Open the Live Build Feed or sign in to become a builder.'
  },
  {
    id: 'investor-observer-guide',
    title: 'Investor / Observer Guide',
    audience: 'investor',
    summary: 'Read platform momentum through founder vision, active focus, builder work and accepted PRs.',
    statusLabel: 'Observer view available',
    steps: [
      'Use Founder Vision to understand the strategic direction.',
      'Use Daily Signal and Current Founder Focus to see immediate priorities.',
      'Use Live Build Feed statuses to see throughput from Open to Accepted.',
      'Use Builder Directory and stars to assess contributor activity and reputation.'
    ],
    nextAction: 'Compare Founder Vision with recently accepted build requests.'
  },
  {
    id: 'demo-guide',
    title: 'Demo Guide',
    audience: 'demo',
    summary: 'Demo mode demonstrates the workflow with safe data and must not mutate production records.',
    statusLabel: 'Demo mode explained',
    steps: [
      'Demo data should be clearly labeled Demo Mode or Demo Data Active.',
      'Demo users can record walkthroughs and inspect flows with safe sample records.',
      'Demo users must not receive production credentials or bypass role checks.',
      'Production Protected means the action is blocked or separated from real production data.'
    ],
    nextAction: 'Start a demo recording from the Guide when you need a walkthrough.'
  },
  {
    id: 'github-contribution-guide',
    title: 'GitHub Contribution Guide',
    audience: 'builder',
    summary: 'Move from issue to fork, branch, implementation, pull request, review and accepted work.',
    statusLabel: 'GitHub flow documented',
    steps: [
      'Open the GitHub issue link when it exists; otherwise use the ticket detail as source of truth.',
      'Fork the repo if needed, create a focused branch and implement only the scoped change.',
      'Submit a pull request URL back to the build request when ready for review.',
      'Respond to Changes Requested, then wait for founder/admin acceptance.',
      'Accepted work can award stars and improve your builder reputation.'
    ],
    nextAction: 'Open the issue or create your branch for the claimed ticket.'
  },
  {
    id: 'openrouter-ai-guide',
    title: 'OpenRouter AI Guide',
    audience: 'admin',
    summary: 'Configure OpenRouter safely for AI ticket polishing and model sync.',
    statusLabel: 'AI setup guide',
    steps: [
      'Add the API key only in the OpenRouter Settings screen; never paste it into tickets or public text.',
      'Choose a model for ticket polishing and sync available models when the key is configured.',
      'Run the connection test before relying on AI output.',
      'Review AI-polished tickets before publishing; AI output is a draft, not an automatic publish.',
      'If connection fails, check the key, model access and browser/network errors.'
    ],
    nextAction: 'Open OpenRouter Settings and run a connection test.'
  },
  {
    id: 'version-changelog-guide',
    title: 'Version / Changelog Guide',
    audience: 'all',
    summary: 'Versions announce platform updates and builders acknowledge popups after reading changes.',
    statusLabel: 'Version flow visible',
    steps: [
      'Admins publish guide versions with release notes, fixed issues and breaking changes.',
      'Builders see a popup when a newer version has not been acknowledged.',
      'Acknowledgement persists so users know whether they have read the latest update.',
      'Latest Version means no newer published version is waiting for that user.'
    ],
    nextAction: 'Open the Guide to read the latest changelog.'
  },
  {
    id: 'notifications-guide',
    title: 'Notifications Guide',
    audience: 'all',
    summary: 'Notifications explain platform events, unread state and which items require action.',
    statusLabel: 'Notifications explained',
    steps: [
      'Unread notifications need attention; Read notifications are retained for context.',
      'Action Required means the user should review, claim, update, acknowledge or fix something.',
      'Version notifications link to the changelog; ticket notifications link to the related request.',
      'Mark notifications as read after acting on them or deciding no action is needed.'
    ],
    nextAction: 'Review unread notifications first, then mark them as read.'
  }
];

export const screenGuidance = {
  landing: {
    title: 'Landing Page',
    purpose: 'Understand what BlueprintForge AI is and choose whether to observe, sign in or join as a builder.',
    state: 'Public overview. No protected action is required to read it.',
    nextAction: 'View the Live Build Feed, read the Guide or sign in to build.',
    disabledReason: 'Protected actions require sign-in so claims, stars and settings remain attributable.',
    empty: 'If no activity is visible yet, start with the Guide to understand the platform loop.',
    loading: 'Loading public platform context and authentication state.',
    error: 'If navigation fails, return to the Landing Page and try the Guide or Live Build Feed.',
    success: 'You now understand the platform entry points.'
  },
  bootstrap: {
    title: 'Bootstrap Page',
    purpose: 'Convert founder thoughts into structured build request drafts.',
    state: 'Drafting and review area. AI polish depends on OpenRouter configuration and founder/admin access.',
    nextAction: 'Enter a raw thought, polish it, review every field and publish only when ready.',
    disabledReason: 'Publish and AI actions are disabled when required draft text, auth or AI settings are missing.',
    empty: 'No draft exists yet. Start by typing the smallest clear problem or improvement.',
    loading: 'AI may be polishing the request or the app may be loading persisted settings.',
    error: 'Check OpenRouter configuration, required fields and your founder/admin access, then try again.',
    success: 'The build request is ready for the Live Build Feed after publishing.'
  },
  liveFeed: {
    title: 'Live Build Feed',
    purpose: 'See active work, claim tickets and track requests from Open to Accepted.',
    state: 'Public read view with builder/admin actions revealed by role and ticket state.',
    nextAction: 'Builders should complete a profile, choose an Open request and claim it when ready.',
    disabledReason: 'Claiming is disabled for visitors, incomplete profiles, already claimed tickets or non-open statuses.',
    empty: 'No requests match this filter. Try All, Open or Current Focus.',
    loading: 'Refreshing PostgreSQL-backed build request updates.',
    error: 'Refresh or check network/auth access if live updates cannot load.',
    success: 'Updates, PR links and review state are shown on each ticket.'
  },
  profile: {
    title: 'Builder Profile',
    purpose: 'Describe your skills, stack, availability and links so you can claim work.',
    state: 'Profile completeness controls claim eligibility.',
    nextAction: 'Fill required fields and save the profile before claiming tickets.',
    disabledReason: 'Claim actions remain disabled until required profile fields are saved.',
    empty: 'No profile exists yet. Create one to become eligible to claim.',
    loading: 'Loading saved profile and reputation state.',
    error: 'Check required fields and try saving again.',
    success: 'Saved profile changes update builder eligibility and directory information.'
  },
  settings: {
    title: 'OpenRouter and GitHub Settings',
    purpose: 'Configure integrations used by AI polishing, model sync and GitHub issue flow.',
    state: 'Secrets are entered in protected settings and connection state is tested explicitly.',
    nextAction: 'Save settings, sync models and run connection diagnostics.',
    disabledReason: 'Connection tests require a configured API key; GitHub issue creation requires repo settings.',
    empty: 'No integration is configured yet. Add settings when you are ready to connect external services.',
    loading: 'Testing connection or syncing models.',
    error: 'Check keys, repo details and provider access before retrying.',
    success: 'Configured integrations can support ticket polishing and issue creation.'
  },
  guide: {
    title: 'BlueprintForge Guide',
    purpose: 'Central documentation for every role, screen, state, status and user flow.',
    state: 'Living guide with version and demo recorder context.',
    nextAction: 'Pick your role guide, then follow the next action checklist.',
    disabledReason: 'Demo and admin actions may require sign-in or protected role access.',
    empty: 'If a section is pending implementation, it is labeled honestly in the guide.',
    loading: 'Loading guide version, flows and demo recordings.',
    error: 'If guide data fails to load, use the static role guides on this page.',
    success: 'You can use this page to decide what to do next.'
  },
  adminPersistence: {
    title: 'Admin Database / Persistence Layer',
    purpose: 'Explain what data is persisted and which admin actions modify shared records.',
    state: 'Build requests, profiles, claims, PR links, stars, versions and settings persist in PostgreSQL as implemented.',
    nextAction: 'Use admin screens for protected writes and read errors before retrying.',
    disabledReason: 'Admin database actions are disabled without founder/admin access.',
    empty: 'No records means the platform has not received data for that collection yet.',
    loading: 'Polling refresh is waiting for PostgreSQL-backed API responses.',
    error: 'PostgreSQL/API errors should name the failed operation and table or endpoint so admins know where to investigate.',
    success: 'Successful writes update the live UI and persisted records.'
  }
};

export const statusGlossary = [
  ['Draft', 'A build request or version is being prepared and is not public yet.'],
  ['Published', 'The item is visible to its intended audience.'],
  ['Open', 'A build request is available to claim.'],
  ['Claimed', 'A builder has locked the request.'],
  ['In Progress', 'Implementation has started.'],
  ['PR Submitted / Ready for Review', 'A pull request or review link has been submitted.'],
  ['In Review', 'Founder/admin review is pending.'],
  ['Changes Requested', 'Builder should revise work and resubmit.'],
  ['Accepted', 'Founder/admin accepted the work and stars may be awarded.'],
  ['Rejected', 'The current implementation was not accepted.'],
  ['Archived', 'The item is no longer active.'],
  ['Profile Incomplete / Complete', 'Builder eligibility depends on saved required fields.'],
  ['Verified / Not Verified', 'Admin trust status for a builder profile.'],
  ['Repo Not Connected / Repo Connected', 'GitHub settings are missing or ready.'],
  ['Issue Pending / Issue Created / Issue Failed', 'GitHub issue creation lifecycle.'],
  ['PR Waiting / PR Submitted / PR Reviewed', 'Builder pull request lifecycle.'],
  ['OpenRouter Not Configured / Configured / Connected / Failed', 'AI provider setup and test state.'],
  ['Unread / Read / Action Required', 'Notification attention state.'],
  ['Demo Mode / Demo Data Active / Production Protected', 'Safe demo state and production safety labels.'],
  ['Draft Version / Published Version / Latest Version / Acknowledged', 'Guide and changelog release state.']
];

export const guideIcons = { BookOpen, Github, Bell, Bot, History, Users, Eye, PlayCircle, ShieldCheck, Star, Rocket };
