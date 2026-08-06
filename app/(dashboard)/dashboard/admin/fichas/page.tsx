import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { matchSports } from "@/lib/ficha-search";
import { GeneralCardRow, SpecializedCardRow, EventRow, CoachProfileRow } from "../_components/FichaRows";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminFichasPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const matchedSports = q ? matchSports(q) : [];

  const [generalCards, specializedCards, events, coachProfiles] = await Promise.all([
    prisma.studentGeneralCard.findMany({
      where: q
        ? {
            OR: [
              { student: { studentProfile: { fullName: { contains: q, mode: "insensitive" } } } },
              { student: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {},
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
      where: q
        ? {
            OR: [
              { student: { studentProfile: { fullName: { contains: q, mode: "insensitive" } } } },
              ...(matchedSports.length > 0 ? [{ sport: { in: matchedSports } }] : []),
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        sport: true,
        data: true,
        student: { select: { id: true, email: true, studentProfile: { select: { fullName: true } } } },
      },
    }),
    prisma.event.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { coach: { coachProfile: { displayName: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {},
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
        <h1 className="text-xl font-bold text-brand-primary">Gestión de Fichas</h1>
        <p className="text-brand-primary/70">Administra fichas de deportistas, entrenadores y eventos.</p>
      </header>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Eventos ({events.length})</CardTitle>
          <CardDescription>Todos los eventos creados por coaches. Puedes editar, desactivar o eliminar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-brand-primary/70">Sin eventos registrados.</p>
          ) : (
            events.map((e) => <EventRow key={e.id} event={e} />)
          )}
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Perfiles de entrenadores ({coachProfiles.length})</CardTitle>
          <CardDescription>Datos de coaches registrados y sus verificaciones por deporte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {coachProfiles.length === 0 ? (
            <p className="text-sm text-brand-primary/70">Sin coaches registrados.</p>
          ) : (
            coachProfiles.map((c) => <CoachProfileRow key={c.userId} coach={c} />)
          )}
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Fichas generales de deportistas ({generalCards.length})</CardTitle>
          <CardDescription>Ficha pública/privada de cada deportista.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {generalCards.length === 0 ? (
            <p className="text-sm text-brand-primary/70">Sin fichas generales.</p>
          ) : (
            generalCards.map((c) => <GeneralCardRow key={c.id} card={c} />)
          )}
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Fichas especializadas de deportistas ({specializedCards.length})</CardTitle>
          <CardDescription>Fichas por deporte de cada deportista.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {specializedCards.length === 0 ? (
            <p className="text-sm text-brand-primary/70">Sin fichas especializadas.</p>
          ) : (
            specializedCards.map((c) => <SpecializedCardRow key={c.id} card={c} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
