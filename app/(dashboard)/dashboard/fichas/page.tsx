import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

type Props = { searchParams: Promise<{ sport?: string }> };

export default async function FichasPage({ searchParams }: Props) {
  const session = await verifySession();
  const { sport } = await searchParams;

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
            select: { fullName: true, school: true, gender: true, favoriteSport: true },
          },
        },
      },
    },
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
      <header>
        <h1 className="text-2xl font-bold text-white">Fichas de deportistas</h1>
        <p className="text-white/60">Directorio de fichas públicas con filtros.</p>
      </header>

      <Card>
        <CardContent className="mt-0 pt-4">
          <form method="GET" className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
              <span>Deporte</span>
              <select name="sport" defaultValue={sport ?? "all"} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none">
                <option value="all">Todos</option>
                <option value="basketball">Básquetbol</option>
                <option value="soccer">Fútbol</option>
                <option value="flag_football">Flag Football</option>
                <option value="volleyball">Voleibol</option>
              </select>
            </label>
            <div className="flex items-end">
              <button type="submit" className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
                Filtrar
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {cards.length === 0 ? (
        <p className="text-center text-white/40 py-12">No hay fichas públicas disponibles.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => {
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
                  {/* Only coaches/admins see full contact info */}
                  {(session?.role === "coach" || session?.role === "admin") && card.phone && (
                    <p>Tel: {card.phone}</p>
                  )}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/dashboard/fichas/${card.id}`}
                      className="inline-block rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
                    >
                      Ver detalles →
                    </Link>
                    {session && (
                      <FavoriteButton
                        targetType="ficha"
                        targetId={card.id}
                        isFavorited={favoritedIds.has(card.id)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
