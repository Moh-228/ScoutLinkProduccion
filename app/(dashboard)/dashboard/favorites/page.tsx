import Link from "next/link";
import { redirect } from "next/navigation";
import type { Sport } from "@prisma/client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Card, CardDescription, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { studentMatchesSportOrPosition, textMatches } from "@/lib/ficha-search";
import { prisma } from "@/lib/prisma";
import { findEventIds } from "@/lib/search";
import { SPORT_BADGE_CLASS, SPORT_DOT_CLASS, SPORT_SOFT_BUTTON_CLASS } from "@/lib/sport-colors";

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
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

  const matchingEventIds = q ? await findEventIds(q, ["title", "locationText"]) : null;
  const visibleEventIds = matchingEventIds ? eventIds.filter((id) => matchingEventIds.includes(id)) : eventIds;

  const [events, fichasRaw] = await Promise.all([
    visibleEventIds.length > 0
      ? prisma.event.findMany({
          where: { id: { in: visibleEventIds } },
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
                  select: { fullName: true, school: true, gender: true, favoriteSport: true, photoUrl: true },
                },
                // Only needed to match `q` against sport/position.
                ...(q ? { specializedCards: { select: { sport: true, data: true } } } : {}),
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // Favorite athlete cards search by name, school, sport or position, same as
  // the Fichas page.
  const fichas = q
    ? fichasRaw.filter((card) =>
        textMatches(q, [card.student.studentProfile?.fullName, card.student.studentProfile?.school]) ||
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
      <PageHeader title="Favoritos" description="Eventos y fichas que marcaste como favoritos." />

      {!hasAny ? (
        <EmptyState title={q ? "No hay favoritos que coincidan con tu búsqueda." : "No tienes favoritos aún."} icon="star" />
      ) : (
        <>
          {events.length > 0 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-primary">
                <Icon name="calendar" size={20} className="text-brand-secondary" />
                Eventos
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    action={<FavoriteButton targetType="event" targetId={event.id} isFavorited={true} />}
                  />
                ))}
              </div>
            </section>
          )}

          {fichas.length > 0 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-primary">
                <Icon name="id_card" size={20} className="text-brand-secondary" />
                Fichas de deportistas
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {fichas.map((card) => {
                  const profile = card.student.studentProfile;
                  const favSport = profile?.favoriteSport;
                  const fullName = profile?.fullName ?? "Jugador";
                  return (
                    <Card key={card.id} className="relative gap-4 overflow-hidden pt-6">
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 top-0 h-1.5 ${favSport ? SPORT_DOT_CLASS[favSport] : "bg-brand-border"}`}
                      />
                      <div className="flex items-start justify-between gap-2">
                        <Avatar photoKey={profile?.photoUrl} name={fullName} size={56} />
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
                            <span className="text-brand-primary/70">Estatura</span>
                            <span className="font-semibold text-brand-primary">{card.heightCm} cm</span>
                          </div>
                        )}
                        {card.weightKg && (
                          <div className="flex items-center justify-between">
                            <span className="text-brand-primary/70">Peso</span>
                            <span className="font-semibold text-brand-primary">{card.weightKg} kg</span>
                          </div>
                        )}
                        {profile?.gender && (
                          <div className="flex items-center justify-between">
                            <span className="text-brand-primary/70">Género</span>
                            <span className="font-semibold text-brand-primary">{profile.gender}</span>
                          </div>
                        )}
                        {card.experienceLevel && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-brand-primary/70">Nivel</span>
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
