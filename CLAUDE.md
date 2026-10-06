# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server on :3000
npm run build        # production build — also runs the TS checker
npm run typecheck    # tsc --noEmit  (alias: npm run checkTS)
npm run lint         # eslint
```

Tests use the Node built-in runner with `tsx` for TS + path aliases. There is no `test`
script and no test framework installed:

```bash
npx tsx --test src/lib/supabase/middleware.test.ts   # a single file
npx tsx --test "src/**/*.test.ts"                    # all
```

CI (`.github/workflows/ci.yml`) runs **typecheck + build only** — it does not run tests or
lint, so run those yourself. Pushing to `main` also deploys Supabase migrations
(`.github/workflows/deploy-migrations.yml`).

A stale `.next/types/validator.ts` referencing a deleted route makes `tsc --noEmit` fail with
a phantom error. `rm -rf .next/types` and re-run.

Required env (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_BASE_URL`, `DATABASE_URL`, and `NEXT_PUBLIC_API_URL` for non-dev builds.

## Architecture

Next.js 16 App Router, React 19, TypeScript.

### The backend is a separate service; Supabase is auth only

`src/apiClient/client.ts` (`apiFetch`) talks to an external API — hardcoded to
`http://localhost:8080` in development, `NEXT_PUBLIC_API_URL` otherwise. Supabase provides
authentication and owns `supabase/migrations`, but application data does **not** come from
Supabase tables. Never reach for the Supabase client to fetch domain data.

`apiFetch` attaches the Supabase JWT by default and tolerates empty response bodies (DELETEs
return 204).

### Two identity mechanisms

Requests carry credentials one of two ways, and mixing them up produces 401s:

- **Authenticated members** — default. `apiFetch` calls `getSession()` and sends
  `Authorization: Bearer`.
- **Anonymous guests** — pass `{ useSession: false }` as `apiFetch`'s third argument and send
  `X-Participant-Token`. The token is issued at join time and kept in `sessionStorage` under
  `spin:{sessionId}:participant-token`.

`src/apis/spin/mutations.ts` has both variants side by side (`leaveSessionAsMember` vs
`leaveSessionAsGuest`) and is the clearest reference.

### Route groups encode auth posture

- `(public)` — login, marketing, reset-password.
- `(authenticated)` — gated twice: middleware redirect, plus `getCurrentUserServer()` in the
  group layout. Wrapped in `AppHeader` + `SidebarNav` chrome.
- `(session)` — guest-reachable `/spin/[session_id]`. Its layout is a bare `<main>`, so pages
  here get **no app chrome** and must supply their own header.

`src/lib/supabase/middleware.ts` decides access. `isPublicRoute` is an allowlist: prefix
matches plus the regex `/^\/spin\/[^/]+$/`. That regex only matches one path segment — adding
a public route under `/spin/` (or renaming the segment) means editing it, or guests silently
get redirected to login. `middleware.test.ts` covers exactly this.

### Routing helpers

`src/lib/routes.ts` is the single source of internal URLs and is intentionally free of
React/Next imports so Edge middleware can import it. Use the builders rather than string
literals; `sanitizeNextPath` guards the `?next=` redirect against open-redirect.

The spin session slug is the **session ID** — there is no separate join code anywhere in the
codebase.

### State

- **Server state**: TanStack Query. Guest session queries key on `["guest-session", sessionId]`;
  components write to that key directly on join/leave/food-change, so any new cache write must
  match it.
- **Identity**: Zustand — `auth-user.store` and `profile.store`, both hydrated once by
  `AuthUserProvider` in the root layout and refreshed on Supabase auth changes. Components read
  from the store rather than fetching the profile themselves.

### Code layout

- `src/apis/<domain>/{queries,mutations}.ts` — all `apiFetch` calls.
- `src/contracts/` — zod schemas for react-hook-form.
- `src/core/types/models/` — domain types.
- `_components/` colocated inside a route folder for route-specific UI; shared spin pieces live
  in `src/app/(authenticated)/spin/_components/` and are imported by the guest `(session)` route
  too.

