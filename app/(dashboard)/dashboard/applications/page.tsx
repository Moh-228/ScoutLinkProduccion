import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusMap = {
  postulado: { label: "Postulado", variant: "info" as const },
  preseleccionado: { label: "Preseleccionado", variant: "warning" as const },
  aceptado: { label: "Aceptado", variant: "success" as const },
  rechazado: { label: "Rechazado", variant: "danger" as const },
};

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(d));
}

export default async function ApplicationsPage() {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  // Students see their own applications; coaches see applications to their events
  if (session.role === "student") {
    const applications = await prisma.eventApplication.findMany({
      where: { studentId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { event: { select: { id: true, title: true, type: true, startAt: true } } },
    });

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-white">Mis postulaciones</h1>
          <p className="text-white/60">Seguimiento de estados en tus solicitudes.</p>
        </header>
        {applications.length === 0 ? (
          <p className="text-center text-white/40 py-12">No tienes postulaciones aún.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link href={`/dashboard/events/${app.event.id}`} className="hover:underline">
                      {app.event.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/60">Inicio: {fmt(app.event.startAt)}</p>
                  <Badge variant={statusMap[app.status].variant}>
                    {statusMap[app.status].label}
                  </Badge>
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
    where: { coachId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        include: {
          student: { select: { studentProfile: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Postulaciones a mis eventos</h1>
        <p className="text-white/60">Gestiona los candidatos de cada evento.</p>
      </header>
      {events.length === 0 ? (
        <p className="text-center text-white/40 py-12">No has creado eventos aún.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/dashboard/events/${event.id}`} className="hover:underline">
                    {event.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.applications.length === 0 ? (
                  <p className="text-sm text-white/40">Sin postulaciones.</p>
                ) : (
                  <div className="space-y-2">
                    {event.applications.map((app) => (
                      <Link
                        key={app.id}
                        href={`/dashboard/applications/${app.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/5"
                      >
                        <span className="text-white">
                          {app.student.studentProfile?.fullName ?? "Estudiante"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusMap[app.status].variant}>
                            {statusMap[app.status].label}
                          </Badge>
                          <span className="text-xs font-semibold text-[#1883ff]">Gestionar →</span>
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
