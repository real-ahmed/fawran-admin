# Copilot Instructions

Follow the repository architecture in `AGENTS.md`.

When generating or editing code:

- Respect SOLID principles.
- Keep UI components presentational unless they are explicit container/page components.
- Put API calls in `src/services`, reusable effects in `src/hooks`, static configuration in `src/config`, and pure helpers in `src/utils`.
- Reuse existing components, hooks, permissions, localization, and branding helpers before adding new patterns.
- Use `useAppConfig` for app name, logos, icons, currency, and favicon-derived branding.
- Do not hardcode user-facing text outside locale JSON files.
- Run or expect `npm run lint` and `npm run build` before considering work complete.
