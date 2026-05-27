# Product Requirements Document: Wholesome News MVP

## Product Overview

**App Name:** Wholesome News
**Tagline:** "See where good things are happening, right now."
**Launch Goal:** Get the MVP live and shareable — prove the map + positive news concept resonates before building more
**Target Launch:** Within 2 weeks

---

## Who It's For

### Primary User: The Consciously Online

People aged 15–35 who are heavy internet users but increasingly aware of how doomscrolling affects them. They care about the world, follow news, and want to feel informed without feeling hopeless. They're the type to follow wholesome news Instagram accounts and share uplifting stories with friends.

**Their Current Pain:**
- Every news platform is optimized for outrage and engagement — not wellbeing
- Positive news exists, but it's buried under noise or stuck in boring vertical scroll feeds
- No current app lets them *explore* the world and discover where good things are happening
- Existing positive news apps feel generic and uninspired — no geographic context, no discovery mechanic

**What They Need:**
- A daily ritual that makes them feel good about the world, not anxious about it
- Geographic context: "this good thing happened *here*" creates meaning that a feed doesn't
- Discovery over consumption — the feeling of exploring, not scrolling

### Example User Story

"Meet Priya, a 24-year-old grad student who checks Twitter too much and knows it. She wants to stay informed about the world but keeps getting pulled into depressing news cycles. She opens Wholesome News during her morning coffee, spins the map to East Africa, taps a pin on Kenya, and reads about a solar-powered school in Nairobi. She screenshots it to send her group chat. She feels optimistic for the first time before 10am."

---

## The Problem We're Solving

The demand for positive, globally-grounded news is proven — wholesome news Instagram accounts rack up millions of likes. But no dedicated platform delivers this with beautiful design and interactive exploration. All existing solutions are vertical scroll feeds with no geographic context, heavily US/UK-centric, and generically designed.

**Why Existing Solutions Fall Short:**

| Competitor | Problem |
|------------|---------|
| Good News Network | 22 years old, just a blog — no map, no discovery, US-heavy, dated design |
| Goodable | Better design but app-only, no geographic exploration, paywalled premium |
| Lapis News | Bare-bones — 4-8 stories/day, app-only, no global coverage |
| NewsMap | Has a map but shows regular (negative) news, no positive filter |

**The gap:** No one has built a beautiful, web-accessible, interactive world map of positive news with real geographic pin placement and genuine global coverage.

---

## User Journey

### Discovery → First Use → Success

1. **Discovery Phase**
   - How they find us: Reddit (r/InternetIsBeautiful, r/UpliftingNews), word of mouth, social shares
   - What catches their attention: "It's a world map of good news"
   - Decision trigger: Curiosity — they want to explore

2. **Onboarding (First 30 Seconds)**
   - Land on: Full-screen dark world map with glowing colored pins
   - First action: Instinctively click the nearest interesting pin
   - Quick win: A card slides up with 3-4 uplifting stories — they immediately understand the product

3. **Core Usage Loop**
   - Trigger: Daily habit, boredom, needing a mood boost
   - Action: Spin to a region they don't usually follow, tap a pin, read stories
   - Reward: Genuine optimism and geographic connection to the world
   - Investment: The daily habit of checking in

4. **Success Moment**
   - "Aha!" moment: Tapping a pin on a country they'd never normally follow and finding something surprising and wonderful
   - Share trigger: "You have to see this" — the map is inherently shareable because it's visually distinctive

---

## MVP Features

### Must Have for Launch

#### 1. Interactive World Map with Category Pins
- **What:** A full-screen, dark-themed world map with glowing, color-coded pins marking countries that have recent positive news stories. Pins are custom-designed (not default map markers) with category-coded colors and a subtle pulse animation.
- **User Story:** As a user, I want to see an interactive world map showing where good news is happening so I can explore the world and discover positive stories geographically.
- **Success Criteria:**
  - [ ] Map loads within 3 seconds on desktop and mobile
  - [ ] Pins display for every country with stories in the last 7 days
  - [ ] Pins are color-coded by category (green = environment, blue = health, yellow = community, purple = science/tech)
  - [ ] Map is pannable and zoomable smoothly on desktop and mobile
  - [ ] Custom pin design with pulse animation — no default library markers
- **Priority:** P0 (Critical)

#### 2. Country Story Card Overlay
- **What:** Tapping a country pin opens a card panel (slide-up on mobile, side panel on desktop) showing a scrollable list of that country's recent positive stories. Each story card shows: headline, 2-3 sentence summary, category tag, source name, and link to the original article. An X button closes the panel.
- **User Story:** As a user, I want to tap a country pin and see a clean card panel with that country's positive news stories so I can quickly read what good things are happening there.
- **Success Criteria:**
  - [ ] Panel slides in with spring easing (300ms) when a pin is tapped
  - [ ] Each story shows: headline, summary (2-3 sentences), category tag, source name, original article link
  - [ ] Panel is scrollable when stories exceed screen height
  - [ ] X button or clicking outside the panel closes it
  - [ ] All links open in a new tab
