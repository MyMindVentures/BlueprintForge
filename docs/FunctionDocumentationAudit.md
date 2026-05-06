# Function Documentation Audit

## Scope

Scanned app code under `src/`, including:

- Application routing and provider setup in `src/App.tsx`
- Build feed screens, profile screens, founder vision, guide and bootstrap workflow components
- Hooks under `src/hooks/`
- Services under `src/services/`
- Utilities under `src/utils/`
- Shared UI, help, status and state components

## Areas scanned

| Area | Files / modules | Result |
| --- | --- | --- |
| App shell and routing | `src/App.tsx`, `src/components/layout/*` | Added comments for provider setup, routing and self-explaining state layer. |
| Live Build Feed workflow | `src/hooks/useBuildFeed.ts`, `src/services/buildFeedService.ts`, `src/components/buildFeed/*` | Added explicit comments around Firestore subscriptions, publishing, claiming, profile saving, status updates, focus toggling and star awards. |
| AI/OpenRouter workflow | `src/services/openRouterClient.ts`, `src/services/llm.ts`, `src/services/openRouterModelService.ts`, `src/components/models/*` | Added concise comments to exported functions and screen components; existing integration code keeps API keys in settings flow and does not expose secrets in guide text. |
| Project/spec pipeline | `src/hooks/usePipeline.ts`, `src/services/agentService.ts`, `src/services/imagePipelineService.ts`, `src/components/projects/*`, `src/components/pipeline/*` | Added comments to meaningful exported functions and components that coordinate persistence, generation, downloads and progress display. |
| Builder/profile/directory | `src/components/buildFeed/BuilderProfile.tsx`, `src/components/buildFeed/VibeCoderDirectory.tsx` | Added comments to profile and directory functions while preserving form behavior. |
| Guide/demo/version | `src/components/guide/*`, `src/hooks/useGuide.ts`, `src/components/layout/NewVersionPopup.tsx` | Added comments for guide rendering, demo recording and version acknowledgement behavior. |
| Shared UI and utility helpers | `src/components/ui/*`, `src/utils/*` | Added comments where utilities or reusable components support user flows. Obvious one-line internal rendering details remain intentionally light. |

## Comments added

- Added top-level JSDoc comments for exported functions, hooks, services and components that are meaningful user-flow or workflow boundaries.
- Added detailed method-level comments to the Firestore-backed build feed service because it has persistence side effects.
- Added hook action comments in `useBuildFeed` for publishing, claiming, saving profiles, posting updates, posting Daily Signals, toggling Current Focus and awarding stars.
- Added comments to new guidance components so future developers know when to use them and what user uncertainty they resolve.

## Remaining undocumented areas

No intentional gaps remain for meaningful exported functions and major workflow handlers. Some very small local render helpers and static array mappers are not documented because adding comments would be noisy and would not improve developer understanding.

## Notes for future contributors

- Add a concise comment above any new meaningful function, handler, service method, hook action, loader, mutation or workflow function.
- Include role assumptions when a function requires founder/admin or builder access.
- Include persistence side effects when a function writes Firestore, local storage or external integration state.
- Include integration side effects when a function calls OpenRouter, GitHub or recorder/browser APIs.
