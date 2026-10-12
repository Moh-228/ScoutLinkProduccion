import Link from "next/link";

import { buttonClassNames } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { verifySession } from "@/lib/auth";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ sport?: string; type?: string; q?: string; page?: string }> };

export default async function EventsPage({ searchParams }: Props) {
  const session = await verifySession();
  const canCreate = session?.role === "coach" || session?.role === "admin";
  const { sport, type, q, page: pageRaw } = await searchParams;
  const page = parsePage(pageRaw);

  const where = {
    ...(sport && sport !== "all" ? { sport: sport as never } : {}),
    ...(type && type !== "all" ? { type: type as never } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { shortDescription: { contains: q, mode: "insensitive" as const } },
            { longDescription: { contains: q, mode: "insensitive" as const } },
            { locationText: { contains: q, mode: "insensitive" as const } },
            { coach: { coachProfile: { displayName: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };

  const [totalEvents, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        coach: { select: { coachProfile: { select: { displayName: true } } } },
      },
      ...getPagination(page),
    }),
  ]);

  // Build a set of favorited event IDs for the current user
  const favoritedIds = new Set<string>();
  if (session) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.userId, targetType: "event" },
      select: { targetId: true },
    });
    favorites.forEach((f) => favoritedIds.add(f.targetId));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        description="Explora convocatorias y jornadas de scouting disponibles."
        actions={
          canCreate && (
            <Link href="/dashboard/events/new" className={buttonClassNames("primary")}>
              + Crear evento
            </Link>
          )
        }
      />

      {events.length === 0 ? (
        <EmptyState title="No hay eventos disponibles." icon="calendar" />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              action={
                session && (
                  <FavoriteButton
                    targetType="event"
                    targetId={event.id}
                    isFavorited={favoritedIds.has(event.id)}
                  />
                )
              }
            />
          ))}
        </section>
      )}

      <Pagination
        page={page}
        totalPages={getTotalPages(totalEvents)}
        basePath="/dashboard/events"
        searchParams={{ sport, type, q }}
      />
    </div>
  );
}
