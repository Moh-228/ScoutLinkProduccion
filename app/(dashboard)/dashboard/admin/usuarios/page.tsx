import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { UserRow } from "../_components/UserRow";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      role: { not: "admin" },
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { studentProfile: { fullName: { contains: q, mode: "insensitive" } } },
              { coachProfile: { displayName: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      onboardingCompleted: true,
      createdAt: true,
      studentProfile: { select: { fullName: true, photoUrl: true } },
      coachProfile: { select: { displayName: true, photoUrl: true } },
    },
  });

  const students = users.filter((u) => u.role === "student");
  const coaches = users.filter((u) => u.role === "coach");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-brand-primary">Gestión de Usuarios</h1>
        <p className="text-brand-primary/70">Activa, desactiva o elimina cuentas de deportistas y coaches.</p>
      </header>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Coaches ({coaches.length})</CardTitle>
          <CardDescription>Entrenadores registrados en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {coaches.length === 0 ? (
            <p className="text-sm text-brand-primary/70">Sin coaches registrados.</p>
          ) : (
            coaches.map((u) => <UserRow key={u.id} user={u} />)
          )}
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Deportistas ({students.length})</CardTitle>
          <CardDescription>Alumnos registrados en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {students.length === 0 ? (
            <p className="text-sm text-brand-primary/70">Sin deportistas registrados.</p>
          ) : (
            students.map((u) => <UserRow key={u.id} user={u} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