- **Priority:** P0 (Critical)

#### 3. Automated AI Content Pipeline
- **What:** A scheduled pipeline (runs every 6 hours) that fetches positive news from 10-15 global RSS feeds, uses Claude Haiku to filter for positive sentiment, extract the country/location, generate a 2-3 sentence summary, and assign a category tag. Results are stored in Supabase and served to the map. Global coverage is a core requirement — sources must include Africa, South America, Asia, and the Middle East.
- **User Story:** As a user, I want the map to always have fresh, globally-diverse positive stories so there's always something new to discover from every corner of the world.
- **Success Criteria:**
  - [ ] Pipeline runs automatically every 6 hours via GitHub Actions
  - [ ] Stories from 20+ different countries represented on the map at any time
  - [ ] Coverage includes Africa, South America, Asia, Middle East — not just Western outlets
  - [ ] 50+ new stories processed per day
  - [ ] Claude Haiku geo-tagging accuracy >90% (manually spot-checked after setup)
  - [ ] Duplicate articles are filtered out (deduplicated by URL + title hash)
- **Priority:** P0 (Critical)

### Nice to Have (If Time Allows)
- **Category filter buttons:** Filter the map to show only environment / health / community / science pins
- **"Today" vs "This Week" toggle:** Switch between stories from last 24 hours or last 7 days
- **Story count badge on pins:** Show number of available stories before tapping

### NOT in MVP (Saving for v2)

| Feature | Why Wait |
|---------|----------|
| User accounts / bookmarks | Validate engagement first, then add saves |
| Native iOS/Android app | Validate web concept before investing in native |
| Push notifications / newsletter | Growth features — post-traction |
| Search | Add once story volume justifies it |
| Social sharing cards per story | Nice for growth, not blocking launch |
| User story submissions | Community features come post-validation |
| Premium / paid tier | Prove free value first |

*Why we're waiting: Keeps the MVP buildable in 2 weeks and focused on the core discovery experience.*

---

## How We'll Know It's Working

### Launch Success Metrics (First 30 Days)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Unique visitors | 500 | Vercel Analytics / Plausible |
| Countries with pins | 30+ at any time | Supabase query |
| Average session duration | > 3 minutes | Analytics |
| Bounce rate | < 60% | Analytics |
| Organic shares / mentions | 20+ | Manual search tracking |

### Growth Metrics (Months 2-3)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Monthly active users | 2,000 | Analytics |
| Return visitor rate | > 30% | Analytics |
| Stories processed daily | 200+ | Pipeline logs |

---

## Look & Feel

**Design Vibe:** Dark, handcrafted, editorial, premium minimal — anti-doomscrolling

**Visual Principles:**
1. **The map is the hero** — no chrome, no clutter; full-screen map is the first and only thing you see on load
2. **Handcrafted, not generated** — custom typography, custom pins, intentional whitespace; never raw defaults from a component library
3. **Calm over stimulation** — no red badges, no notification dots, no infinite scroll urgency; the interface should feel like a breath of fresh air

**Color Palette:**

| Element | Color | Hex |
|---------|-------|-----|
| Map background | Deep navy | `#0a0f1e` |
| Water | Slightly lighter navy | `#0d1b2a` |
| Land | Dark navy | `#131c2e` |
| Country borders | Muted blue-grey | `#1e3a5f` |
| Pin — Environment | Green | `#4ade80` |
| Pin — Health | Blue | `#60a5fa` |
| Pin — Community | Yellow | `#fbbf24` |
| Pin — Science/Tech | Purple | `#a78bfa` |
| Body text | Light grey | `#e2e8f0` |

**Typography:**
- **Headlines / Logo:** Playfair Display or Cormorant Garamond (editorial, newspaper DNA)
- **Body / Cards:** DM Sans or Sora (clean but distinctive — not Inter)
- **Category labels:** Space Mono (monospace adds a data/tech edge)

All free on Google Fonts. Maximum 2 typefaces — one display, one body.

**Key Screens:**
1. **World Map (Home):** Full-screen dark map with animated glowing pins — the entire product in one view
2. **Country Card Panel:** Slide-up overlay (mobile) or side panel (desktop) with scrollable story feed

### Wireframes

