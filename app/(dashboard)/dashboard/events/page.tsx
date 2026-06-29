import Link from "next/link";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
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

const TYPE_LABELS: Record<string, string> = {
  tournament: "Torneo",
  training: "Entrenamiento",
  recruitment: "Reclutamiento",
};

type Props = { searchParams: Promise<{ sport?: string; type?: string }> };

export default async function EventsPage({ searchParams }: Props) {
  const session = await verifySession();
  const canCreate = session?.role === "coach" || session?.role === "admin";
  const { sport, type } = await searchParams;

  const events = await prisma.event.findMany({
    where: {
      ...(sport && sport !== "all" ? { sport: sport as never } : {}),
      ...(type && type !== "all" ? { type: type as never } : {}),
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
          <h1 className="text-2xl font-bold text-white">Eventos</h1>
          <p className="text-white/60">Explora convocatorias y jornadas de scouting disponibles.</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/events/new">
            <Button>+ Crear evento</Button>
          </Link>
        )}
      </header>

      {/* Filtros via form GET */}
      <Card>
        <CardContent className="mt-0 pt-4">
          <form method="GET" className="grid gap-3 md:grid-cols-3">
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
            <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
              <span>Tipo</span>
              <select name="type" defaultValue={type ?? "all"} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none">
                <option value="all">Todos</option>
                <option value="tournament">Torneo</option>
                <option value="recruitment">Reclutamiento</option>
                <option value="training">Entrenamiento</option>
              </select>
            </label>
            <div className="flex items-end">
              <Button type="submit" variant="secondary" className="w-full">Filtrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {events.length === 0 ? (
        <p className="text-center text-white/40 py-12">No hay eventos disponibles.</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
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
              <CardContent className="space-y-3">
                {event.locationText && (
                  <p className="text-sm text-white/60">{event.locationText}</p>
                )}
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/events/${event.id}`}>
                    <Button variant="secondary">Ver detalle</Button>
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
          ))}
        </section>
      )}
    </div>
  );
}
