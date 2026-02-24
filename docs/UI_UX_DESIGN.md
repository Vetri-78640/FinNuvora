# How I Built the UI for FinNuvora — A Dark-Theme Fintech Design System from Scratch

*A deep dive into the color palette, typography, component architecture, and UX decisions behind FinNuvora — an AI-powered personal finance platform.*

---

## Introduction

When I started building **FinNuvora**, I knew the UI had to feel like a premium fintech product — not a generic dashboard template. Users trust apps that *look* trustworthy, and for a personal finance platform, that trust is everything.

This article covers the complete design process: from choosing the color palette to building a reusable component system, implementing micro-animations, and making it responsive across devices.

**Tech Stack:** Next.js 16, Tailwind CSS, Lucide React icons, Recharts, Google Fonts.

**Live:** [fin-nuvora.vercel.app](https://fin-nuvora.vercel.app)

---

## The Design Philosophy

FinNuvora's UI is built on three core principles:

**1. Dark-First Premium Aesthetic**
Inspired by apps like Robinhood, Revolut, and Arc Browser. A dark theme reduces eye strain during long financial review sessions, makes data visualizations pop, and projects a premium, trustworthy brand image.

**2. Data Density Without Complexity**
Financial dashboards are content-heavy. Users need to see balances, charts, transactions, and portfolios at a glance. We solved this with strong information hierarchy — using font weight, spacing, and color to guide the eye naturally.

**3. Consistency Through Design Tokens**
Every color, spacing value, and component style is defined as a CSS custom property. No ad-hoc values. Change one token and the entire app updates. This is the foundation of a scalable design system.

---

## The Color Palette — Why Amber on Black?

Choosing the right primary color for a finance app isn't just aesthetic — it's psychological.

### Core Background Colors

- **`#1F1F1F`** — Page background. Not pure black, which feels harsh. This dark charcoal provides depth.
- **`#000000`** — Card surfaces. True black creates clear layer separation from the background.
- **`#242424`** — Elevated surfaces (hover states, input backgrounds). Just enough lift to create visual hierarchy.

### The Primary Accent: Amber (`#fbbf24`)

I chose amber/gold as the primary accent for specific reasons:

- **Psychology:** Gold conveys wealth, trust, and premium quality — exactly what a finance platform needs
- **Contrast:** Amber has maximum contrast against dark backgrounds (WCAG AAA compliant)
- **Warmth:** Cold blues and greens feel clinical. Amber feels inviting and personal
- **Hover State:** Slightly deeper amber (`#f59e0b`) provides tactile feedback

The primary color appears on CTAs, active navigation states, focus rings, and data highlights — always drawing attention to the most important element on screen.

### Text Hierarchy (3 Tiers)

- **`#ffffff`** (Primary) — Headlines, monetary values, active labels. Maximum readability.
- **`#a1a1aa`** (Secondary) — Descriptions, supporting text, form labels. Visible but not competing.
- **`#71717a`** (Tertiary) — Timestamps, placeholders, disabled states. Present but subtle.

### Status Colors

- **Green `#22c55e`** — Income, gains, "connected" states, positive trends
- **Red `#ef4444`** — Expenses, losses, errors, destructive actions
- **Amber `#f59e0b`** — Pending states, warnings
- **Blue `#3b82f6`** — Informational content, links, bank integration UI

### Badge Colors for Categories

Investment types, crypto coins, and transaction categories each get a distinctive color: Yellow, Blue, Green, Red, Purple (`#a855f7`), and Pink (`#ec4899`). Each color has a 10% opacity background and 20% opacity border, creating a glass-like layered effect.

---

## Typography

### Font Choices

- **Plus Jakarta Sans** — The workhorse font for all body text, labels, and UI elements. Clean, geometric, and highly readable at small sizes. Weights 400–700.
- **Space Grotesk** — Display font for page titles and hero sections. Slightly quirky, technical feel that matches the fintech personality. Weight 700.

Both loaded via `next/font/google` with `display: swap` for zero layout shift.

### Size Scale

- **Page Titles:** `text-2xl` on mobile, `text-3xl` on desktop — bold, authoritative
- **Section Headers:** `text-xl font-bold` — clear content separation
- **Card Titles:** `text-lg font-semibold` — scannable at a glance
- **Body Text:** `text-sm` or `text-base` — comfortable reading
- **Meta Text:** `text-xs text-tertiary` — timestamps, IDs, secondary info

---

## The Component System

Instead of writing one-off styles, I built a design system using Tailwind's `@layer components` directive. Every UI element maps to a reusable CSS class backed by CSS custom properties.

### Cards — The Primary Container

```css
.card {
  background: var(--color-surface);      /* #000000 */
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1rem;                   /* rounded-2xl */
  padding: 1.5rem;
}
```

The subtle 8% white border provides depth without being heavy. On hover, the border strengthens to 12% and a soft shadow appears — like the card is lifting off the page.

### Buttons — Pill Shape for Impact

```css
.btn-primary {
  background: #fbbf24;
  color: #1F1F1F;
  border-radius: 9999px;               /* rounded-full (pill) */
  box-shadow: 0 10px 15px rgba(251,191,36,0.2);  /* amber glow */
}
```

**Design choice:** Buttons are fully rounded (pill shape) to stand out against the squared card system. The primary button has a subtle amber glow shadow underneath — it looks backlit, premium, and immediately draws the eye.

I offer three button variants:
- **Primary** — Amber with dark text and glow shadow
- **Secondary** — Dark surface with border, light text
- **Ghost** — Transparent, subtle text — for tertiary actions

### Inputs — Focus Ring

Text inputs use a 3px amber glow ring on focus:

```css
.input-field:focus {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.5);
}
```

This provides immediate visual feedback that the input is active, matching the primary color language.

### Modals

```css
.modal-overlay {
  background: rgba(0,0,0,0.80);
  backdrop-filter: blur(4px);
}
```

The `backdrop-blur` creates a frosted glass effect that keeps the modal foregrounded while maintaining spatial context of what's behind it.

---

## Layout Architecture

### Desktop — Persistent Sidebar + Content Area

The dashboard uses a fixed-width sidebar (280px) with the main content area taking the remaining space:

- **Sidebar:** Logo at top, navigation items with icons, logout at bottom
- **Active State:** The active page gets a distinctive cream-yellow pill (`#FFF9C4`) with black text
- **Content Area:** Scrollable, padded, responsive grid containers

### Mobile — Slide-Out Drawer

On screens below 768px, the sidebar collapses. A hamburger icon opens a full-screen slide-out drawer with backdrop overlay. The navigation items remain identical — same icons, same labels, same hierarchy.

### Navigation Items (9 Sections)

Dashboard, Transactions, Goals, Portfolios, Crypto, Tax Summary, Payments, AI Advisor, and Profile — each with a Lucide React icon for instant recognition.

---

## Animations & Micro-Interactions

Subtle motion makes an interface feel alive. Here's what I implemented:

### Entry Animations

- **Slide In** — Content fades in while sliding up 10px (0.3s ease-out). Used for page transitions and modal appearances.
- **Fade In** — Simple opacity transition (0.2s). Used for toasts and notifications.

### Interactive States

- **Button Hover:** Color darkens + subtle transform via CSS `transition-all duration-200`
- **Card Hover:** Border opacity increases, soft shadow appears — feels like the card lifts
- **Focus Ring:** 3px amber glow — consistent across buttons, inputs, and links
- **Loading Spinners:** `animate-spin` on refresh icons during API calls

### Glow Effects

```css
.glow-primary { box-shadow: 0 0 20px rgba(251,191,36,0.3); }
.glow-success { box-shadow: 0 0 20px rgba(34,197,94,0.3); }
```

Used sparingly on primary CTAs and important status indicators for a premium, neon-backlit effect.

---

## Page-by-Page UX Decisions

### Landing Page

The hero section uses a gradient text effect (`.text-gradient` — amber-to-yellow gradient clipped to text) for the main headline. Below: feature grid, pricing cards, social proof — standard SaaS landing funnel optimized for conversion.

### Dashboard

Four stat cards at the top (Balance, Income, Expenses, Investments) in a responsive grid (`grid-cols-2` on mobile, `grid-cols-4` on desktop). Charts use Recharts with custom amber/green/red color mapping. Transaction list with hover states.

### Crypto Portfolio

The showpiece feature. Live prices from CoinGecko API, inline SVG sparkline charts showing 7-day price history, real-time P&L calculation (cost basis vs market value), and a coin search modal with thumbnails and market cap rankings.

### Tax Summary

Year selector dropdown, horizontal bar chart for monthly income vs expenses breakdown, CSV export for accountant-ready data. A disclaimer note at the bottom clarifies that tax estimates are for reference only.

### P2P Payments

Tab interface (Received / Sent) with a pending count badge on the Received tab. Accept/Decline buttons color-coded green/red. Status badges with contextual icons (Clock for pending, Check for accepted, X for declined).

---

## Responsive Strategy

- **Mobile (< 640px):** Single column layouts, sidebar hidden behind hamburger menu, cards stack vertically, sparklines hidden, compact table/card views
- **Tablet (640–768px):** Two-column grids, sidebar starts to appear
- **Desktop (768px+):** Full sidebar visible, multi-column grids, expanded data tables, all visual elements shown

Key responsive patterns used throughout:
- `grid-cols-1 sm:grid-cols-2 md:grid-cols-4` for stat cards
- `flex-col sm:flex-row` for header layouts with actions
- `hidden md:block` for secondary data columns
- Modals at `max-w-md` with `p-4` to prevent edge overflow on mobile

---

## Lessons Learned

1. **CSS custom properties > hardcoded colors.** Every time. Change one token, the whole app follows.
2. **Pill buttons attract clicks.** Rounded buttons have measurably higher click-through than squared ones in our testing.
3. **Dark themes need 3+ surface layers.** Just "dark background + white text" looks flat. You need background → surface → elevated surface for depth.
4. **Amber > Blue for finance.** Blue is the default fintech color. Amber stands out and conveys wealth.

---

## Conclusion

Building FinNuvora's UI was an exercise in designing for trust. Every color, every animation, every layout decision was made to help users feel confident about managing their money through our platform.

The entire design system is open and built with standard tools — Tailwind CSS, CSS custom properties, and a handful of custom components. No design tool lock-in, no paid UI library.

If you're building a fintech product, I hope this gives you a useful reference for design decisions that go beyond "make it look nice."

**Try it live:** [fin-nuvora.vercel.app](https://fin-nuvora.vercel.app)

---

*FinNuvora by Vetri — an AI-powered personal finance platform. Follow for more engineering deep dives.*

**Tags:** `#webdev` `#uidesign` `#nextjs` `#fintech` `#tailwindcss` `#darkmode` `#designsystem` `#ux`
