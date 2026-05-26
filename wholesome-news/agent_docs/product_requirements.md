# Product Requirements

*Source: PRD-WhalesomeNews-MVP.md*

## Product Overview

**App Name:** Wholesome News
**Tagline:** "See where good things are happening, right now."
**Launch Goal:** Get the MVP live and shareable — prove the map + positive news concept resonates
**Target Launch:** 2 weeks from project start

---

## Primary User

**The Consciously Online** — people aged 15–35 who are heavy internet users but increasingly aware of how doomscrolling affects them. They care about the world, want to feel informed, but don't want to feel hopeless. They follow wholesome news Instagram accounts and share uplifting stories with friends.

**Their pain:**
- Every news platform is optimized for outrage, not wellbeing
- Positive news exists but is buried in boring vertical scroll feeds
- No current app lets them *explore* the world and discover where good things happen
- Existing apps feel generic and uninspired

**Example user:** "Priya, a 24-year-old grad student who checks Twitter too much. She opens Wholesome News during morning coffee, spins the map to East Africa, taps a pin on Kenya, reads about a solar-powered school in Nairobi. Screenshots it to send her group chat. Feels optimistic for the first time before 10am."

---

## P0 Must-Have Features (MVP — Build These First)

### 1. Interactive World Map with Category Pins

**What:** Full-screen dark-themed world map with glowing, color-coded pins for countries with recent positive news stories. Custom pin design with pulse animation — NOT default MapLibre markers.

**User story:** As a user, I want to see an interactive world map showing where good news is happening so I can explore the world and discover positive stories geographically.

**Success criteria:**
- [ ] Map loads within 3 seconds on desktop and mobile
- [ ] Pins display for every country with stories in the last 7 days
- [ ] Pins color-coded: green = environment, blue = health, yellow = community, purple = science/tech
- [ ] Map is pannable and zoomable smoothly on desktop and mobile
- [ ] Custom pulsing pin animation — no default library markers

### 2. Country Story Card Overlay

**What:** Tapping a country pin opens a card panel — slide-up bottom sheet on mobile, side panel on desktop. Shows scrollable list of that country's recent positive stories. Each story card shows: headline, 2-3 sentence summary, category tag, source name, link to original article. X button dismisses.

**User story:** As a user, I want to tap a country pin and see a clean card panel with that country's positive news stories so I can quickly read what good things are happening there.

**Success criteria:**
- [ ] Panel slides in with spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`, 300ms) on pin tap
- [ ] Each story shows: headline, summary, category tag, source name, original link
- [ ] Panel is scrollable when stories exceed screen height
- [ ] X button OR clicking outside closes the panel
- [ ] All links open in a new tab (`target="_blank" rel="noopener noreferrer"`)
- [ ] Mobile layout: bottom sheet (slides up from bottom)
- [ ] Desktop layout: side panel (slides in from right)

### 3. Automated AI Content Pipeline

**What:** Scheduled pipeline running every 6 hours via GitHub Actions. Fetches 10-15 global RSS feeds, sends each article to Claude Haiku (filter positive + extract country + summarize + categorize), stores approved stories in Supabase. Global coverage is a CORE REQUIREMENT.

**User story:** As a user, I want the map to always have fresh, globally-diverse positive stories so there's always something new to discover from every corner of the world.

**Success criteria:**
- [ ] Pipeline runs automatically every 6 hours via GitHub Actions
- [ ] Stories from 20+ different countries visible on map at any time
- [ ] Coverage includes Africa, South America, Asia, Middle East — not just Western outlets
- [ ] 50+ new stories processed per day
- [ ] Claude Haiku geo-tagging accuracy >90% (spot-checked manually)
- [ ] Duplicate articles not re-inserted (url_hash deduplication)
- [ ] Pipeline continues if one RSS source fails (no full crash)

---

## Nice-to-Have (Build only if Week 2 has time)

- **Category filter buttons** — filter map to show only one category of pins
- **"Today" vs "This Week" toggle** — switch between 24-hour and 7-day stories
- **Story count badge on pins** — show number of stories before clicking

---

## NOT in MVP — Do Not Build

| Feature | When |
|---------|------|
| User accounts / bookmarks | After validating engagement |
| Native iOS/Android app | After validating web concept |
| Push notifications / newsletter | Post-traction |
| Search | When story volume justifies it |
| Social sharing cards per story | v2 |
| User story submissions | Post-validation |
| Premium / paid tier | After free value is proven |

---

## Success Metrics

### Launch (First 30 Days)

| Metric | Target |
|--------|--------|
| Unique visitors | 500 |
| Countries with pins | 30+ at any time |
| Average session duration | > 3 minutes |
| Bounce rate | < 60% |
| Organic shares/mentions | 20+ |

### Growth (Months 2-3)

| Metric | Target |
|--------|--------|
| Monthly active users | 2,000 |
| Return visitor rate | > 30% |
| Stories processed daily | 200+ |

---

## Design Requirements

**Vibe:** Dark, handcrafted, editorial, premium minimal — anti-doomscrolling

**Visual principles:**
1. The map is the hero — full-screen, no chrome
2. Handcrafted, not generated — never raw component library defaults
3. Calm over stimulation — no red badges, no notification urgency

**Color palette:**
- Map background: `#0a0f1e`
- Water: `#0d1b2a`
- Land: `#131c2e`
- Borders: `#1e3a5f`
- Environment pins: `#4ade80` (green)
- Health pins: `#60a5fa` (blue)
- Community pins: `#fbbf24` (yellow)
- Science/tech pins: `#a78bfa` (purple)
- Body text: `#e2e8f0`

**Typography:**
- Headlines/Logo: Playfair Display or Cormorant Garamond
- Body/Cards: DM Sans or Sora
- Category labels: Space Mono
- All from Google Fonts — max 2 typefaces

---

## Technical Constraints

- Web-first, responsive (mobile + desktop)
- Free-tier budget: only Claude API costs money (~$3–7/month)
- No user data collected at MVP (no accounts, no PII)
- WCAG 2.1 AA accessibility minimum
- Browser support: Chrome, Safari, Firefox, Edge (latest 2 versions); iOS 14+, Android 10+

---

## Definition of Done for MVP

- [ ] All P0 features functional
- [ ] 20+ countries visible on map at any time
- [ ] Card overlay works on mobile AND desktop
- [ ] Pipeline runs every 6 hours automatically
- [ ] Site loads < 3 seconds
- [ ] End-to-end journey works: open site → see pins → tap pin → read story → click link
- [ ] Analytics tracking (Vercel Analytics)
- [ ] Tested on: iOS Safari, Android Chrome, desktop Chrome, desktop Firefox
- [ ] Auto-deployment working (push to GitHub → deploys to Vercel)
