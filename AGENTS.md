# AI Coding Instructions

All AI-assisted work in this repository must preserve the existing architecture and follow SOLID principles.

## Required Principles

- Single Responsibility: keep route pages focused on orchestration. Put reusable UI in components, reusable state/effects in hooks, API calls in services, and pure transformations in utils.
- Open/Closed: add new behavior through new components, config entries, hooks, or service functions. Avoid editing broad shared modules unless the shared behavior truly changes.
- Liskov Substitution: component props should be explicit and stable. Do not make a component depend on hidden global state unless it is clearly a container component.
- Interface Segregation: pass only the props a component needs. Avoid large "settings" or "context" objects when a few fields are enough.
- Dependency Inversion: UI components should depend on props and abstractions, not direct API calls. Fetching belongs in hooks/services or page containers.

## Project Boundaries

- `src/services`: HTTP calls and response normalization only.
- `src/hooks`: reusable state, side effects, and cross-cutting UI behavior.
- `src/config`: static app configuration such as navigation and permissions.
- `src/utils`: pure helpers with no React rendering.
- `src/components`: reusable design-system or domain-neutral components.
- `src/layouts`: app shell composition. Keep layout subcomponents under `src/layouts/components`.
- `src/features/*`: feature pages and feature-specific components. Prefer `components/` inside each feature for reusable feature UI.

## Implementation Rules

- Keep page components small. If JSX grows complex, extract named components.
- Do not duplicate permission, asset URL, language, formatting, or branding logic.
- Use settings/app-config branding through `useAppConfig`; do not hardcode logos or app names.
- Keep API access out of presentational components.
- Keep translations in locale files; do not ship user-visible hardcoded strings except technical fallbacks.
- Before finishing code changes, run `npm run lint` and `npm run build`.
