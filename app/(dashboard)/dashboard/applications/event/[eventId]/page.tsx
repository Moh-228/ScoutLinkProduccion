import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Badge } from "@/components/Badge";
import { buttonClassNames } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS } from "@/lib/sport-colors";
import { AffinitySortToggle } from "../../_components/AffinitySortToggle";

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

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(d));
}

function AffinityBadge({ pct }: { pct: number }) {
  const color =
    pct >= 70 ? "text-emerald-800 border-emerald-300 bg-emerald-100"
    : pct >= 40 ? "text-amber-800 border-amber-300 bg-amber-100"
    : "text-brand-primary/70 border-brand-border bg-brand-background";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 font-display text-base font-extrabold ${color}`}>
      {pct}%
    </span>
  );
}

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ sort?: string }>;
};

/** Event detail + applicants, for the event's coach and for admins. */
export default async function EventApplicationsPage({ params, searchParams }: Props) {
  const session = await verifySession();
  if (!session) redirect("/auth/login");
  if (session.role === "student") redirect("/dashboard/applications");

  const { eventId } = await params;
  const { sort } = await searchParams;
  const sortByAffinity = sort === "affinity";
  const isAdmin = session.role === "admin";

  const event = await prisma.event.findFirst({
    where: { id: eventId, ...(isAdmin ? {} : { coachId: session.userId }) },
    include: {
      coach: { select: { coachProfile: { select: { displayName: true } } } },
      applications: {
        include: { student: { select: { studentProfile: { select: { fullName: true } } } } },
        orderBy: sortByAffinity ? { affinityPercent: "desc" } : { createdAt: "desc" },
      },
    },
  });
  if (!event) notFound();

  const backHref = isAdmin ? "/dashboard/admin/eventos" : "/dashboard/applications";
  const csvHref = isAdmin
    ? `/api/admin/events/${event.id}/applicants/csv`
    : `/api/coach/applications/csv?eventId=${event.id}`;
  const counts = STATUS_KEYS.map((key) => ({
    key,
    total: event.applications.filter((a) => a.status === key).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <>
            <Link
              href={backHref}
              aria-label="Volver"
              title="Volver"
              className="inline-flex items-center gap-1 rounded text-sm font-medium text-brand-primary/70 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
            >
              <Icon name="arrow" size={16} className="rotate-180" />
              Volver
            </Link>
            <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
            <Badge variant="neutral" className={SPORT_BADGE_CLASS[event.sport]}>
              {SPORT_LABELS[event.sport] ?? event.sport}
            </Badge>
            <Badge variant={event.status === "open" ? "success" : "danger"}>
              {event.status === "open" ? "Abierto" : "Cerrado"}
            </Badge>
          </>
        }
        title={event.title}
        description={`${event.coach.coachProfile?.displayName ?? "—"} · ${fmt(event.startAt)}${event.locationText ? ` · ${event.locationText}` : ""}`}
        actions={
          <>
            {event.type === "recruitment" && <AffinitySortToggle active={sortByAffinity} />}
            <a href={csvHref} className={buttonClassNames("secondary", "gap-2", "sm")}>
              <Icon name="add_link" size={14} />
              Descargar CSV
            </a>
            <Link href={`/dashboard/events/${event.id}`} className={buttonClassNames("secondary", "gap-2", "sm")}>
              Ver evento
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(({ key, total }) => (
          <div key={key} className="rounded-lg border border-brand-border/50 bg-brand-background p-3 text-center">
            <p className="font-display text-xl font-bold text-brand-primary">{total}</p>
            <p className="text-xs font-medium text-brand-primary/70">{STATUS_LABELS[key]}</p>
          </div>
        ))}
      </div>

      <Card className="w-full">
        <CardContent>
          {event.applications.length === 0 ? (
            <EmptyState size="compact" icon="person_check" title="Sin postulaciones." />
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Postulantes</p>
              {event.applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications/${app.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
                >
                  <span className="text-brand-primary">{app.student.studentProfile?.fullName ?? "Estudiante"}</span>
                  <div className="flex items-center gap-2">
                    {event.type === "recruitment" && app.affinityPercent > 0 && (
                      <AffinityBadge pct={app.affinityPercent} />
                    )}
                    <ApplicationStatusBadge status={app.status} inLink />
                    <span className={buttonClassNames("secondary", "", "sm")}>Gestionar</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
