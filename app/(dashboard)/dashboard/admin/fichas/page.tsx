import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { matchSports } from "@/lib/ficha-search";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { findEventIds, findUserIds } from "@/lib/search";
import { GeneralCardRow, SpecializedCardRow, EventRow, CoachProfileRow } from "../_components/FichaRows";

type Props = {
  searchParams: Promise<{
    q?: string;
    pageGeneral?: string;
    pageSpecialized?: string;
    pageEvents?: string;
    pageCoaches?: string;
  }>;
};

export default async function AdminFichasPage({ searchParams }: Props) {
  const {
    q,
    pageGeneral: pageGeneralRaw,
    pageSpecialized: pageSpecializedRaw,
    pageEvents: pageEventsRaw,
    pageCoaches: pageCoachesRaw,
  } = await searchParams;
  const matchedSports = q ? matchSports(q) : [];
  const pageGeneral = parsePage(pageGeneralRaw);
  const pageSpecialized = parsePage(pageSpecializedRaw);
  const pageEvents = parsePage(pageEventsRaw);
  const pageCoaches = parsePage(pageCoachesRaw);

  const [studentIdsByName, studentIdsByNameOrEmail, eventIds] = q
    ? await Promise.all([
        findUserIds(q, ["fullName"]),
        findUserIds(q, ["fullName", "email"]),
        findEventIds(q, ["title", "coachName"]),
      ])
    : [null, null, null];
  const generalWhere = studentIdsByNameOrEmail ? { studentId: { in: studentIdsByNameOrEmail } } : {};
  const specializedWhere = studentIdsByName
    ? {
        OR: [
          { studentId: { in: studentIdsByName } },
          ...(matchedSports.length > 0 ? [{ sport: { in: matchedSports } }] : []),
        ],
      }
    : {};
  const eventsWhere = eventIds ? { id: { in: eventIds } } : {};

  const [
    generalCount,
    specializedCount,
    eventsCount,
    coachProfilesCount,
    generalCards,
    specializedCards,
    events,
    coachProfiles,
  ] = await Promise.all([
    prisma.studentGeneralCard.count({ where: generalWhere }),
    prisma.studentSpecializedCard.count({ where: specializedWhere }),
    prisma.event.count({ where: eventsWhere }),
    prisma.coachProfile.count(),
    prisma.studentGeneralCard.findMany({
      where: generalWhere,
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
        student: { select: { id: true, email: true, studentProfile: { select: { fullName: true, photoUrl: true } } } },
      },
      ...getPagination(pageGeneral),
    }),
    prisma.studentSpecializedCard.findMany({
      where: specializedWhere,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        sport: true,
        data: true,
        student: { select: { id: true, email: true, studentProfile: { select: { fullName: true, photoUrl: true } } } },
      },
      ...getPagination(pageSpecialized),
    }),
    prisma.event.findMany({
      where: eventsWhere,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        sport: true,
        status: true,
        coach: { select: { id: true, email: true, coachProfile: { select: { displayName: true } } } },
      },
      ...getPagination(pageEvents),
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
        photoUrl: true,
        user: {
          select: {
            email: true,
            coachVerifications: {
              select: { sport: true, status: true },
            },
          },
        },
      },
      ...getPagination(pageCoaches),
    }),
  ]);

  const basePath = "/dashboard/admin/fichas";
  const preserved = {
    q,
    pageGeneral: pageGeneralRaw,
    pageSpecialized: pageSpecializedRaw,
    pageEvents: pageEventsRaw,
    pageCoaches: pageCoachesRaw,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Fichas"
        description="Administra fichas de deportistas, entrenadores y eventos."
      />

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Eventos ({eventsCount})</CardTitle>
          <CardDescription>Todos los eventos creados por coaches. Puedes editar, desactivar o eliminar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.length === 0 ? (
            <EmptyState size="compact" icon="calendar" title="Sin eventos registrados." />
          ) : (
            events.map((e) => <EventRow key={e.id} event={e} />)
          )}
          <Pagination
            page={pageEvents}
            totalPages={getTotalPages(eventsCount)}
            basePath={basePath}
            searchParams={preserved}
            paramName="pageEvents"
          />
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Perfiles de entrenadores ({coachProfilesCount})</CardTitle>
          <CardDescription>Datos de coaches registrados y sus verificaciones por deporte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {coachProfiles.length === 0 ? (
            <EmptyState size="compact" icon="person" title="Sin coaches registrados." />
          ) : (
            coachProfiles.map((c) => <CoachProfileRow key={c.userId} coach={c} />)
          )}
          <Pagination
            page={pageCoaches}
            totalPages={getTotalPages(coachProfilesCount)}
            basePath={basePath}
            searchParams={preserved}
            paramName="pageCoaches"
          />
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Fichas generales de deportistas ({generalCount})</CardTitle>
          <CardDescription>Ficha pública/privada de cada deportista.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {generalCards.length === 0 ? (
            <EmptyState size="compact" icon="id_card" title="Sin fichas generales." />
          ) : (
            generalCards.map((c) => <GeneralCardRow key={c.id} card={c} />)
          )}
          <Pagination
            page={pageGeneral}
            totalPages={getTotalPages(generalCount)}
            basePath={basePath}
            searchParams={preserved}
            paramName="pageGeneral"
          />
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Fichas especializadas de deportistas ({specializedCount})</CardTitle>
          <CardDescription>Fichas por deporte de cada deportista.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {specializedCards.length === 0 ? (
            <EmptyState size="compact" icon="id_card" title="Sin fichas especializadas." />
          ) : (
            specializedCards.map((c) => <SpecializedCardRow key={c.id} card={c} />)
          )}
          <Pagination
            page={pageSpecialized}
            totalPages={getTotalPages(specializedCount)}
            basePath={basePath}
            searchParams={preserved}
            paramName="pageSpecialized"
          />
        </CardContent>
      </Card>
    </div>
  );
}
