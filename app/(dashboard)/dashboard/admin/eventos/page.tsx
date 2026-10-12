import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Badge } from "@/components/Badge";
import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS, SPORT_DOT_CLASS } from "@/lib/sport-colors";
import { ReopenEventButton } from "./_components/ReopenEventButton";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

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
  const { q, page: pageRaw } = await searchParams;
  const page = parsePage(pageRaw);

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { coach: { coachProfile: { displayName: { contains: q, mode: "insensitive" as const } } } },
        ],
      }
    : {};

  const [totalEvents, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
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
      ...getPagination(page),
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convocatorias"
        description="Eventos registrados por todos los entrenadores, con estado y postulantes por categoría."
      />

      {events.length === 0 ? (
        <EmptyState title="No hay convocatorias registradas." icon="calendar" />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const counts = STATUS_KEYS.reduce(
              (acc, key) => ({ ...acc, [key]: event.applications.filter((a) => a.status === key).length }),
              {} as Record<(typeof STATUS_KEYS)[number], number>,
            );
            return (
              <Card key={event.id} className="relative mx-auto w-full max-w-3xl overflow-hidden pt-6">
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-1.5 ${SPORT_DOT_CLASS[event.sport] ?? "bg-brand-border"}`}
                />
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
                        <Link href={`/dashboard/events/${event.id}`} className="rounded hover:text-brand-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction">
                          {event.title}
                        </Link>
                      </CardTitle>
                      <p className="mt-1 text-sm text-brand-primary/70">
                        {event.coach.coachProfile?.displayName ?? "—"} · {fmt(event.startAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {event.status === "closed" && <ReopenEventButton eventId={event.id} />}
                      <a
                        href={`/api/admin/events/${event.id}/applicants/csv`}
                        className={buttonClassNames("secondary", "gap-2", "sm")}
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
                        <p className="font-display text-xl font-bold text-brand-primary">{counts[key]}</p>
                        <p className="text-xs font-medium text-brand-primary/70">{STATUS_LABELS[key]}</p>
                      </div>
                    ))}
                  </div>

                  {event.applications.length > 0 && (
                    <div className="space-y-1.5 border-t border-brand-border/50 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Postulantes</p>
                      {event.applications.map((app) => (
                        <Link
                          key={app.id}
                          href={`/dashboard/applications/${app.id}`}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
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
          <Pagination
            page={page}
            totalPages={getTotalPages(totalEvents)}
            basePath="/dashboard/admin/eventos"
            searchParams={{ q }}
          />
        </div>
      )}
    </div>
  );
}
