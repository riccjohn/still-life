# Infinite Inspo — Research Artifact
**Date:** 2026-03-08
**Feature:** Full-stack art feed app (anti-doomscrolling Instagram alternative)
**Depth:** Standard (3 web research agents, no prior codebase)

---

## 1. Concept Summary

Build a **mobile-first** web app that replicates the feel of Instagram infinite scroll — dopamine hits, effortless discovery — but shows 2D fine art and human creativity (paintings, drawings, graphic design) instead of social content. The goal is a direct, comfortable replacement for Instagram: same UX muscle memory, positive content. Users like artwork to signal interest; the algorithm uses those likes to personalize their feed over time.

**Scope decisions (locked):**
- **MVP**: Mobile-only, pure infinite scroll, random feed from museum APIs, likes stored locally, no accounts
- **Phase 1**: User accounts (Supabase), like history, algorithmic personalization based on liked works
- **Phase 2+**: Donations, Rijksmuseum/Europeana/Smithsonian APIs, explore views
- **Content**: 2D only — paintings, drawings, illustrations, graphic design. No sculpture, architecture, textiles.
- **Attribution**: Displayed beneath each image like an Instagram caption (artist, title, year, source museum)
- **Monetization**: Donations (post-MVP)

**Analogous apps found:** DailyArt (mobile, paid), Muzei (Android wallpaper), Are.na (curated web, slow, subscription). None offer an Instagram-speed infinite art feed on mobile web. **This is an open niche.**

---

## 2. Free Art Content APIs

### Tier 1 — Use from Day 1 (no key, CC0, CDN-backed)

| API | Auth | Rate Limit | Images | License | Commercial |
|-----|------|-----------|--------|---------|-----------|
| **Met Museum** | None | 80 req/sec | High-res JPEG, IIIF | CC0 | Yes |
| **Art Inst. Chicago** | None | 60 req/min | IIIF flexible | CC0/CC-BY per work | Yes (check per work) |
| **Cleveland Museum** | None | None documented | 900px + 3400px JPEG + TIFF | CC0 | Yes |

- Met: 480,000 CC0 objects. Filter: `isPublicDomain=true`. Endpoint: `collectionapi.metmuseum.org`. [Confidence: High]
- AIC: 131k artworks, Elasticsearch search, filter `is_public_domain=true`. IIIF images at `www.artic.edu/iiif`. [Confidence: High]
- Cleveland: No key, no rate limit, print-quality images, plus image similarity search ("discover more like this"). [Confidence: High]

### Tier 2 — Add Post-MVP (key required or attribution needed)

| API | Auth | Rate Limit | Images | License | Note |
|-----|------|-----------|--------|---------|------|
| **Rijksmuseum** | None (new platform) | Undocumented | IIIF + Micrio CDN | CC-BY | Attribution required |
| **Europeana** | Free API key | None documented | Varies by institution | Mixed; filter to CC0 | 50M+ items breadth |
| **Smithsonian** | Free API key | ~1,000/hr | IIIF | CC0 | 5.1M items, US art focus |

- Rijksmuseum: 600k objects including Dutch Masters. New platform launched 2024, some quirks need testing. [Confidence: Medium]
- Europeana: Enormous breadth, but image reliability varies by contributing institution. [Confidence: Medium]
- Smithsonian: Best for American art diversity. Unit codes needed to target specific museums (SAAM, FSG, etc.). [Confidence: High]

### Tier 3 — Avoid or Use With Caution

- **Harvard Art Museums**: Non-commercial restriction. Skip for a public web app. [Confidence: High]
- **Unsplash**: Great contemporary photography but only 50 req/hr on demo; production approval required before shipping. Not classical art. [Confidence: High]
- **Wikimedia Commons**: Usable but requires per-file license checking. High engineering overhead for variable reliability. [Confidence: High]

### Image Delivery Pattern

All Tier 1 APIs serve images from their own CDNs (IIIF servers). **Do not route their images through Next.js image optimization** — it wastes quota and re-processes already-optimized images. Add domains to `next.config.js` `remotePatterns` and use their CDN URLs directly.

---

## 3. Tech Stack Recommendation

### Frontend
- **Next.js 15 (App Router)** — best image tooling, largest ecosystem, native Vercel zero-config deployment. SSR for SEO on artwork pages. [Confidence: High]
- **Tailwind CSS v4** — utility-first, zero runtime overhead [Confidence: High]
- **TypeScript** — standard for maintainability

### Infinite Scroll & Data Fetching
- **TanStack Query v5** (`useInfiniteQuery`) — industry standard for paginated feeds, cursor-based pagination, background refetch, optimistic updates. [Confidence: High]
- **TanStack Virtual** — variable-height virtualization; outperforms react-window for non-uniform content. Prevents DOM bloat as user scrolls thousands of artworks. [Confidence: High]
- **Intersection Observer API** — trigger next page load when user approaches feed bottom (zero library overhead). [Confidence: High]

### Scroll UX — The Core Feel
- **CSS `scroll-snap-type: y mandatory`** — browser compositor handles snapping; silky smooth on mobile. Each scroll gesture lands on the next artwork. Forces a beat of attention before advancing. This is the primary anti-doomscroll mechanism — art requires dwell time. [Confidence: High]
- TikTok/Shorts uses this exact CSS primitive. Works natively without JS overhead.
- Primary view: **full-screen scroll-snap** (one artwork = one viewport). Secondary view: **masonry grid** for browsing by movement/era.

