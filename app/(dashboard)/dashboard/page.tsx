import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EVENT_TEXT_FIELDS, findEventIds } from "@/lib/search";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function Dashboard({ searchParams }: Props) {
  const session = await verifySession();
  const { q } = await searchParams;

  const matchingIds = q ? await findEventIds(q, EVENT_TEXT_FIELDS) : null;

  const [openEvents, recentEvents] = await Promise.all([
    prisma.event.count({ where: { status: "open" } }),
    prisma.event.findMany({
      where: {
        status: "open",
        ...(matchingIds ? { id: { in: matchingIds } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        coach: { select: { coachProfile: { select: { displayName: true } } } },
      },
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

  let myApplications = 0;
  let myEvents = 0;

  if (session?.role === "student") {
    myApplications = await prisma.eventApplication.count({
      where: { studentId: session.userId },
    });
  }

  if (session?.role === "coach") {
    myEvents = await prisma.event.count({ where: { coachId: session.userId } });
  }

  const metrics: { label: string; value: number; icon: IconName }[] =
    session?.role === "student"
      ? [
          { label: "Eventos abiertos", value: openEvents, icon: "calendar" },
          { label: "Mis postulaciones", value: myApplications, icon: "id_card" },
        ]
      : session?.role === "coach"
        ? [
            { label: "Eventos abiertos", value: openEvents, icon: "calendar" },
            { label: "Mis eventos", value: myEvents, icon: "star" },
          ]
        : [{ label: "Eventos abiertos", value: openEvents, icon: "calendar" }];

  return (
    <div className="space-y-8">
      <PageHeader title="Panel principal" description="Resumen rápido de actividad y oportunidades." />

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                <Icon name={metric.icon} size={24} />
              </span>
              <div>
                <p className="text-sm text-brand-primary/70">{metric.label}</p>
                <p className="font-display text-3xl font-bold text-brand-primary">{metric.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-primary">
          <Icon name="calendar" size={20} className="text-brand-secondary" />
          Eventos recientes
        </h2>
        {recentEvents.length === 0 ? (
          <EmptyState title="No hay eventos disponibles aún." icon="calendar" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEvents.map((event) => (
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
          </div>
        )}
      </section>
    </div>
  );
}
