import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Prisma's `contains` + `mode: "insensitive"` ignores case but not accents, so
// "jose" would not find "José". These helpers match inside PostgreSQL with
// `unaccent(lower(...))` on both sides and return the matching IDs, which the
// pages then combine with their other filters. Requires the `unaccent`
// extension (prisma/migrations/20261023120000_enable_unaccent).

export type EventSearchField = "title" | "shortDescription" | "longDescription" | "locationText" | "coachName";
export type UserSearchField = "email" | "fullName" | "displayName";

/** Every free-text field an event search covers. */
export const EVENT_TEXT_FIELDS: EventSearchField[] = [
  "title",
  "shortDescription",
  "longDescription",
  "locationText",
  "coachName",
];

const EVENT_COLUMNS: Record<EventSearchField, Prisma.Sql> = {
  title: Prisma.sql`e."title"`,
  shortDescription: Prisma.sql`e."shortDescription"`,
  longDescription: Prisma.sql`e."longDescription"`,
  locationText: Prisma.sql`e."locationText"`,
  coachName: Prisma.sql`cp."displayName"`,
};

const USER_COLUMNS: Record<UserSearchField, Prisma.Sql> = {
  email: Prisma.sql`u."email"`,
  fullName: Prisma.sql`sp."fullName"`,
  displayName: Prisma.sql`cp."displayName"`,
};

/** `%q%` with LIKE wildcards in the user's text escaped. */
function likePattern(q: string): string {
  return `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/** IDs of events where any of `fields` contains `q`, ignoring case and accents. */
export async function findEventIds(q: string, fields: EventSearchField[]): Promise<string[]> {
  const pattern = likePattern(q);
  const conditions = fields.map(
    (field) => Prisma.sql`unaccent(lower(COALESCE(${EVENT_COLUMNS[field]}, ''))) LIKE unaccent(lower(${pattern}))`,
  );
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT e."id"
    FROM "events" e
    LEFT JOIN "coach_profiles" cp ON cp."userId" = e."coachId"
    WHERE ${Prisma.join(conditions, " OR ")}
  `;
  return rows.map((row) => row.id);
}

/** IDs of users where any of `fields` contains `q`, ignoring case and accents. */
export async function findUserIds(q: string, fields: UserSearchField[]): Promise<string[]> {
  const pattern = likePattern(q);
  const conditions = fields.map(
    (field) => Prisma.sql`unaccent(lower(COALESCE(${USER_COLUMNS[field]}, ''))) LIKE unaccent(lower(${pattern}))`,
  );
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT u."id"
    FROM "users" u
    LEFT JOIN "student_profiles" sp ON sp."userId" = u."id"
    LEFT JOIN "coach_profiles" cp ON cp."userId" = u."id"
    WHERE ${Prisma.join(conditions, " OR ")}
  `;
  return rows.map((row) => row.id);
}
