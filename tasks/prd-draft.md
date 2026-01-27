# PRD: CoachDesk Futuristic Luxury Marketing Website

## Introduction/Overview

Create a production-ready, visually stunning marketing website for the fictional ultra-premium Coach Desk / Help Desk app, “CoachDesk.” This is a brownfield addition to the existing CoachDesk repository (backend + Vite app), delivered as a new Next.js + TypeScript site that showcases the brand with a futuristic luxury aesthetic, premium UX, and performance-first implementation. The marketing site is informational only (no backend integration) and must coexist without disrupting the existing HelpDesk web app in `web/`.

## Goals

- Launch a premium, futuristic-luxury marketing site that reflects CoachDesk’s ultra-premium brand.
- Deliver smooth, performant animations and micro-interactions without heavy libraries.
- Provide a clean, accessible, mobile-first experience that scales to 4K displays.
- Implement a structured, reusable component system aligned with Next.js + Tailwind + Framer Motion.
- Ensure SEO-ready metadata, optimized images, and clear image attribution.

## Clarifying Decisions (Defaults)

- Scope: **New marketing site (additive)**; no changes to the existing Vite app behavior.
- Areas touched: New Next.js app + minimal doc updates; no backend/API changes.
- Backward compatibility: Fully backward compatible; existing `/web` app and APIs remain unchanged.
- Integration approach: Follow repo conventions; keep marketing site isolated in a new top-level directory.
- Testing: No new automated tests required; rely on TypeScript checks, Next.js build, and manual QA/Lighthouse.

## Integration Points

### Existing Components to Modify
- `README.md` - Add marketing site development/build instructions and location.
- `docs/deployment/*` (if present) - Document separate deployment target for the marketing site.

### Existing Components to Reuse
- None directly; the marketing site is a standalone Next.js app.

### New Files to Create
- `web-marketing/` (new Next.js app)
  - `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.js`, `tailwind.config.ts`
  - `app/layout.tsx` - global layout, fonts, metadata
  - `app/page.tsx` - main landing page sections
  - `app/destinations/[slug]/page.tsx` - optional destination detail route
  - `app/globals.css` - Tailwind base + custom theme utilities
  - `app/icon.svg` - simple SVG favicon mark
  - `components/Navbar.tsx`, `Hero.tsx`, `DestinationsGrid.tsx`, `MembershipTiers.tsx`, `Testimonials.tsx`, `ConciergeForm.tsx`, `Footer.tsx`
  - `components/SectionReveal.tsx`, `components/GradientBorder.tsx`, `components/ScrollSpy.tsx`
  - `data/destinations.ts`, `data/testimonials.ts`, `data/tiers.ts`
  - `lib/scroll.ts`, `lib/validation.ts`, `lib/constants.ts`

### Database Changes
- None.

## Compatibility

### Backward Compatibility
- Existing API routes and the Vite-based HelpDesk app remain unchanged.
- The marketing site is deployed independently (e.g., `marketing.coachdesk.com` or `/marketing`).

### Migration Requirements
- None.

### Deprecations
- None.

## User Stories

### US-001: Scaffold Next.js marketing app
**Description:** As a developer, I want a dedicated Next.js + TypeScript app so the marketing site can be built independently of the existing Vite app.

**Acceptance Criteria:**
- [ ] New `web-marketing/` app boots with `next dev` and builds with `next build`.
- [ ] Tailwind CSS is configured and functional.
- [ ] Typecheck passes.
- [ ] Existing tests still pass.

**Integration Notes:**
- Adds: `web-marketing/` app structure and configs.
- Modifies: `README.md` (document new app).

### US-002: Global layout, typography, and theme
**Description:** As a user, I want a futuristic luxury visual system so the site feels premium and cohesive.

**Acceptance Criteria:**
- [ ] Space Grotesk (headings) and Inter (body) loaded via `next/font/google`.
- [ ] Dark-mode, glassmorphism theme implemented via Tailwind + CSS variables.
- [ ] Global background includes subtle animated gradient and noise overlay.
- [ ] Focus states and keyboard navigation are visible and accessible.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Modifies: `web-marketing/app/layout.tsx`, `web-marketing/app/globals.css`.

### US-003: Sticky glass navbar with active section tracking
**Description:** As a visitor, I want a premium sticky navbar with scroll-aware section highlighting for easy navigation.

**Acceptance Criteria:**
- [ ] Glassmorphism navbar with logo, section links, and “Request Itinerary” CTA.
- [ ] Active section is highlighted while scrolling (IntersectionObserver-based).
- [ ] CTA anchors to the concierge form section.
- [ ] Keyboard navigation and focus rings work for all links.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Adds: `components/Navbar.tsx`, `components/ScrollSpy.tsx`, `lib/scroll.ts`.

### US-004: Cinematic hero with parallax and aurora
**Description:** As a visitor, I want a cinematic hero section that feels futuristic and luxurious.

**Acceptance Criteria:**
- [ ] Hero includes headline, subtext, primary CTA, secondary CTA.
- [ ] Background image uses `next/image` with animated gradient overlay + subtle noise.
- [ ] Animated “aurora” gradient blob behind hero text.
- [ ] Parallax-like motion on hero elements and smooth entrance reveal.
- [ ] Primary CTA has animated conic-gradient border.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Adds: `components/Hero.tsx`, `components/GradientBorder.tsx`.
- Uses: `next/image`, Framer Motion.

### US-005: Destinations grid (CoachDesk key topics)
**Description:** As a visitor, I want a grid of CoachDesk “destinations” that communicate key product strengths.

