import Link from "next/link";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS, SPORT_CTA_CLASS } from "@/lib/sport-colors";

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

const DAY_LABELS: Record<string, string> = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié",
  jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

type Props = { searchParams: Promise<{ sport?: string; type?: string; q?: string }> };

export default async function EventsPage({ searchParams }: Props) {
  const session = await verifySession();
  const canCreate = session?.role === "coach" || session?.role === "admin";
  const { sport, type, q } = await searchParams;

  const events = await prisma.event.findMany({
    where: {
      ...(sport && sport !== "all" ? { sport: sport as never } : {}),
      ...(type && type !== "all" ? { type: type as never } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { shortDescription: { contains: q, mode: "insensitive" } },
              { longDescription: { contains: q, mode: "insensitive" } },
              { locationText: { contains: q, mode: "insensitive" } },
              { coach: { coachProfile: { displayName: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      coach: { select: { coachProfile: { select: { displayName: true } } } },
    },
  });

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
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Eventos</h1>
          <p className="text-brand-primary/70">Explora convocatorias y jornadas de scouting disponibles.</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/events/new">
            <Button>+ Crear evento</Button>
          </Link>
        )}
      </header>

      {events.length === 0 ? (
        <p className="text-center text-brand-primary/50 py-12">No hay eventos disponibles.</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const req = (event.requirements ?? {}) as Record<string, unknown>;
            const scheduleDays = Array.isArray(req.scheduleDays) ? (req.scheduleDays as string[]) : [];
            const isTraining = event.type === "training";

            return (
              <Card key={event.id}>
                <CardHeader>
                  <div className="mb-1 flex items-center justify-between gap-1.5">
                    <Badge variant="neutral" className={SPORT_BADGE_CLASS[event.sport]}>
                      {SPORT_LABELS[event.sport] ?? event.sport}
                    </Badge>
                    {event.type === "tournament" ? (
                      <Badge variant="info">Torneo</Badge>
                    ) : (
                      <Badge variant={event.status === "open" ? "success" : "danger"}>
                        {event.status === "open" ? "Abierto" : "Cerrado"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.coach.coachProfile?.displayName ?? "—"}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  {(isTraining ? scheduleDays.length > 0 : !!event.startAt) || event.locationText ? (
                    <div className="space-y-1.5 text-sm text-brand-primary/70">
                      {isTraining ? (
                        scheduleDays.length > 0 && (
                          <p className="flex items-center gap-2">
                            <Icon name="calendar" size={16} className="shrink-0 text-brand-primary/40" />
                            {scheduleDays.map((d) => DAY_LABELS[d] ?? d).join(" • ")}
                          </p>
                        )
                      ) : (
                        event.startAt && (
                          <p className="flex items-center gap-2">
                            <Icon name="calendar" size={16} className="shrink-0 text-brand-primary/40" />
                            {new Date(event.startAt).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )
                      )}
                      {event.locationText && (
                        <p className="flex items-center gap-2">
                          <Icon name="location_on" size={16} className="shrink-0 text-brand-primary/40" />
                          {event.locationText}
                        </p>
                      )}
                    </div>
                  ) : null}
                  {event.shortDescription && (
                    <p className="text-sm text-brand-primary/70 line-clamp-2">{event.shortDescription}</p>
                  )}
                  <div className="mt-auto flex items-center gap-2">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction ${SPORT_CTA_CLASS[event.sport] ?? "bg-brand-primary text-white hover:bg-brand-primary/90"}`}
                    >
                      Ver detalles
                    </Link>
                    {session && (
                      <FavoriteButton
                        targetType="event"
                        targetId={event.id}
                        isFavorited={favoritedIds.has(event.id)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
