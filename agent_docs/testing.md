# Testing Strategy

## Approach for MVP

Wholesome News is a vibe-coder MVP with a 2-week timeline. The testing strategy is **manual browser verification first**, with build/type checks as the automated safety net. No unit test framework is required at MVP scale — ship working features, not test coverage.

## Frameworks

- **Type checking:** TypeScript strict mode (`tsc --noEmit`) — catches most logical errors before runtime
- **Linting:** ESLint (bundled with Next.js) — `npm run lint`
- **Build check:** `npm run build` — fails on TypeScript errors and broken imports
- **Manual E2E:** Browser testing against the running app — required before marking any feature done
- **Pipeline testing:** Run `npm run pipeline` manually and inspect Supabase table output

*Unit tests and Playwright E2E can be added post-MVP if the project grows.*

## Rules

- **NEVER skip a failing build** — fix TypeScript errors before proceeding
- **NEVER mark a feature complete** without testing it in a real browser at mobile (375px) and desktop (1280px+) widths
- **NEVER assume "the code looks right"** — render it and interact with it
- **If the pipeline adds wrong geo-tags** — fix the Claude Haiku prompt, re-run, spot-check 20 stories before continuing

## Verification Loop (Run After Every Feature)

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Start dev server and test in browser
npm run dev
```

Then manually verify in browser:
- Does the feature work as described in the PRD success criteria?
- Does it look correct on mobile (375px) and desktop (1280px+)?
- Are there any console errors?

## Pipeline-Specific Testing

```bash
# Run pipeline manually (uses .env.local keys)
npm run pipeline

# Then check Supabase table:
# - Open Supabase dashboard → Table Editor → stories
# - Verify new rows were added
# - Spot-check 20 rows: are country names and coordinates correct?
# - Are summaries readable and 2-3 sentences?
# - Is the category field populated?
```

**Geo-tag accuracy check** — manually verify these cases are handled:
- Story about a US city → should tag as `US`
- Story about a UN initiative → may have no country; should be skipped (null country_code)
- Story about "Africa" broadly → should be skipped (too vague)
- Story about "Kenya" specifically → should tag as `KE` with correct lat/lng

## Pre-Commit Checks

Before every git commit, ensure:
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] No `.env.local` or secret keys are in the staged files
- [ ] Feature works in browser

Optional (add in Phase 2): Set up a Husky pre-commit hook to automate the build + lint check.

## Browser Testing Matrix

Before any public launch:

| Browser | Device | Test |
|---------|--------|------|
| Chrome | Desktop (1280px+) | Full interaction |
| Firefox | Desktop | Map renders, panel opens |
| Safari | Desktop | Map renders, panel opens |
| Safari | iPhone (375px) | Bottom sheet, touch pan/zoom |
| Chrome | Android (375px) | Bottom sheet, touch pan/zoom |

## Known Gotchas

- **MapLibre on mobile Safari:** Test touch pan/zoom explicitly — it sometimes needs `touchAction: 'none'` CSS to prevent scroll conflicts with the map
- **Supabase cold start:** First query after a period of inactivity may be slow (300–500ms) — expected behavior
- **GitHub Actions pipeline:** Test the manual trigger ("Run workflow") before relying on the cron schedule — confirm secrets are wired correctly
