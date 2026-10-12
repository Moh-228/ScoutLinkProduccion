import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { UserRow } from "../_components/UserRow";

type Props = { searchParams: Promise<{ q?: string; pageCoaches?: string; pageStudents?: string }> };

const SELECT = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  onboardingCompleted: true,
  createdAt: true,
  studentProfile: { select: { fullName: true, photoUrl: true } },
  coachProfile: { select: { displayName: true, photoUrl: true } },
} as const;

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const { q, pageCoaches: pageCoachesRaw, pageStudents: pageStudentsRaw } = await searchParams;
  const pageCoaches = parsePage(pageCoachesRaw);
  const pageStudents = parsePage(pageStudentsRaw);

  const searchWhere = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { studentProfile: { fullName: { contains: q, mode: "insensitive" as const } } },
          { coachProfile: { displayName: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [coachCount, studentCount, coaches, students] = await Promise.all([
    prisma.user.count({ where: { role: "coach", ...searchWhere } }),
    prisma.user.count({ where: { role: "student", ...searchWhere } }),
    prisma.user.findMany({
      where: { role: "coach", ...searchWhere },
      orderBy: { createdAt: "desc" },
      select: SELECT,
      ...getPagination(pageCoaches),
    }),
    prisma.user.findMany({
      where: { role: "student", ...searchWhere },
      orderBy: { createdAt: "desc" },
      select: SELECT,
      ...getPagination(pageStudents),
    }),
  ]);

  const basePath = "/dashboard/admin/usuarios";
  const preservedParams = { q };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Activa, desactiva o elimina cuentas de deportistas y coaches."
      />

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Coaches ({coachCount})</CardTitle>
          <CardDescription>Entrenadores registrados en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {coaches.length === 0 ? (
            <EmptyState size="compact" icon="person" title="Sin coaches registrados." />
          ) : (
            coaches.map((u) => <UserRow key={u.id} user={u} />)
          )}
          <Pagination
            page={pageCoaches}
            totalPages={getTotalPages(coachCount)}
            basePath={basePath}
            searchParams={{ ...preservedParams, pageStudents: pageStudentsRaw }}
            paramName="pageCoaches"
          />
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Deportistas ({studentCount})</CardTitle>
          <CardDescription>Alumnos registrados en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {students.length === 0 ? (
            <EmptyState size="compact" icon="person" title="Sin deportistas registrados." />
          ) : (
            students.map((u) => <UserRow key={u.id} user={u} />)
          )}
          <Pagination
            page={pageStudents}
            totalPages={getTotalPages(studentCount)}
            basePath={basePath}
            searchParams={{ ...preservedParams, pageCoaches: pageCoachesRaw }}
            paramName="pageStudents"
          />
        </CardContent>
      </Card>
    </div>
  );
}
