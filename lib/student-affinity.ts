import { prisma } from "@/lib/prisma";
import {
  computeAffinity,
  computeAffinityBreakdown,
  type AffinityBreakdown,
  type AffinityEventRequirements,
} from "@/lib/affinity";

type AffinityEventInput = {
  id: string;
  sport: string;
  type: string;
  status: string;
  requirements: unknown;
};

/**
 * Live affinity for a student, computed against a set of recruitment events.
 * Only open recruitment events where the student has a specialized card for the
 * event's sport get a value (the same requirement the apply route enforces).
 * Returns a map of eventId → percent.
 */
export async function getStudentAffinityByEvent(
  studentId: string,
  events: AffinityEventInput[],
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  const candidates = events.filter((e) => e.type === "recruitment" && e.status === "open");
  if (candidates.length === 0) return result;

  const [user, cards] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        studentProfile: { select: { gender: true } },
        generalCard: { select: { experienceLevel: true } },
      },
    }),
    prisma.studentSpecializedCard.findMany({
      where: { studentId },
      select: { sport: true, data: true },
    }),
  ]);

  const cardBySport = new Map<string, Record<string, unknown>>(
    cards.map((c) => [c.sport as string, (c.data ?? {}) as Record<string, unknown>]),
  );

  for (const event of candidates) {
    const specializedData = cardBySport.get(event.sport);
    if (!specializedData) continue;

    result.set(
      event.id,
      computeAffinity({
        sport: event.sport,
        requirements: (event.requirements ?? {}) as AffinityEventRequirements,
        studentProfile: user?.studentProfile ?? null,
        generalCard: user?.generalCard ?? null,
        specializedData,
      }),
    );
  }

  return result;
}

/**
 * Live affinity breakdown (percent + met/unmet criteria) for one event.
 * Returns null when the event is not an open recruitment event or the student
 * has no specialized card for its sport.
 */
export async function getStudentAffinityBreakdown(
  studentId: string,
  event: AffinityEventInput,
): Promise<AffinityBreakdown | null> {
  if (event.type !== "recruitment" || event.status !== "open") return null;

  const [user, card] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        studentProfile: { select: { gender: true } },
        generalCard: { select: { experienceLevel: true } },
      },
    }),
    prisma.studentSpecializedCard.findFirst({
      where: { studentId, sport: event.sport as never },
      select: { data: true },
    }),
  ]);

  if (!card) return null;

  return computeAffinityBreakdown({
    sport: event.sport,
    requirements: (event.requirements ?? {}) as AffinityEventRequirements,
    studentProfile: user?.studentProfile ?? null,
    generalCard: user?.generalCard ?? null,
    specializedData: (card.data ?? {}) as Record<string, unknown>,
  });
}
