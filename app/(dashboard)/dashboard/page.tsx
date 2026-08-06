import Link from "next/link";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon, type IconName } from "@/components/Icon";
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

// Scoped to this screen only — not routed through components/Button.tsx,
// so Login/Register/Profile/Events keep Button's current appearance untouched.
const ctaClassName =
  "inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function Dashboard({ searchParams }: Props) {
  const session = await verifySession();
  const { q } = await searchParams;

  const [openEvents, recentEvents] = await Promise.all([
    prisma.event.count({ where: { status: "open" } }),
    prisma.event.findMany({
      where: {
        status: "open",
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
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-primary">Panel principal</h1>
        <p className="text-brand-primary/70">Resumen rápido de actividad y oportunidades.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                <Icon name={metric.icon} size={24} />
              </span>
              <div>
                <p className="text-sm text-brand-primary/70">{metric.label}</p>
                <p className="text-3xl font-bold text-brand-primary">{metric.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-primary">
          <Icon name="calendar" size={20} className="text-brand-secondary" />
          Eventos recientes
        </h2>
        {recentEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Icon name="calendar" size={32} className="text-brand-primary/30" />
            <p className="text-sm text-brand-primary/60">No hay eventos disponibles aún.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEvents.map((event) => {
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
                        className={`${ctaClassName} ${SPORT_CTA_CLASS[event.sport] ?? "bg-brand-primary text-white hover:bg-brand-primary/90"}`}
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
          </div>
        )}
      </section>
    </div>
  );
}