**Name new component files in PascalCase**, matching the exported component
(`MealEntryForm.tsx`, `ParticipantRoom.tsx`) — not kebab-case. The repo is currently mixed:
feature components are PascalCase, while most of the shared `src/components/` tree is
kebab-case, so copying a sibling filename there gives the wrong answer. App Router special
files keep their reserved lowercase names (`page.tsx`, `layout.tsx`, `route.ts`, …), and
barrels stay `index.ts`.

## UI layer: Mantine only

Mantine v9 is the component library and the **only** way UI is built or styled:

- Import components from `@mantine/core` directly (`Box`, `Stack`, `Group`, `Flex`,
  `Paper`, `Card`, `Text`, `Title`, `Button`, `ActionIcon`, `ThemeIcon`, `Avatar`,
  `TextInput`, `Tabs`, `Modal`, …). There is no wrapper barrel any more.
- **No raw HTML tags** in components — `Box`/`Text`/`Title`/`UnstyledButton` instead
  (`Box component="section"` when semantics matter; an inline `<svg>` drawing is fine).
- **No `className`, no Tailwind utilities, no CSS modules, no new CSS.** Style with Mantine
  style props (`p`, `bg`, `c`, `fz`, `fw`, `w`, `radius`, `pos`, `hiddenFrom`, responsive
  objects like `w={{ base: "100%", md: 220 }}`), the `style` prop, or `styles={{ root: {…} }}`
  for inner parts. Mantine v9 has no `sx`; these are its equivalents.
- Tokens are CSS custom properties from `src/app/globals.css`, used as `bg="var(--sf)"`,
  `c="var(--tx2)"`: `--bg --sf --sf2` (page / card / inset), `--tx --tx2 --tx3` (text
  tiers), `--bd --bd2` (borders), `--ac --act --acs` (accent, ink on accent, tint),
  `--bl --am --ro` (blue, amber, rose), `--glass`, `--sh`, `--wash`, `--gradient-accent`,
  `--ink-on-gradient`. Tint any token with `color-mix(in srgb, var(--am) 16%, transparent)`.
  Mantine color names: `alimenta` (primary green), `sky`, `amber`, `rose`, `gray`.

### Where styling lives

- `src/lib/mantine/theme.ts` — the global theme: palettes, radius/shadow scales, Geist type,
  and per-component `defaultProps` / `vars` / `styles`. Button variants: `filled` (green
  CTA with glow, default), `default` (bordered secondary), `subtle` (ghost), `surface`
  (`--sf2` chip), `glass` (translucent round control), `gradient`, `light`; `ActionIcon`
  defaults to a 42px glass circle; `ThemeIcon` is the 34px accent icon tile; `Card`/`Paper`
  are the 24px-radius `--sf` cards; `Tabs` are pill tabs in a glass track. The theme
  contains functions, so it is only imported by `src/providers/MantineThemeProvider.tsx`
  (`"use client"`) — never from a server component.
- `src/app/globals.css` — only tokens, the bridge from Mantine's global variables onto
  them, and keyframes (`alm-in`, `alm-pop`, `alm-shake`, `alm-bounce`, `alm-pulse`,
  `alm-spin`, used via `style={{ animation: … }}`). It also sets the cascade-layer order
  `theme, base, mantine, components, utilities` and imports Mantine's `styles.layer.css`
  files, so Mantine wins over Tailwind's preflight but loses to utilities if one is used.
- App shell: `src/components/layout/AppShellLayout.tsx` (Mantine `AppShell`, floating glass
  navbar), `sidebar-nav.tsx` (`NavLink`s), `app-header/AppHeader.tsx`. The header renders
  each route's kicker + title from `src/lib/page-headings.ts` — **pages do not render
  their own `<h1>`**. `(session)` pages have no shell and render `Brand` themselves.
- Hover states cannot be expressed inline; rely on components that have them (`Button`,
  `ActionIcon`, `NavLink`, `Menu.Item`, `Tabs`) rather than hand-rolled rows.
- Toasts: `toast.success/error/info/undo` from `@/lib/notifications`.

## Formatting

Prettier: 4-space indent, `trailingComma: "es5"`. `react-hooks/set-state-in-effect` is
deliberately disabled in `eslint.config.mjs`.
