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
3. **Think before coding** — state assumptions explicitly before implementing. If multiple interpretations exist, present them — don't pick silently. If something is unclear, name what's confusing and ask.
4. **Plan-first with verify steps** — for any multi-file task, state a brief plan in this form before starting:
   ```
   1. [Step] → verify: [specific check]
   2. [Step] → verify: [specific check]
   ```
   Wait for approval, then execute.
5. **Simplicity first** — minimum code that solves the problem. No abstractions for single-use code. No error handling for impossible scenarios. No flexibility that wasn't requested. Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.
6. **Surgical changes** — touch only what the task requires. Don't improve adjacent code, comments, or formatting. Don't refactor things that aren't broken. Match existing style. If you notice unrelated dead code, mention it — don't delete it.
7. **Incremental build** — implement one feature at a time. Run `npm run build` + browser test before moving on.
8. **Verify after changes** — run `npx tsc --noEmit` and `npm run build` after every meaningful change.
9. **Update MEMORY.md** — log architectural decisions and completed milestones in `MEMORY.md`.
10. **Be concise** — state what you're doing, do it, confirm it works. No filler text.

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

## Access Control Matrix

| Environment Variable | Visibility | Runtime | Permissions |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (intentional) | Server (API route) | Supabase project endpoint — no auth on its own |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (intentional) | Server (API route) | Read-only anon access; respects RLS policies; cannot write |
| `NEXT_PUBLIC_MAPTILER_KEY` | Public (intentional) | Client (MapLibre URL) | Tile fetching only; scoped to this domain in MapTiler dashboard |
| `ANTHROPIC_API_KEY` | **Private** | Pipeline (GitHub Actions) only | Claude API calls; never reaches browser or Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | **Private** | Pipeline (GitHub Actions) only | Bypasses RLS; full read/write; never reaches browser or Vercel |

### User roles

| Role | How they access | What they can do |
|---|---|---|
| Anonymous visitor | Browser → `/api/stories` → Supabase anon key | Read published stories (last 7 days); nothing else |
| Pipeline (GitHub Actions) | Supabase service role key | Insert and delete stories; read all rows |
| Developer | `.env.local` locally | Run pipeline manually; all of the above |

### Rules
- `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **never** appear in any file under `app/` or `components/`
- Supabase RLS must enforce select-only on the `stories` table for the anon role
- The `/api/stories` route is the only path from browser to Supabase; direct client-side Supabase calls are prohibited

## What NOT To Do

- Do NOT delete files without explicit confirmation
- Do NOT modify `.github/workflows/pipeline.yml` or Supabase schema without approval
- Do NOT commit `.env.local` or any API keys
- Do NOT add npm packages without checking if the existing stack already handles the need
- Do NOT add features from Phase 2 or later while in Phase 1
