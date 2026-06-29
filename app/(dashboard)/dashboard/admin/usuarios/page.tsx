import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { UserRow } from "../_components/UserRow";

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    where: { role: { not: "admin" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      onboardingCompleted: true,
      createdAt: true,
      studentProfile: { select: { fullName: true } },
      coachProfile: { select: { displayName: true } },
    },
  });

  const students = users.filter((u) => u.role === "student");
  const coaches = users.filter((u) => u.role === "coach");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-slate-400">Activa, desactiva o elimina cuentas de deportistas y coaches.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Coaches ({coaches.length})</CardTitle>
          <CardDescription>Entrenadores registrados en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {coaches.length === 0 ? (
            <p className="text-sm text-slate-400">Sin coaches registrados.</p>
          ) : (
            coaches.map((u) => <UserRow key={u.id} user={u} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deportistas ({students.length})</CardTitle>
          <CardDescription>Alumnos registrados en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {students.length === 0 ? (
            <p className="text-sm text-slate-400">Sin deportistas registrados.</p>
          ) : (
            students.map((u) => <UserRow key={u.id} user={u} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
