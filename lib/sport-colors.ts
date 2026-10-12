/**
 * Shared sport → color mappings, kept in one place so every screen that
 * color-codes a sport (badges, accent dots) stays in sync with the
 * sport-* tokens in app/theme.css.
 *
 * Badges use the full, solid sport color as the background (no tint/opacity).
 * Text is white except on volleyball, whose gold is too light for white text
 * to stay readable, so it uses dark brand-primary text instead. Basketball uses
 * the darker `sport-basketball-strong` tone (5.18:1 with white) instead of the
 * base tone (3.88:1), which is kept for non-text marks.
 */
export const SPORT_BADGE_CLASS: Record<string, string> = {
  basketball: "!bg-sport-basketball-strong !text-white",
  soccer: "!bg-sport-football !text-white",
  flag_football: "!bg-sport-tocho !text-white",
  volleyball: "!bg-sport-volleyball !text-brand-primary",
};

export const SPORT_DOT_CLASS: Record<string, string> = {
  basketball: "bg-sport-basketball",
  soccer: "bg-sport-football",
  flag_football: "bg-sport-tocho",
  volleyball: "bg-sport-volleyball",
};

/**
 * Solid sport-colored full-width CTA buttons (event card "Ver detalles").
 * Text color is chosen per-sport for WCAG AA: white passes on soccer/tocho
 * (contrast ~6:1) and on basketball's `-strong` tone (5.18:1); volleyball's gold
 * is too light for white text (~1.9:1) so it uses dark brand-primary text
 * instead (~6:1). Basketball's hover darkens (brightness) rather than fading to
 * /90, because fading toward white would drop it below 4.5:1.
 */
export const SPORT_CTA_CLASS: Record<string, string> = {
  basketball: "bg-sport-basketball-strong text-white hover:brightness-95",
  soccer: "bg-sport-football text-white hover:bg-sport-football/90",
  flag_football: "bg-sport-tocho text-white hover:bg-sport-tocho/90",
  volleyball: "bg-sport-volleyball text-brand-primary hover:bg-sport-volleyball/90",
};

/**
 * Soft tinted-outline CTA (ficha card "Ver perfil"). Same safe pattern as
 * SPORT_BADGE_CLASS — tinted background + border, dark text — so it stays
 * AA-compliant while still reading as sport-colored, unlike a solid fill.
 */
export const SPORT_SOFT_BUTTON_CLASS: Record<string, string> = {
  basketball: "border border-sport-basketball/40 bg-sport-basketball/15 text-brand-primary hover:bg-sport-basketball/25",
  soccer: "border border-sport-football/40 bg-sport-football/15 text-brand-primary hover:bg-sport-football/25",
  flag_football: "border border-sport-tocho/40 bg-sport-tocho/15 text-brand-primary hover:bg-sport-tocho/25",
  volleyball: "border border-sport-volleyball/40 bg-sport-volleyball/15 text-brand-primary hover:bg-sport-volleyball/25",
};