```
Main Screen
┌──────────────────────────────────────────┐
│  ✦ Wholesome News              [filter▼] │
├──────────────────────────────────────────┤
│                                          │
│         [FULL-SCREEN WORLD MAP]          │
│   ·            ·                         │
│        ·            ·   [glowing pins]   │
│   ·         ·                ·           │
│                   ·                      │
│        ·                  ·              │
│                                          │
└──────────────────────────────────────────┘

Country Card Overlay (on pin tap — mobile)
┌──────────────────────────────────────────┐
│         [MAP — slightly dimmed]          │
│                                          │
│  ┌────────────────────────────────── [✕] │
│  │  🇳🇬  Nigeria  ·  4 stories            │
│  │  ─────────────────────────────────   │
│  │  Headline text goes here              │
│  │  Summary sentence one. Sentence two.  │
│  │  [Environment]  ·  Good News Network ↗│
│  │  ─────────────────────────────────   │
│  │  Second headline text                 │
│  │  Summary sentence one. Sentence two.  │
│  │  [Community]  ·  Africanews ↗         │
│  │  ─────────────────────────────────   │
│  │             [Load more]               │
│  └───────────────────────────────────── │
└──────────────────────────────────────────┘
```

---

## Technical Considerations

**Platform:** Web — responsive (mobile, tablet, desktop)
**Map Library:** MapLibre GL JS + OpenFreeMap tiles (fully free, dark-themeable)
**Performance:** Map loads < 3 seconds; card animations at 60fps
**Accessibility:** WCAG 2.1 AA minimum; keyboard-navigable map controls
**Privacy:** No user data collected at MVP — no accounts, no tracking cookies beyond basic analytics
**Scalability:** Supabase free tier handles 2-5M rows — years of runway at 200 stories/day
**Browser Support:** Chrome, Safari, Firefox, Edge (latest 2 versions); iOS 14+, Android 10+

---

## Quality Standards

**What This App Will NOT Accept:**
- Placeholder content in production ("Lorem ipsum", empty states with no stories)
- Default shadcn/Radix components used without custom styling overrides
- Broken or half-built features at launch — if it doesn't work, it's cut
- Desktop-only testing — mobile must be tested before ship
- Generic default map pin markers

---

## Budget & Constraints

**Development Budget:** Free tools + AI coding assistance
**Timeline:** 2 weeks to working MVP
**Team:** Solo build with AI assistance

### Monthly Operating Cost

| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Next.js hosting | $0 (free tier) |
| Supabase | PostgreSQL DB + REST API | $0 (free tier) |
| GitHub Actions | Scheduled pipeline cron | $0 (free tier) |
| OpenFreeMap / MapTiler | Map tiles | $0 (free tier) |
| Claude Haiku 4.5 | Filter + geo-tag + summarize | ~$3–7/month |
| **Total** | | **~$3–7/month** |

**Cost note:** Processing 150-300 articles/day via Claude Haiku 4.5 costs approximately $3–7/month using the standard API. Use the Batch API for historical backfills to cut costs 50%, but use standard API for the live 6-hour pipeline (batch has up to 24-hour response delay).

**Hidden cost flags to watch:**
- Supabase free projects pause after 7 days of inactivity — set up a weekly GitHub Actions ping
- Vercel serverless functions timeout at 10s on free tier — run the pipeline in GitHub Actions, not Vercel functions
- MapTiler free tier: 100k tile loads/month — sufficient for MVP traffic

---

## Open Questions & Assumptions

- **Assumption:** Claude Haiku geo-tagging will be >90% accurate after prompt tuning — verify in Week 1 pipeline testing
- **Assumption:** 10-15 RSS feeds will generate enough geographic diversity — expand sources in Week 2 if coverage gaps appear
- **Open question:** Should the map start centered on a default view or auto-fit to where today's stories are? (Lean: auto-fit to show global coverage immediately)
- **Open question:** How to handle stories where no country can be confidently extracted? (Default: skip and log for review; don't guess)

---

## Launch Strategy

**Soft launch:** Friends/network first — fix obvious bugs before going public
**Public launch channels:** r/InternetIsBeautiful, r/UpliftingNews, r/webdev, Hacker News (Show HN)
**Feedback plan:** Simple "Report wrong location" button on each story card; direct feedback link
**Iteration cycle:** Weekly pipeline improvements based on geographic coverage gaps

---

## Definition of Done for MVP

The MVP is ready to launch when:
- [ ] All P0 features are functional (map, pins, card overlay, AI pipeline)
- [ ] Stories from 20+ countries are visible on the map at any time
- [ ] Card overlay works on mobile and desktop
- [ ] Pipeline runs automatically every 6 hours without manual intervention
- [ ] Site loads in < 3 seconds on a standard connection
- [ ] One complete user journey works end-to-end: open site → see pins → tap pin → read stories → click original link
- [ ] Basic analytics are tracking (page views, session duration)
- [ ] Tested on: iOS Safari, Android Chrome, desktop Chrome, desktop Firefox
- [ ] Deployment is automated: push to GitHub → auto-deploys to Vercel

---

## Next Steps

1. Review and approve this PRD
2. Create Technical Design Document (Part 3)
3. Set up development environment (Next.js + Supabase + MapLibre GL JS)
4. Build and test RSS pipeline with 5 sources before scaling
5. Test on mobile before any public sharing
6. Launch

---

*Document created: 2026-05-22*
*Status: Draft — Ready for Technical Design*
*Research source: wholesome_news_map_research.md*
