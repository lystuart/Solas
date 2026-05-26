# Artifact Review Checklist 🔍

> **AGENTS:** Do not mark a feature or task as "Complete" until you verify these checks manually or via automated test runs. Provide terminal logs or browser testing results as proof.
> **HUMANS:** Use this checklist before merging Agent-generated code.

## Code Quality & Safety

- [ ] No `any` types used (or strictly justified with `unknown` and type guards).
- [ ] Protected files/directories were NOT modified without explicit permission: `.github/workflows/pipeline.yml`, Supabase schema, `.env.local`.
- [ ] No API keys or secrets appear in committed code.
- [ ] No features outside the current phase were added.
- [ ] No default shadcn/Radix components used without custom dark navy styling overrides.
- [ ] MapLibre and Supabase client components are correctly marked `'use client'`.

## Execution & Testing

- [ ] `npm run build` completes without errors.
- [ ] `npx tsc --noEmit` passes (no TypeScript errors).
- [ ] `npm run lint` passes with no warnings in new code.
- [ ] Map loads and renders in the browser without console errors.
- [ ] Supabase query returns data correctly (check Network tab).
- [ ] UI is responsive — tested at mobile (375px) and desktop (1280px+) viewports.

## Feature-Specific Checks

### Map + Pins
- [ ] Dark navy map style renders correctly
- [ ] Pins appear at correct country coordinates
- [ ] Pins have category colour-coding (green/blue/yellow/purple)
- [ ] Pulse animation plays on pins
- [ ] Map is pannable and zoomable smoothly

### Story Card Panel
- [ ] Panel opens on pin click with spring-easing animation (300ms)
- [ ] Panel shows correct stories for the clicked country
- [ ] All story fields display: headline, summary, category tag, source, link
- [ ] X button closes the panel
- [ ] Clicking outside the panel closes it
- [ ] Links open in a new tab
- [ ] Panel is scrollable when stories overflow
- [ ] Mobile: bottom sheet layout
- [ ] Desktop: side panel layout

### AI Pipeline
- [ ] `npm run pipeline` completes without errors
- [ ] Stories appear in Supabase `stories` table after pipeline run
- [ ] 20+ countries represented in the table
- [ ] Geo-tagging accuracy spot-checked on 20 random stories (>90% correct)
- [ ] Duplicate articles are not re-inserted (url_hash deduplication works)
- [ ] GitHub Actions cron triggers automatically and logs show success

## Artifact Handoff

- [ ] `MEMORY.md` updated with any new architectural decisions made during this task.
- [ ] `AGENTS.md` phase checklist updated with completed items checked off.
- [ ] Any obsolete spec files marked as resolved or archived.
