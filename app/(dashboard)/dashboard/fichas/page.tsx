import Link from "next/link";
import type { Sport } from "@prisma/client";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Card, CardDescription, CardTitle } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { verifySession } from "@/lib/auth";
import { studentMatchesSportOrPosition } from "@/lib/ficha-search";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS, SPORT_SOFT_BUTTON_CLASS } from "@/lib/sport-colors";

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
          // Only needed to match `q` against sport/position — not fetched
          // when there's nothing to search.
          ...(q ? { specializedCards: { select: { sport: true, data: true } } } : {}),
        },
      },
    },
  });

  // Search box intentionally searches sport + playing position, not the
  // athlete's name (see Topbar placeholder for this page).
  const visibleCards = q
    ? cards.filter((card) =>
        studentMatchesSportOrPosition(
          q,
          card.student.studentProfile?.favoriteSport,
          (card.student as { specializedCards?: { sport: Sport; data: unknown }[] }).specializedCards ?? [],
        ),
      )
    : cards;

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
      <header>
        <h1 className="text-xl font-bold text-brand-primary">Fichas de deportistas</h1>
        <p className="text-brand-primary/70">Directorio de fichas públicas con filtros.</p>
      </header>

      {visibleCards.length === 0 ? (
        <p className="text-center text-brand-primary/50 py-12">No hay fichas públicas disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleCards.map((card) => {
            const profile = card.student.studentProfile;
            const favSport = profile?.favoriteSport;
            const fullName = profile?.fullName ?? "Jugador";
            return (
              <Card key={card.id} className="gap-4">
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
                  {/* Only coaches/admins see full contact info */}
                  {(session?.role === "coach" || session?.role === "admin") && card.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-brand-primary/50">Tel</span>
                      <span className="font-semibold text-brand-primary">{card.phone}</span>
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
      )}
    </div>
  );
}
