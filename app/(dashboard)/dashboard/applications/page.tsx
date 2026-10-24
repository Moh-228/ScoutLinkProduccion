import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findEventIds, findUserIds } from "@/lib/search";

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(d));
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  const { q } = await searchParams;

  // Students see their own applications; coaches see applications to their events
  if (session.role === "student") {
    const titleIds = q ? await findEventIds(q, ["title"]) : null;
    const applications = await prisma.eventApplication.findMany({
      where: {
        studentId: session.userId,
        ...(titleIds ? { eventId: { in: titleIds } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { event: { select: { id: true, title: true, type: true, startAt: true } } },
    });

    return (
      <div className="space-y-6">
        <PageHeader title="Mis postulaciones" description="Seguimiento de estados en tus solicitudes." />
        {applications.length === 0 ? (
          <EmptyState title="No tienes postulaciones aún." icon="person_check" />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id} className="mx-auto w-full max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      href={`/dashboard/events/${app.event.id}`}
                      className="rounded hover:text-brand-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
                    >
                      {app.event.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm text-brand-primary/70">
                    <Icon name="calendar" size={16} className="shrink-0 text-brand-primary/40" />
                    Inicio: {fmt(app.event.startAt)}
                  </p>
                  <ApplicationStatusBadge status={app.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Coach: see applicants per event
  const titleIds = q ? await findEventIds(q, ["title"]) : [];
  const applicantIds = q ? await findUserIds(q, ["fullName"]) : [];
  const events = await prisma.event.findMany({
    where: {
      coachId: session.userId,
      ...(q
        ? {
            OR: [
              { id: { in: titleIds } },
              { applications: { some: { studentId: { in: applicantIds } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      applications: { select: { status: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postulaciones a mis eventos"
        description="Gestiona los candidatos de cada evento."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a href="/api/coach/applications/csv" className={buttonClassNames("secondary", "gap-2", "sm")}>
              <Icon name="add_link" size={14} />
              Descargar CSV de todos
            </a>
          </div>
        }
      />
      {events.length === 0 ? (
        <EmptyState title="No has creado eventos aún." icon="calendar" />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="mx-auto w-full max-w-2xl">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle>
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="rounded hover:text-brand-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
                    >
                      {event.title}
                    </Link>
                  </CardTitle>
                  <a
                    href={`/api/coach/applications/csv?eventId=${event.id}`}
                    className={buttonClassNames("secondary", "gap-2", "sm")}
                  >
                    <Icon name="add_link" size={14} />
                    Descargar CSV
                  </a>
                </div>
              </CardHeader>
              {event.applications.length > 0 && (
                <div className="-mt-2 flex flex-wrap gap-3 text-xs text-brand-primary/70">
                  <span>Postulado: <strong className="text-brand-primary">{event.applications.filter((a) => a.status === "postulado").length}</strong></span>
                  <span>Preseleccionado: <strong className="text-brand-primary">{event.applications.filter((a) => a.status === "preseleccionado").length}</strong></span>
                  <span>Invitado: <strong className="text-brand-primary">{event.applications.filter((a) => a.status === "aceptado").length}</strong></span>
                  <span>Descartado: <strong className="text-brand-primary">{event.applications.filter((a) => a.status === "rechazado").length}</strong></span>
                </div>
              )}
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-brand-primary/70">
                  {event.applications.length === 0
                    ? "Sin postulaciones."
                    : `${event.applications.length} ${event.applications.length === 1 ? "postulación" : "postulaciones"}`}
                </p>
                <Link href={`/dashboard/applications/event/${event.id}`} className={buttonClassNames("secondary", "", "sm")}>
                  Ver detalles
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
