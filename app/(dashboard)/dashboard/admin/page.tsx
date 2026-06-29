import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { VerificationsList } from "./_components/VerificationsList";

export default async function AdminPage() {
  const [userCount, activeEvents, closedEvents, pendingVerifCount, verifications] = await Promise.all([
    prisma.user.count(),
    prisma.event.count({ where: { status: "open" } }),
    prisma.event.count({ where: { status: "closed" } }),
    prisma.coachVerification.count({ where: { status: "pending" } }),
    prisma.coachVerification.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        sport: true,
        status: true,
        documentUrl: true,
        rejectionReason: true,
        coach: { select: { id: true, email: true, coachProfile: { select: { displayName: true } } } },
      },
    }),
  ]);

  const stats = [
    { label: "Usuarios registrados", value: userCount.toString() },
    { label: "Eventos activos", value: activeEvents.toString() },
    { label: "Eventos cerrados", value: closedEvents.toString() },
    { label: "Verificaciones pendientes", value: pendingVerifCount.toString() },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Panel de Administrador</h1>
        <p className="text-slate-400">Métricas, verificaciones y moderación.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-3xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de verificación de entrenadores</CardTitle>
          <CardDescription>Aprueba o rechaza la verificación de coaches por deporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationsList verifications={verifications} />
        </CardContent>
      </Card>
    </div>
  );
}