### Backend
- **Next.js Route Handlers** (BFF pattern) — aggregate multiple art APIs behind a single unified `/api/feed` endpoint. Zero extra infrastructure, deploys free on Vercel. [Confidence: High]
- **Hono on Cloudflare Workers** — alternative if global <50ms latency becomes important at scale. [Confidence: Medium]

### Database
- **MVP**: No database. LocalStorage for likes/preferences. Zero cost, zero infra.
- **Phase 1**: Supabase free tier — Auth (OAuth via Google/Apple) + Postgres (like history, user prefs) + Storage. 50k MAU free, 500MB storage. [Confidence: High]
- Like history in Postgres enables collaborative filtering / content-based recommendations in Phase 1.

### Image Loading
- Use art API CDN URLs directly (IIIF servers) in `<img>` tags with proper `loading="lazy"` and `sizes`
- Blur-up pattern: embed base64 LQIP in HTML → fade to full-res on load
- Next.js `<Image>` only for assets you own (logos, UI elements)

---

## 4. Hosting Cost Analysis

| Tier | Stack | Cost | MAU Ceiling |
|------|-------|------|-------------|
| **Free** | Vercel Hobby + Supabase Free | $0/mo | ~5,000 |
| **First dollar** | + Supabase Pro OR Cloudflare Workers Paid | $5–25/mo | ~50,000 |
| **Growth** | Vercel Pro + Supabase Pro | ~$45/mo | ~100k+ |

- Vercel Hobby: 100GB bandwidth, 100k function invocations/day, unlimited static. [Confidence: High]
- Supabase Free: 500MB DB, 1GB storage, 50k MAU auth. [Confidence: High]
- **Image bandwidth is not a cost concern** — all art images served from external museum CDNs (Met, AIC, Cleveland). We pay nothing for image delivery at any scale.
- First scaling bottleneck will be API route invocations, not bandwidth.

---

## 5. UX Design

### Core Philosophy: Instagram Feel, Positive Content

The app should feel immediately familiar to an Instagram user. The UX friction of switching from Instagram should be near-zero — same scroll gesture, same like gesture, same visual rhythm. The only difference is what's on screen.

### Feed Layout
- **Primary feed**: Vertical infinite scroll (free scroll, not snap). Full-width images, portrait-optimized for mobile. Instagram-style card with image + attribution caption below.
- **Like button**: Heart icon (Instagram-familiar). Tap to like. MVP stores in localStorage; Phase 1 syncs to Supabase.
- **Attribution caption** (always visible, below image): `Artist Name — Title, Year · Museum Name`. Mirrors how Instagram shows a post's description. This satisfies CC-BY requirements gracefully.
- No snap-scrolling — free scroll like Instagram, not TikTok full-screen snap.
- No public like counts displayed (private likes used for personalization only, not social pressure).

### Content Filtering (MVP)
- Filter APIs to 2D works only: paintings, drawings, prints, illustrations, graphic design
- Met Museum: departments 1 (American Paintings), 11 (European Paintings), 15 (Drawings and Prints), 21 (Modern and Contemporary Art)
- AIC: filter by `classification_title` (Painting, Drawing, Print, Photograph of Artwork)
- Avoid: sculpture, decorative arts, textiles, architecture (3D / non-2D)

### No Dark Patterns
- No autoplay, no sound (all content is static images)
- No push notifications in MVP
- No follower counts or public social metrics

### Competitor Landscape
- **DailyArt** (mobile, ~$3/mo): One painting per day with explanation. No infinite scroll. [Confidence: High]
- **Muzei** (Android): Rotating wallpaper from curated sources. Not a browsing app. [Confidence: High]
- **Are.na** (web, subscription): Slow, curated, no algorithm. Beloved by designers. Not visual-feed focused. [Confidence: High]
- **Gap**: No app offers Instagram-speed, infinite, mobile-web art discovery. This is the opportunity.

---

## 6. Architecture Overview

```
Mobile Browser (primary target)
  └─ Next.js 15 (App Router, Vercel)
       ├─ /              → Infinite scroll feed (Instagram-style)
       ├─ /artwork/[id]  → Individual artwork page (SSR for SEO)
       └─ /api/feed      → Route Handler (BFF)
                             ├─ Met Museum API    (no key, CC0)
                             ├─ Art Inst. Chicago (no key, CC0)
                             └─ Cleveland Museum  (no key, CC0)
                             (+ Rijksmuseum, Smithsonian in Phase 2)

State:   TanStack Query (useInfiniteQuery) + Intersection Observer
Likes:   MVP → localStorage | Phase 1 → Supabase Postgres
Auth:    Phase 1 → Supabase Auth (Google/Apple OAuth)
Algo:    Phase 1 → content-based filtering on liked artwork metadata
                   (artist, movement, era, medium, color palette)
```

---

## 7. Decisions (All Resolved)

1. **Feed ordering MVP**: Pure random — no ordering logic in MVP.
2. **Personalization algorithm**: Content-based filtering in Phase 1 (liked artwork metadata → find similar by artist/movement/era/medium). Collaborative filtering deferred to a later phase when user base is large enough.
3. **Image quality filtering**: BFF filters out works with no `primaryImage`, broken URLs, or below minimum resolution before serving to client.
4. **Desktop**: Mobile-only for MVP and Phase 1. Desktop layout deferred to a later phase.
5. **PWA**: Add PWA manifest + service worker post-MVP to enable "Add to Home Screen" — completes the Instagram-replacement feel.
