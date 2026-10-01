import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { VerificationsList } from "./_components/VerificationsList";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const { q, page: pageRaw } = await searchParams;
  const page = parsePage(pageRaw);
  const where = q
    ? {
        OR: [
          { coach: { coachProfile: { displayName: { contains: q, mode: "insensitive" as const } } } },
          { coach: { email: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [userCount, activeEvents, closedEvents, pendingVerifCount, totalVerifications, verifications] = await Promise.all([
    prisma.user.count(),
    prisma.event.count({ where: { status: "open" } }),
    prisma.event.count({ where: { status: "closed" } }),
    prisma.coachVerification.count({ where: { status: "pending" } }),
    prisma.coachVerification.count({ where }),
    prisma.coachVerification.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        sport: true,
        status: true,
        documentUrl: true,
        rejectionReason: true,
        coach: { select: { id: true, email: true, coachProfile: { select: { displayName: true } } } },
      },
      ...getPagination(page),
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
        <h1 className="text-xl font-bold text-brand-primary">Panel de Administrador</h1>
        <p className="text-brand-primary/70">Métricas, verificaciones y moderación.</p>
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

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Solicitudes de verificación de entrenadores</CardTitle>
          <CardDescription>Aprueba o rechaza la verificación de coaches por deporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationsList verifications={verifications} />
          <Pagination
            page={page}
            totalPages={getTotalPages(totalVerifications)}
            basePath="/dashboard/admin"
            searchParams={{ q }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
