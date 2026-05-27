# CLAUDE.md — Claude Code Configuration for Wholesome News

## Project Context

**App:** Wholesome News
**Stack:** Next.js (TypeScript, App Router), MapLibre GL JS, Supabase, GitHub Actions, Claude Haiku 4.5
**Stage:** MVP Development — 2-week sprint
**User Level:** Vibe-coder (AI does the building, human guides and tests)

## Directives

1. **Read AGENTS.md first** — always read it at the start of a session to confirm the current phase and active tasks before writing any code.
2. **Documentation** — refer to `agent_docs/` for detailed specs:
   - `agent_docs/tech_stack.md` — exact stack, DB schema, code examples
   - `agent_docs/code_patterns.md` — architecture rules, data fetching, CSS patterns
   - `agent_docs/product_requirements.md` — full feature list, user stories, success criteria
   - `agent_docs/testing.md` — verification loop, browser test matrix
3. **Plan-first** — propose a brief step-by-step plan and wait for approval before changing more than one file.
4. **Incremental build** — implement one feature at a time. Run `npm run build` + browser test before moving on.
5. **Verify after changes** — run `npx tsc --noEmit` and `npm run build` after every meaningful change.
6. **Update MEMORY.md** — log architectural decisions and completed milestones in `MEMORY.md`.
7. **Be concise** — state what you're doing, do it, confirm it works. No filler text.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (catches TypeScript errors)
npm run lint         # ESLint check
npm run pipeline     # Run RSS + Claude pipeline manually
npx tsc --noEmit     # Type check only
```

## Critical Rules

- **No `any` types** — use `unknown` with type guards
- **No API keys in code** — use `.env.local` and GitHub Secrets only
- **No pipeline logic in Vercel functions** — Claude API calls and RSS fetching belong in `pipeline/` run via GitHub Actions
- **No default MapLibre pin markers** — always use custom HTML elements
- **No unstyled shadcn/Radix** — every component must use the dark navy CSS variable palette
- **No features outside the active phase** — check `AGENTS.md` first

## What NOT To Do

- Do NOT delete files without explicit confirmation
- Do NOT modify `.github/workflows/pipeline.yml` or Supabase schema without approval
- Do NOT commit `.env.local` or any API keys
- Do NOT add npm packages without checking if the existing stack already handles the need
- Do NOT add features from Phase 2 or later while in Phase 1
