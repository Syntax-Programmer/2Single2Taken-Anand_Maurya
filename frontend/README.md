# DocketIQ — Frontend

AI-assisted judicial decision-support UI. Frontend only: no backend, auth, or
database — every "Predict" button runs a local placeholder calculation so the
interface is fully demonstrable, ready to be pointed at real model endpoints.

## Routes

| Route                | Page                                                  |
|-----------------------|-------------------------------------------------------|
| `/`                   | Landing page                                          |
| `/prediction-center`  | Prediction Center (3 tabs: Duration, Risk, Complexity) |

Static export (`output: "export"` in `next.config.mjs`) — ships as prebuilt
HTML/CSS/JS, matching Cloudflare Pages' static hosting model.

## Folder structure

```
docketiq/
├─ app/
│  ├─ layout.tsx              # fonts (Inter + IBM Plex Sans), metadata
│  ├─ globals.css              # tokens, focus states, reduced-motion, .rule-gold
│  ├─ page.tsx                 # Landing page
│  └─ prediction-center/
│     └─ page.tsx              # Prediction Center page
│
├─ components/
│  ├─ layout/
│  │  ├─ navbar.tsx            # transparent → solid on scroll
│  │  └─ footer.tsx
│  ├─ landing/
│  │  ├─ hero.tsx               # cinematic video bg + image fallback
│  │  ├─ service-cards.tsx      # the 3 module cards (I / II / III)
│  │  └─ trust-strip.tsx        # restrained "about" section (#about)
│  ├─ prediction/
│  │  ├─ prediction-tabs.tsx    # tab shell (Radix Tabs)
│  │  ├─ hearing-duration-form.tsx
│  │  ├─ adjournment-risk-form.tsx
│  │  ├─ case-complexity-form.tsx
│  │  ├─ result-card.tsx        # shared result surface (headline + meter)
│  │  └─ risk-badge.tsx         # Low / Medium / High pill
│  └─ ui/                       # shadcn-style primitives
│     ├─ button.tsx  card.tsx  badge.tsx  tabs.tsx
│     ├─ input.tsx   label.tsx select.tsx progress.tsx  separator.tsx
│
├─ lib/utils.ts                 # cn() class merge helper
├─ types/prediction.ts          # input/result shapes for all 3 modules
└─ public/media/                # hero video + fallback image placeholders
```

## Component hierarchy

```
LandingPage (app/page.tsx)
├─ Navbar
├─ Hero
├─ ServiceCards
│  └─ Card × 3 (Module I / II / III)
└─ Footer

PredictionCenterPage (app/prediction-center/page.tsx)
├─ header (page-local, solid — Prediction Center is a working screen, not a hero)
├─ PredictionTabs
│  ├─ HearingDurationForm   → ResultCard
│  ├─ AdjournmentRiskForm   → ResultCard + RiskBadge
│  └─ CaseComplexityForm    → ResultCard + RiskBadge
└─ Footer
```

## Design system

**Palette** — `tailwind.config.ts`
- Background `#F8F9FA`, surface (cards) `#FFFFFF`, border `#E2E5E9`
- Judicial Blue `judicial-500 #0F4C81` — primary actions, active tab, icon accents
- Muted Gold `gold-500 #B08D57` — reserved strictly for accents: the docket-seal
  numerals, the `.rule-gold` divider, and the "Start Prediction" CTA
- Slate scale for text (`slate-500/600/700/900`)

**Type** — Inter (UI/body) + IBM Plex Sans (headings, `font-plex`), loaded via
`next/font/google` — no external font requests at runtime, no futuristic faces.

**Signature element** — a docket-seal numeral (a thin gold ring holding
"I / II / III") on each module card, standing in for a generic "01/02/03"
by echoing an actual case-number stamp. It's the one deliberately bold visual
idea; everything else — cards, spacing, motion — stays quiet and disciplined.

**Motion** — Framer Motion limited to: hero fade-up on load, a staggered
reveal as the module cards enter the viewport, and a soft slide-in for the
result card. `prefers-reduced-motion` is respected globally in `globals.css`.

**Cards** — `rounded-card` (16px), `shadow-card` at rest, `shadow-card-hover`
+ a 1px lift on hover for interactive cards only (module cards). Result and
form cards stay static — motion is reserved for things you can act on.

## Tailwind approach

- Design tokens (color, radius, shadow, tracking) live in `tailwind.config.ts`
  under `extend` — no ad-hoc hex codes in components.
- `cn()` (clsx + tailwind-merge) on every primitive so consumers can override
  safely without class collisions.
- One utility class, `.rule-gold`, encodes the letterhead-style divider so it
  isn't hand-repeated with inline styles.

## Deployment (Cloudflare Pages)

- Build command: `next build`
- Output directory: `out`
- `next.config.mjs` sets `output: "export"` and `images.unoptimized: true`
  (Cloudflare Pages serves static assets directly, no Next.js image server).

## What's intentionally not here

No API routes, no auth, no dashboards/analytics/reports, no extra pages —
by design, per brief. Each `mockPredict()` in the three form components is
clearly marked as a placeholder — swap it for a `fetch()` to your real model
endpoint when the backend exists.
