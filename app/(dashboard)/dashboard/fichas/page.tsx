import Link from "next/link";
import type { Sport } from "@prisma/client";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Card, CardDescription, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { studentMatchesSportOrPosition, textMatches } from "@/lib/ficha-search";
import { prisma } from "@/lib/prisma";
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

type Props = { searchParams: Promise<{ sport?: string; q?: string }> };

export default async function FichasPage({ searchParams }: Props) {
  const session = await verifySession();
  const { sport, q } = await searchParams;

  const cards = await prisma.studentGeneralCard.findMany({
    where: {
      isPublic: true,
      ...(sport && sport !== "all"
        ? { student: { studentProfile: { favoriteSport: sport as never } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          studentProfile: {
            select: { fullName: true, school: true, gender: true, favoriteSport: true, photoUrl: true },
          },
          // Sport of each specialized card (read-only) so every card can be
          // listed on its own; `data` is only needed to match `q` against
          // positions, so it's still fetched only when there's a search.
          specializedCards: {
            select: q ? { sport: true, data: true } : { sport: true },
            orderBy: { sport: "asc" },
          },
        },
      },
    },
  });

  // Search box matches the athlete's name or school, or their sport / playing position.
  const visibleCards = q
    ? cards.filter((card) =>
        textMatches(q, [card.student.studentProfile?.fullName, card.student.studentProfile?.school]) ||
        studentMatchesSportOrPosition(
          q,
          card.student.studentProfile?.favoriteSport,
          // `data` is selected whenever `q` is set (this branch), see the query above.
          card.student.specializedCards as { sport: Sport; data: unknown }[],
        ),
      )
    : cards;

  // One tile per existing specialized card (sport); students without any keep
  // their single general tile. With the sport filter active, only that sport's
  // tiles are shown. Purely presentational over the data fetched above.
  const tiles = visibleCards.flatMap((card) => {
    const sports = card.student.specializedCards
      .map((sc) => sc.sport as string)
      .filter((s) => !sport || sport === "all" || s === sport);
    return sports.length > 0
      ? sports.map((s) => ({ card, sport: s as string | null }))
      : [{ card, sport: null as string | null }];
  });

  // Build a set of favorited ficha IDs for the current user
  const favoritedIds = new Set<string>();
  if (session) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.userId, targetType: "ficha" },
      select: { targetId: true },
    });
    favorites.forEach((f) => favoritedIds.add(f.targetId));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Fichas de deportistas" description="Directorio de fichas públicas con filtros." />

      {visibleCards.length === 0 ? (
        <EmptyState title="No hay fichas públicas disponibles." icon="id_card" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map(({ card, sport: tileSport }) => {
            const profile = card.student.studentProfile;
            // Sport tiles show their own sport; the general tile keeps the favorite sport.
            const favSport = tileSport ?? profile?.favoriteSport;
            const fullName = profile?.fullName ?? "Jugador";
            const href = tileSport
              ? `/dashboard/fichas/${card.id}?deporte=${tileSport}`
              : `/dashboard/fichas/${card.id}`;
            return (
              <Card key={`${card.id}-${tileSport ?? "general"}`} className="relative gap-4 overflow-hidden pt-6">
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-1.5 ${favSport ? SPORT_DOT_CLASS[favSport] : "bg-brand-border"}`}
                />
                <div className="flex items-start justify-between gap-2">
                  <Avatar photoKey={profile?.photoUrl} name={fullName} size={56} />
                  {session && (
                    <FavoriteButton
                      targetType="ficha"
                      targetId={card.id}
                      isFavorited={favoritedIds.has(card.id)}
                    />
                  )}
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
                  {/* Only coaches/admins see full contact info */}
                  {(session?.role === "coach" || session?.role === "admin") && card.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-brand-primary/70">Tel</span>
                      <span className="font-semibold text-brand-primary">{card.phone}</span>
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
                  href={href}
                  className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction ${favSport ? SPORT_SOFT_BUTTON_CLASS[favSport] : "border border-brand-border bg-brand-background text-brand-primary hover:bg-brand-border/20"}`}
                >
                  Ver perfil
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
