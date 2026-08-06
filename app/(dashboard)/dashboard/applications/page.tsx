import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AffinitySortToggle } from "./_components/AffinitySortToggle";

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(d));
}

function AffinityBadge({ pct }: { pct: number }) {
  const color =
    pct >= 70 ? "text-emerald-800 border-emerald-200 bg-emerald-100"
    : pct >= 40 ? "text-amber-800 border-amber-200 bg-amber-100"
    : "text-brand-primary/50 border-brand-border bg-brand-background";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${color}`}>
      {pct}% afinidad
    </span>
  );
}

type Props = { searchParams: Promise<{ sort?: string; q?: string }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  const { sort, q } = await searchParams;
  const sortByAffinity = sort === "affinity";

  // Students see their own applications; coaches see applications to their events
  if (session.role === "student") {
    const applications = await prisma.eventApplication.findMany({
      where: {
        studentId: session.userId,
        ...(q ? { event: { title: { contains: q, mode: "insensitive" } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { event: { select: { id: true, title: true, type: true, startAt: true } } },
    });

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-xl font-bold text-brand-primary">Mis postulaciones</h1>
          <p className="text-brand-primary/70">Seguimiento de estados en tus solicitudes.</p>
        </header>
        {applications.length === 0 ? (
          <p className="text-center text-brand-primary/50 py-12">No tienes postulaciones aún.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id} className="mx-auto w-full max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link href={`/dashboard/events/${app.event.id}`} className="hover:underline">
                      {app.event.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <p className="text-sm text-brand-primary/70">Inicio: {fmt(app.event.startAt)}</p>
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
  const events = await prisma.event.findMany({
    where: {
      coachId: session.userId,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              {
                applications: {
                  some: { student: { studentProfile: { fullName: { contains: q, mode: "insensitive" } } } },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        include: {
          student: { select: { studentProfile: { select: { fullName: true } } } },
        },
        orderBy: sortByAffinity
          ? { affinityPercent: "desc" }
          : { createdAt: "desc" },
      },
    },
  });

  const hasRecruitmentEvents = events.some((e) => e.type === "recruitment");

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Postulaciones a mis eventos</h1>
          <p className="text-brand-primary/70">Gestiona los candidatos de cada evento.</p>
        </div>
        {hasRecruitmentEvents && <AffinitySortToggle active={sortByAffinity} />}
      </header>
      {events.length === 0 ? (
        <p className="text-center text-brand-primary/50 py-12">No has creado eventos aún.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="mx-auto w-full max-w-2xl">
              <CardHeader>
                <CardTitle>
                  <Link href={`/dashboard/events/${event.id}`} className="hover:underline">
                    {event.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.applications.length === 0 ? (
                  <p className="text-sm text-brand-primary/50">Sin postulaciones.</p>
                ) : (
                  <div className="space-y-2">
                    {event.applications.map((app) => (
                      <Link
                        key={app.id}
                        href={`/dashboard/applications/${app.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-brand-background"
                      >
                        <span className="text-brand-primary">
                          {app.student.studentProfile?.fullName ?? "Estudiante"}
                        </span>
                        <div className="flex items-center gap-2">
                          {event.type === "recruitment" && app.affinityPercent > 0 && (
                            <AffinityBadge pct={app.affinityPercent} />
                          )}
                          <ApplicationStatusBadge status={app.status} />
                          <span className={buttonClassNames("secondary", "px-3 py-1 text-xs")}>Gestionar</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
