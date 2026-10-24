import { prisma } from "@/lib/prisma";
import { findUserIds } from "@/lib/search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { VerificationsList } from "./_components/VerificationsList";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const { q, page: pageRaw } = await searchParams;
  const page = parsePage(pageRaw);
  const coachIds = q ? await findUserIds(q, ["displayName", "email"]) : null;
  const where = coachIds ? { coachId: { in: coachIds } } : {};

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
      <PageHeader
        title="Panel de Administrador"
        description="Métricas, verificaciones y moderación."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <p className="font-display text-3xl font-bold text-brand-primary">{item.value}</p>
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
