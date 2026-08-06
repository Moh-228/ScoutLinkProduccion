import type { Sport } from "@prisma/client";
import { SPORT_CHARACTERISTICS } from "@/lib/sport-characteristics";

// Search-only aliases for matching a free-text query against a Sport enum
// value. Distinct from the display-label dictionaries already duplicated
// per-page (SPORT_LABELS) — this is for matching, not rendering.
const SPORT_SEARCH_ALIASES: Record<Sport, string[]> = {
  soccer: ["soccer", "futbol", "fútbol"],
  basketball: ["basketball", "basquetbol", "básquetbol", "basket"],
  volleyball: ["volleyball", "voleibol", "voley", "vóley"],
  flag_football: ["flag_football", "flag football", "tocho", "tocho bandera"],
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Sport enum values whose key or Spanish alias matches the query. */
export function matchSports(q: string): Sport[] {
  const needle = normalize(q);
  if (!needle) return [];
  return (Object.keys(SPORT_SEARCH_ALIASES) as Sport[]).filter((sport) =>
    SPORT_SEARCH_ALIASES[sport].some((alias) => alias.includes(needle) || needle.includes(alias)),
  );
}

// The position/role field is always the first characteristic entry for each
// sport (see lib/sport-characteristics.ts) — reused here rather than
// duplicating a new position taxonomy.
const POSITION_FIELD_KEY: Partial<Record<Sport, string>> = Object.fromEntries(
  (Object.keys(SPORT_CHARACTERISTICS) as Sport[]).map((sport) => [sport, SPORT_CHARACTERISTICS[sport][0]?.key]),
);

/** Per-sport list of position/role codes whose value or label matches the query. */
function matchPositionCodes(q: string): Partial<Record<Sport, string[]>> {
  const needle = normalize(q);
  if (!needle) return {};
  const result: Partial<Record<Sport, string[]>> = {};
  for (const sport of Object.keys(SPORT_CHARACTERISTICS) as Sport[]) {
    const field = SPORT_CHARACTERISTICS[sport][0];
    if (!field || field.type !== "select") continue;
    const codes = field.options
      .filter((o) => o.value && (o.value.toLowerCase() === needle || o.label.toLowerCase().includes(needle)))
      .map((o) => o.value);
    if (codes.length > 0) result[sport] = codes;
  }
  return result;
}

type SpecializedCardLike = { sport: Sport; data: unknown };

/**
 * Whether a student matches a "sport or playing position" search query,
 * using their favorite sport and their existing specialized-card data
 * (already fetched via Prisma include — no new business logic, no
 * additional query, no JSON deep-search).
 */
export function studentMatchesSportOrPosition(
  q: string,
  favoriteSport: Sport | null | undefined,
  specializedCards: SpecializedCardLike[],
): boolean {
  const needle = normalize(q);
  if (!needle) return true;

  const matchedSports = matchSports(q);
  if (favoriteSport && matchedSports.includes(favoriteSport)) return true;

  const positionMatches = matchPositionCodes(q);
  for (const card of specializedCards) {
    const codes = positionMatches[card.sport];
    const fieldKey = POSITION_FIELD_KEY[card.sport];
    if (!codes || !fieldKey) continue;
    const data = card.data as Record<string, unknown>;
    if (codes.includes(String(data[fieldKey] ?? ""))) return true;
  }

  return false;
}
