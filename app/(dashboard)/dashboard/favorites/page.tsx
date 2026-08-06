import Link from "next/link";
import { redirect } from "next/navigation";
import type { Sport } from "@prisma/client";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { verifySession } from "@/lib/auth";
import { studentMatchesSportOrPosition } from "@/lib/ficha-search";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS, SPORT_CTA_CLASS, SPORT_SOFT_BUTTON_CLASS } from "@/lib/sport-colors";

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

const EXP_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const EXP_BADGE_VARIANT: Record<string, "neutral" | "info" | "warning"> = {
  beginner: "neutral",
  intermediate: "info",
  advanced: "warning",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function FavoritesPage({ searchParams }: Props) {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  const { q } = await searchParams;

  // Fetch all favorites for this user (both types) in one query
  const allFavorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const eventIds = allFavorites.filter((f) => f.targetType === "event").map((f) => f.targetId);
  const fichaIds = allFavorites.filter((f) => f.targetType === "ficha").map((f) => f.targetId);

  const [events, fichasRaw] = await Promise.all([
    eventIds.length > 0
      ? prisma.event.findMany({
          where: {
            id: { in: eventIds },
            ...(q
              ? {
                  OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { locationText: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          include: {
            coach: { select: { coachProfile: { select: { displayName: true } } } },
          },
        })
      : Promise.resolve([]),
    fichaIds.length > 0
      ? prisma.studentGeneralCard.findMany({
          where: { id: { in: fichaIds } },
          include: {
            student: {
              select: {
                studentProfile: {
                  select: { fullName: true, school: true, gender: true, favoriteSport: true },
                },
                // Only needed to match `q` against sport/position.
                ...(q ? { specializedCards: { select: { sport: true, data: true } } } : {}),
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // Favorite athlete cards search by sport/position, same as the Fichas page
  // — not by name.
  const fichas = q
    ? fichasRaw.filter((card) =>
        studentMatchesSportOrPosition(
          q,
          card.student.studentProfile?.favoriteSport,
          (card.student as { specializedCards?: { sport: Sport; data: unknown }[] }).specializedCards ?? [],
        ),
      )
    : fichasRaw;

  const hasAny = events.length > 0 || fichas.length > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold text-brand-primary">Favoritos</h1>
        <p className="text-brand-primary/70">Eventos y fichas que marcaste como favoritos.</p>
      </header>

      {!hasAny ? (
        <p className="text-center text-brand-primary/50 py-12">No tienes favoritos aún.</p>
      ) : (
        <>
          {events.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-brand-primary/70">Eventos</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                          <FavoriteButton targetType="event" targetId={event.id} isFavorited={true} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {fichas.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-brand-primary/70">Fichas de deportistas</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {fichas.map((card) => {
                  const profile = card.student.studentProfile;
                  const favSport = profile?.favoriteSport;
                  const fullName = profile?.fullName ?? "Jugador";
                  return (
                    <Card key={card.id} className="gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          aria-hidden="true"
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-base font-bold text-white"
                        >
                          {initials(fullName)}
                        </span>
                        <FavoriteButton targetType="ficha" targetId={card.id} isFavorited={true} />
                      </div>

                      {favSport && (
                        <Badge variant="neutral" className={`w-fit ${SPORT_BADGE_CLASS[favSport]}`}>
                          {SPORT_LABELS[favSport] ?? favSport}
                        </Badge>
                      )}

                      <div>
                        <CardTitle className="text-base">{fullName}</CardTitle>
                        <CardDescription>{profile?.school ?? "—"}</CardDescription>
                      </div>

                      <div className="space-y-1.5 text-sm">
                        {card.heightCm && (
                          <div className="flex items-center justify-between">
                            <span className="text-brand-primary/50">Estatura</span>
                            <span className="font-semibold text-brand-primary">{card.heightCm} cm</span>
                          </div>
                        )}
                        {card.weightKg && (
                          <div className="flex items-center justify-between">
                            <span className="text-brand-primary/50">Peso</span>
                            <span className="font-semibold text-brand-primary">{card.weightKg} kg</span>
                          </div>
                        )}
                        {profile?.gender && (
                          <div className="flex items-center justify-between">
                            <span className="text-brand-primary/50">Género</span>
                            <span className="font-semibold text-brand-primary">{profile.gender}</span>
                          </div>
                        )}
                        {card.experienceLevel && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-brand-primary/50">Nivel</span>
                            <Badge variant={EXP_BADGE_VARIANT[card.experienceLevel] ?? "neutral"}>
                              {EXP_LABELS[card.experienceLevel] ?? card.experienceLevel}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/dashboard/fichas/${card.id}`}
                        className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction ${favSport ? SPORT_SOFT_BUTTON_CLASS[favSport] : "border border-brand-border bg-brand-background text-brand-primary hover:bg-brand-border/20"}`}
                      >
                        Ver perfil
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