**Acceptance Criteria:**
- [ ] 6 cards with topics like: Omni-Channel Concierge, SLA Intelligence, Incident Command, Knowledge Nexus, Secure Automation, Client Insights.
- [ ] Hover shimmer, slight tilt, and quick facts reveal.
- [ ] Clicking a card navigates to `/destinations/[slug]` (static data) by default.
- [ ] Cards include animated gradient borders and subtle glow rings.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Adds: `components/DestinationsGrid.tsx`, `app/destinations/[slug]/page.tsx`, `data/destinations.ts`.

### US-006: Membership tiers section
**Description:** As a visitor, I want to compare premium membership tiers to understand service levels.

**Acceptance Criteria:**
- [ ] Three tiers: Silver, Black, Obsidian with distinct benefits and pricing placeholders.
- [ ] Featured tier uses elevated styling and animated border.
- [ ] Cards respond to hover with lift + glow.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Adds: `components/MembershipTiers.tsx`, `data/tiers.ts`.

### US-007: Testimonials section
**Description:** As a visitor, I want to see social proof from luxury clients.

**Acceptance Criteria:**
- [ ] Display 4–6 testimonials (cards or simple carousel).
- [ ] Cards are horizontally scrollable on mobile.
- [ ] Include client name, role, and quote.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Adds: `components/Testimonials.tsx`, `data/testimonials.ts`.

### US-008: Concierge request form with client validation
**Description:** As a visitor, I want to submit a concierge request with immediate feedback.

**Acceptance Criteria:**
- [ ] Fields: name, email, dates, travelers, interests (chips), budget (select), notes.
- [ ] Client-side validation and inline error messaging.
- [ ] Submit shows toast “Request received” (no backend).
- [ ] Form fields are accessible with labels and aria descriptors.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Adds: `components/ConciergeForm.tsx`, `lib/validation.ts`.

### US-009: Footer with image credits and premium finish
**Description:** As a visitor, I want a minimal footer with credits and final CTA.

**Acceptance Criteria:**
- [ ] Footer includes logo, minimal nav, and “Image Credits” list.
- [ ] Image credits text: “Images via Unsplash Source / Pexels.”
- [ ] Footer maintains dark glass aesthetic.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Adds: `components/Footer.tsx`.

### US-010: SEO, metadata, and performance
**Description:** As a product owner, I want SEO-ready metadata and optimized imagery.

**Acceptance Criteria:**
- [ ] Metadata includes title, description, OpenGraph, and social preview.
- [ ] Favicon is an inline SVG mark (`app/icon.svg`).
- [ ] `next/image` used for all remote imagery with proper `sizes`/`priority`.
- [ ] `next.config.ts` allows remote domains for Unsplash/Pexels.
- [ ] Lighthouse scores 90+ for Performance and Accessibility (target).

**Integration Notes:**
- Modifies: `web-marketing/app/layout.tsx`, `next.config.ts`.

## Functional Requirements

1. The marketing site must use **Next.js (latest stable)** with TypeScript.
2. Styling must use **Tailwind CSS** with a futuristic luxury theme and glassmorphism.
3. Entrance/scroll animations must use **Framer Motion** with respect for `prefers-reduced-motion`.
4. All imagery must be remote and rendered via **next/image** with lazy loading.
5. The site must be fully responsive (mobile-first) and look excellent on iPhone and 4K displays.
6. Provide sticky glass navbar with active section highlighting and a “Request Itinerary” CTA.
7. Provide hero with cinematic background, animated gradient overlay, noise texture, and aurora blob.
8. Provide destinations grid of 6 cards with hover shimmer, tilt, and quick facts reveal.
9. Provide membership tiers (Silver/Black/Obsidian) and testimonials.
10. Provide concierge form with client-side validation and toast success.
11. Provide floating “Request Help” button on mobile viewports.
12. Provide SEO metadata, OpenGraph tags, and SVG favicon.
13. Footer must include image credits and maintain premium visual style.

## Remote Imagery (Required URLs)

Use these remote image URLs for backgrounds/cards:

- Hero background: `https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2000&q=80`
- Destination 1: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80`
- Destination 2: `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80`
- Destination 3: `https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80`
- Destination 4: `https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80`
- Destination 5: `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80`
- Destination 6: `https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200`

## Non-Goals (Out of Scope)

- No backend integration or data persistence.
- No user authentication or account creation.
- No CMS integration or admin editing.
- No multi-language support in this iteration.

## Technical Considerations

- Use Next.js App Router with server components where appropriate.
- Use `next/font/google` to load Space Grotesk + Inter with proper font-display.
- Define a theme in Tailwind with CSS variables for gradients and gold accents.
- Implement conic-gradient borders via CSS and a reusable `GradientBorder` component.
- Use IntersectionObserver-based scroll spy for navbar active state.
- Provide accessible focus outlines and semantic headings hierarchy.
- Keep animations GPU-friendly; avoid heavy runtime libraries.
- Ensure `next.config.ts` allows `images.unsplash.com`, `source.unsplash.com`, and `images.pexels.com`.

## Success Metrics

- Lighthouse scores ≥ 90 for Performance and Accessibility.
- Mobile layout feels premium with no layout shifts or jank.
- Average page load (4G simulated) under 3s.
- All images load via `next/image` with no console warnings.

## Open Questions

- None (defaults assumed).

---

## Checklist

- [x] Reviewed existing codebase context
- [x] Asked integration-focused questions (answered with defaults)
- [x] Documented Integration Points section
- [x] Documented Compatibility considerations
- [x] Stories reference specific files to modify
- [x] Stories include "Existing tests still pass" where applicable
- [x] Follows existing patterns (or documents deviations)
- [x] Non-goals prevent scope creep
- [x] No hardcoded secrets
- [x] Saved to `tasks/prd-draft.md`
