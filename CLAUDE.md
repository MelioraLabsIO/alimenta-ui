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

## UI layer: Mantine + Tailwind

Mantine v9 is the component library; Tailwind v4 handles layout and color utilities.
`src/components/mantine/ui.tsx` is a barrel of shadcn-shaped wrappers over Mantine — always
import UI primitives from `@/components/mantine/ui`, never `@mantine/core` directly (except
layout helpers like `Container`/`Stack`).

### Tailwind utilities silently lose to Mantine CSS

Mantine's `styles.css` is **unlayered**; Tailwind v4 emits utilities into `@layer utilities`.
Unlayered rules win at equal specificity, so **any Tailwind utility setting a property Mantine
already sets on that element is ignored** — no error, it just doesn't apply.

Known cases:

- `Button` sets `width: auto` → `w-full` does nothing. Use the `fullWidth` prop.
- `Avatar` is deliberately a plain element, not Mantine's, because Mantine's `--avatar-size`
  (and its `min-width`) overrode every `h-*`/`w-*` and its placeholder painted a second
  background. Size it with Tailwind classes; it has no default size.

When a Tailwind class mysteriously has no effect on a Mantine component, check
`node_modules/@mantine/core/styles.css` for that property before debugging further, and prefer
the Mantine prop.

There is no `tailwind-merge`/`cn` helper — wrappers concatenate `className` strings. Avoid
baking default utilities into a wrapper when callers set the same property; whichever class
Tailwind emitted last wins, not the caller's.

### Other wrapper quirks

- `Input` is Mantine `TextInput`: `className` lands on the **wrapper**, not the input. Use the
  `error` prop for invalid state — a `border-*` class won't reach the field.
- Disclosure components (`Dialog`, `Sheet`, `AlertDialog`) take `onOpenChangeAction`, not
  `onOpenChange`.
- `Button`'s `asChild` only merges `className` and `onClick`; it does not apply Mantine button
  styling. For a link that looks like a button use `component="a"` with `href`.

Theme tokens live in `src/lib/mantine/theme.ts` (Mantine `alimenta` palette) and
`src/app/globals.css` (CSS custom properties bridged into Tailwind via `@theme inline`, plus
app-shell classes like `.app-header` and `.brand-mark`). Dark mode is the default and keys off
`[data-mantine-color-scheme]`, wired as Tailwind's `dark:` variant.

Cards across the app share `className="border-border/50 bg-card/60"`.

## Formatting

Prettier: 4-space indent, `trailingComma: "es5"`. `react-hooks/set-state-in-effect` is
deliberately disabled in `eslint.config.mjs`.
