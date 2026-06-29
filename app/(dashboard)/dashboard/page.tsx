import Link from "next/link";

import { buttonClassNames } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
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

export default async function Dashboard() {
  const session = await verifySession();

  const [openEvents, recentEvents] = await Promise.all([
    prisma.event.count({ where: { status: "open" } }),
    prisma.event.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        coach: { select: { coachProfile: { select: { displayName: true } } } },
      },
    }),
  ]);

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

  const metrics =
    session?.role === "student"
      ? [
          { label: "Eventos abiertos", value: openEvents },
          { label: "Mis postulaciones", value: myApplications },
        ]
      : session?.role === "coach"
        ? [
            { label: "Eventos abiertos", value: openEvents },
            { label: "Mis eventos", value: myEvents },
          ]
        : [{ label: "Eventos abiertos", value: openEvents }];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Panel principal</h1>
        <p className="text-white/60">Resumen rápido de actividad y oportunidades.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Eventos recientes</h2>
        {recentEvents.length === 0 ? (
          <p className="text-white/40 text-sm">No hay eventos disponibles aún.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    {SPORT_LABELS[event.sport] ?? event.sport}
                    {event.coach.coachProfile ? ` · ${event.coach.coachProfile.displayName}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/dashboard/events/${event.id}`} className={buttonClassNames("secondary")}>
                    Ver detalle
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
