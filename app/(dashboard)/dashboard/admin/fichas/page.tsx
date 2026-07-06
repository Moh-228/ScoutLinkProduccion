import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { GeneralCardRow, SpecializedCardRow, EventRow, CoachProfileRow } from "../_components/FichaRows";

export default async function AdminFichasPage() {
  const [generalCards, specializedCards, events, coachProfiles] = await Promise.all([
    prisma.studentGeneralCard.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        heightCm: true,
        weightKg: true,
        phone: true,
        publicEmail: true,
        experienceLevel: true,
        isPublic: true,
        documents: true,
        student: { select: { id: true, email: true, studentProfile: { select: { fullName: true } } } },
      },
    }),
    prisma.studentSpecializedCard.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        sport: true,
        data: true,
        student: { select: { id: true, email: true, studentProfile: { select: { fullName: true } } } },
      },
    }),
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        sport: true,
        status: true,
        coach: { select: { id: true, email: true, coachProfile: { select: { displayName: true } } } },
      },
    }),
    prisma.coachProfile.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        userId: true,
        displayName: true,
        academicUnit: true,
        phone: true,
        bio: true,
        sports: true,
        user: {
          select: {
            email: true,
            coachVerifications: {
              select: { sport: true, status: true },
            },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Gestión de Fichas</h1>
        <p className="text-slate-400">Administra fichas de deportistas, entrenadores y eventos.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Eventos ({events.length})</CardTitle>
          <CardDescription>Todos los eventos creados por coaches. Puedes editar, desactivar o eliminar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-slate-400">Sin eventos registrados.</p>
          ) : (
            events.map((e) => <EventRow key={e.id} event={e} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfiles de entrenadores ({coachProfiles.length})</CardTitle>
          <CardDescription>Datos de coaches registrados y sus verificaciones por deporte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {coachProfiles.length === 0 ? (
            <p className="text-sm text-slate-400">Sin coaches registrados.</p>
          ) : (
            coachProfiles.map((c) => <CoachProfileRow key={c.userId} coach={c} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fichas generales de deportistas ({generalCards.length})</CardTitle>
          <CardDescription>Ficha pública/privada de cada deportista.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {generalCards.length === 0 ? (
            <p className="text-sm text-slate-400">Sin fichas generales.</p>
          ) : (
            generalCards.map((c) => <GeneralCardRow key={c.id} card={c} />)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fichas especializadas de deportistas ({specializedCards.length})</CardTitle>
          <CardDescription>Fichas por deporte de cada deportista.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {specializedCards.length === 0 ? (
            <p className="text-sm text-slate-400">Sin fichas especializadas.</p>
          ) : (
            specializedCards.map((c) => <SpecializedCardRow key={c.id} card={c} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
