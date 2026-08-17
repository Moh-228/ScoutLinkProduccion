import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Badge } from "@/components/Badge";
import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS } from "@/lib/sport-colors";
import { ReopenEventButton } from "./_components/ReopenEventButton";

type Props = { searchParams: Promise<{ q?: string }> };

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

const STATUS_KEYS = ["postulado", "preseleccionado", "aceptado", "rechazado"] as const;
const STATUS_LABELS: Record<(typeof STATUS_KEYS)[number], string> = {
  postulado: "Postulado",
  preseleccionado: "Preseleccionado",
  aceptado: "Invitado",
  rechazado: "Descartado",
};

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(d));
}

export default async function AdminEventsPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const events = await prisma.event.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { coach: { coachProfile: { displayName: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    include: {
      coach: { select: { coachProfile: { select: { displayName: true } } } },
      applications: {
        select: {
          id: true,
          status: true,
          student: { select: { studentProfile: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-brand-primary">Convocatorias</h1>
        <p className="text-brand-primary/70">
          Eventos registrados por todos los entrenadores, con estado y postulantes por categoría.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="text-center text-brand-primary/50 py-12">No hay convocatorias registradas.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const counts = STATUS_KEYS.reduce(
              (acc, key) => ({ ...acc, [key]: event.applications.filter((a) => a.status === key).length }),
              {} as Record<(typeof STATUS_KEYS)[number], number>,
            );
            return (
              <Card key={event.id} className="mx-auto w-full max-w-3xl">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-1.5 flex flex-wrap gap-2">
                        <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
                        <Badge variant="neutral" className={SPORT_BADGE_CLASS[event.sport]}>
                          {SPORT_LABELS[event.sport] ?? event.sport}
                        </Badge>
                        <Badge variant={event.status === "open" ? "success" : "danger"}>
                          {event.status === "open" ? "Abierto" : "Cerrado"}
                        </Badge>
                      </div>
                      <CardTitle>
                        <Link href={`/dashboard/events/${event.id}`} className="hover:underline">
                          {event.title}
                        </Link>
                      </CardTitle>
                      <p className="mt-1 text-sm text-brand-primary/70">
                        {event.coach.coachProfile?.displayName ?? "—"} · {fmt(event.startAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.status === "closed" && <ReopenEventButton eventId={event.id} />}
                      <a
                        href={`/api/admin/events/${event.id}/applicants/csv`}
                        className={buttonClassNames("secondary", "gap-2 px-3 py-1 text-xs")}
                      >
                        <Icon name="add_link" size={14} />
                        Descargar CSV
                      </a>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {STATUS_KEYS.map((key) => (
                      <div key={key} className="rounded-lg border border-brand-border/50 bg-brand-background p-3 text-center">
                        <p className="text-xl font-bold text-brand-primary">{counts[key]}</p>
                        <p className="text-xs font-medium text-brand-primary/60">{STATUS_LABELS[key]}</p>
                      </div>
                    ))}
                  </div>

                  {event.applications.length > 0 && (
                    <div className="space-y-1.5 border-t border-brand-border/50 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/50">Postulantes</p>
                      {event.applications.map((app) => (
                        <Link
                          key={app.id}
                          href={`/dashboard/applications/${app.id}`}
                          className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-brand-background"
                        >
                          <span className="text-brand-primary">{app.student.studentProfile?.fullName ?? "Estudiante"}</span>
                          <ApplicationStatusBadge status={app.status} />
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
