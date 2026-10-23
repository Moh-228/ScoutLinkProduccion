/**
 * Brand color surfaces shared across pages, so the same block of color is
 * defined once.
 *
 * BRAND_HERO_SURFACE: background of the landing hero (where the student and
 * coach descriptions live). Reused by the login and register pages.
 * BRAND_HERO_GLOW: the soft brand-secondary glow layered on top of it.
 */
export const BRAND_HERO_SURFACE = "bg-linear-to-br from-brand-primary via-brand-primary to-brand-secondary";

export const BRAND_HERO_GLOW =
  "pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-secondary/40 blur-3xl";
