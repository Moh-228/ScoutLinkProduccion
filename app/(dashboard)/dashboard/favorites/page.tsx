import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_LABELS: Record<string, string> = {
  tournament: "Torneo",
  training: "Entrenamiento",
  recruitment: "Reclutamiento",
};

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

export default async function FavoritesPage() {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  // Fetch all favorites for this user (both types) in one query
  const allFavorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const eventIds = allFavorites.filter((f) => f.targetType === "event").map((f) => f.targetId);
  const fichaIds = allFavorites.filter((f) => f.targetType === "ficha").map((f) => f.targetId);

  const [events, fichas] = await Promise.all([
    eventIds.length > 0
      ? prisma.event.findMany({
          where: { id: { in: eventIds } },
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
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const hasAny = events.length > 0 || fichas.length > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Favoritos</h1>
        <p className="text-white/60">Eventos y fichas que marcaste como favoritos.</p>
      </header>

      {!hasAny ? (
        <p className="text-center text-white/40 py-12">No tienes favoritos aún.</p>
      ) : (
        <>
          {events.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white/80">Eventos</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
                        <Badge variant={event.status === "open" ? "success" : "danger"}>
                          {event.status === "open" ? "Abierto" : "Cerrado"}
                        </Badge>
                      </div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        {SPORT_LABELS[event.sport] ?? event.sport}
                        {event.coach.coachProfile ? ` · ${event.coach.coachProfile.displayName}` : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="text-sm font-semibold text-[#1883ff] hover:underline"
                        >
                          Ver detalle
                        </Link>
                        <FavoriteButton targetType="event" targetId={event.id} isFavorited={true} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {fichas.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white/80">Fichas de deportistas</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {fichas.map((card) => {
                  const profile = card.student.studentProfile;
                  const favSport = profile?.favoriteSport;
                  return (
                    <Card key={card.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle>{profile?.fullName ?? "Jugador"}</CardTitle>
                          {favSport && (
                            <Badge variant="info">{SPORT_LABELS[favSport] ?? favSport}</Badge>
                          )}
                        </div>
                        <CardDescription>{profile?.school ?? "—"}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm text-white/70">
                        {profile?.gender && <p>Género: {profile.gender}</p>}
                        {card.experienceLevel && (
                          <p>Nivel: {EXP_LABELS[card.experienceLevel] ?? card.experienceLevel}</p>
                        )}
                        {(card.heightCm || card.weightKg) && (
                          <p>
                            {card.heightCm ? `${card.heightCm} cm` : ""}
                            {card.heightCm && card.weightKg ? " · " : ""}
                            {card.weightKg ? `${card.weightKg} kg` : ""}
                          </p>
                        )}
                        <div className="pt-2 flex items-center gap-2">
                          <Link
                            href={`/dashboard/fichas/${card.id}`}
                            className="text-sm font-semibold text-[#1883ff] hover:underline"
                          >
                            Ver ficha
                          </Link>
                          <FavoriteButton targetType="ficha" targetId={card.id} isFavorited={true} />
                        </div>
                      </CardContent>
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
