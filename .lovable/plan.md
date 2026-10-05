# RASA Luxury Refinement Plan

Scope: refine the existing design system (black + copper + serif) without scrapping it. Implement in phases so each shippable step is reviewable.

## Phase 1 — Foundation (tokens, nav, age gate)

1. **Design tokens** (`src/styles.css`)
   - Add per-collection palettes as CSS variables:
     - Majlis: `--majlis-emerald`, `--majlis-copper`, gradient + pattern bg
     - Makhmal: `--makhmal-burgundy`, `--makhmal-wine`, `--makhmal-rosegold`
     - Tarkib: `--tarkib-navy`, `--tarkib-copper`
   - Bump body/nav contrast (`text-foreground/70` → `/85`), copper text token tuned for AA.
   - Add `--shadow-luxury`, `--border-copper`, glass surface token.

2. **Age Gate** (`src/components/AgeGate.tsx`)
   - Layout: RASA wordmark, "Smoke, Perfected.", adult-content copy, two buttons: `ENTER` (primary copper) and `I'M BELOW 18` (ghost). Remove EXIT.
   - Under-18 → route to new `/restricted` luxury page.

3. **Header / Mega Menu** (`src/components/SiteHeader.tsx`)
   - Replace SHOP with: HOME · HOUSE OF RASA · COLLECTIONS ▾ · HOOKAH ▾ · ACCESSORIES · PARTNERS · CONTACT · 🔍
   - COLLECTIONS mega menu: View All, Majlis, Makhmal, Tarkib (with mini logo + tagline).
   - HOOKAH mega menu: Classic Series (Portable/Medium/Large) + Luxury Series (Portable/Medium/Large) in two columns.
   - Logo +25% size, more whitespace.
   - Smooth fade/slide (200ms), no jank.

## Phase 2 — Collections (hero + identity + density)

4. **Collections index** (`src/routes/collections.index.tsx`)
   - Tighten vertical rhythm by ~40% (remove giant `mt-*`, collapse empty bands).
   - Hero hierarchy reorder:
     - eyebrow: `COLLECTION` (small copper tracked)
     - H1: collection name
     - H2 serif: `The Expression of …`
     - tagline italic
   - Three collection blocks rebuilt with distinct backgrounds:
     - Majlis: emerald + copper, subtle geometric arabesque overlay
     - Makhmal: burgundy/wine, soft velvet radial gradient
     - Tarkib: midnight navy + copper, geometric line pattern
   - Each: intro paragraph, signature characteristics (3 chips), Featured Flavors grid (4-6 cards), philosophy quote, CTA.

5. **Product Card** (`src/components/ProductCard.tsx`, new)
   - Glass surface, copper hairline border, copper glow on hover, lift shadow.
   - Fields: name, flavor notes, format chips, "Request Information" button.

6. **Format Selector** (`src/components/FormatSelector.tsx`, new)
   - 20g / 60g / 250g / 500g / 1kg pills, copper outline, soft glow on hover, elegant selected state.

## Phase 3 — Home & Business credibility

7. **Home** (`src/routes/index.tsx`)
   - Tighten spacing.
   - Add **Distribution & Partnerships** section: 5 icon cards (Distribution, Domestic & International, Wholesale, Hospitality, Growth Support).
   - Add **Become a Partner** band above footer with benefits list + primary CTA.
   - Sprinkle conversion CTAs (Request Info / Explore Collection).

8. **Footer** (`src/components/SiteFooter.tsx`)
   - 5 columns: Company / Navigation / Collections / Partnerships / Contact.
   - Newsletter signup row.
   - Legal links + registered office, email, WhatsApp.
   - Keep tight padding (no giant gap to last section).

## Phase 4 — New routes

9. `src/routes/partners.tsx` — partner benefits, application CTA, contact form anchor.
10. `src/routes/restricted.tsx` — luxury "access restricted" page for under-18.
11. `src/routes/hookah.*.tsx` placeholders (Classic / Luxury series landing) so mega menu links resolve.

## Technical notes

- All colors via CSS variables; no hardcoded hex in components.
- Animations: 300–500ms ease-out, no aggressive transforms.
- Tailwind v4 `@theme` tokens in `src/styles.css`; mega menu uses CSS grid; product cards use semantic `bg-card` + copper border variable.
- Accessibility: AA contrast on copper text by darkening background behind it or lightening the copper.

## Delivery order

I'll ship in this order so you can review incrementally:
1. Phase 1 (foundation + nav + age gate)
2. Phase 2 (collections + product card + format selector)
3. Phase 3 (home credibility + footer)
4. Phase 4 (new routes)

Confirm and I'll start with Phase 1.
