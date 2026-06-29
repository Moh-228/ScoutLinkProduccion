import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { SPORT_CHARACTERISTICS } from "@/lib/sport-characteristics";
import { ApplyButton } from "./_components/ApplyButton";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football (Tocho)",
  volleyball: "Voleibol",
};

const TYPE_LABELS: Record<string, string> = {
  tournament: "Torneo",
  training: "Entrenamiento",
  recruitment: "Reclutamiento",
};

const VISIBILITY_LABELS: Record<string, string> = {
  public: "Pública",
  sport: "Solo mi deporte",
  unit: "Solo mi unidad",
};

const FORMAT_LABELS: Record<string, string> = {
  liga: "Liga (todos contra todos)",
  KO: "Eliminación directa (KO)",
  grupos: "Fase de grupos + eliminatoria",
};

const LEVEL_LABELS: Record<string, string> = {
  open: "Abierto",
  beginner: "Principiante",
  intermediate: "Intermedio",
  experienced: "Experimentado",
};

const CATEGORY_LABELS: Record<string, string> = {
  V: "Varonil",
  F: "Femenil",
  Mixto: "Mixto",
};

const DAY_LABELS: Record<string, string> = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié",
  jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

function fmt(dateStr: Date | null | undefined) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
      <span className="font-medium text-white/50">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  const session = await verifySession();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      coach: {
        select: {
          coachProfile: { select: { displayName: true, academicUnit: true } },
        },
      },
    },
  });

  if (!event) notFound();

  const req = (event.requirements ?? {}) as Record<string, unknown>;
  const isOwner = session?.userId === event.coachId;
  const isAdmin = session?.role === "admin";
  const isStudent = session?.role === "student";
  const organizerName = event.coach.coachProfile?.displayName ?? "—";

  let existingApplication: { status: string } | null = null;
  if (isStudent && session) {
    existingApplication = await prisma.eventApplication.findUnique({
      where: { eventId_studentId: { eventId: id, studentId: session.userId } },
      select: { status: true },
    });
  }

  let isEventFavorited = false;
  if (session) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_targetType_targetId: { userId: session.userId, targetType: "event", targetId: id } },
      select: { id: true },
    });
    isEventFavorited = fav !== null;
  }
  const isTournament = event.type === "tournament";
  const isTraining = event.type === "training";
  const isRecruitment = event.type === "recruitment";

  // Recruitment: check if student has a specialized card for this sport
  let hasSpecializedCard = true;
  if (isRecruitment && isStudent && session) {
    const card = await prisma.studentSpecializedCard.findFirst({
      where: { studentId: session.userId, sport: event.sport as never },
      select: { id: true },
    });
    hasSpecializedCard = card !== null;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
            <Badge variant="neutral">{SPORT_LABELS[event.sport] ?? event.sport}</Badge>
            <Badge
              variant={event.status === "open" ? "success" : "danger"}
            >
              {event.status === "open" ? "Abierto" : "Cerrado"}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-white">{event.title}</h1>
          <p className="mt-1 text-sm text-white/60">
            {organizerName}
            {event.coach.coachProfile?.academicUnit
              ? ` · ${event.coach.coachProfile.academicUnit}`
              : ""}
          </p>
        </div>
        {(isOwner || isAdmin) && (
          <Link href={`/dashboard/events/${event.id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
        )}
        {session && (
          <FavoriteButton
            targetType="event"
            targetId={event.id}
            isFavorited={isEventFavorited}
          />
        )}
      </header>

      {/* ── Información general ── */}
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label="Tipo" value={TYPE_LABELS[event.type] ?? event.type} />
          <InfoRow label="Deporte" value={SPORT_LABELS[event.sport] ?? event.sport} />
          <InfoRow label="Visibilidad" value={VISIBILITY_LABELS[event.visibility] ?? event.visibility} />
          {!!req.academicUnit && <InfoRow label="Unidad académica" value={String(req.academicUnit)} />}
        </CardContent>
      </Card>

      {/* ── Fecha, hora y lugar (torneo / reclutamiento) ── */}
      {(isTournament || isRecruitment) && (
        <Card>
          <CardHeader>
            <CardTitle>Fecha, hora y lugar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Inicio" value={fmt(event.startAt)} />
            <InfoRow label="Fin" value={fmt(event.endAt)} />
            <InfoRow label="Sede" value={event.locationText} />
            {event.mapsUrl && (
              <InfoRow
                label="Maps"
                value={
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1883ff] underline"
                  >
                    Ver en Google Maps
                  </a>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Horario (entrenamiento) ── */}
      {isTraining && (
        <Card>
          <CardHeader>
            <CardTitle>Horario y lugar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.isArray(req.scheduleDays) && req.scheduleDays.length > 0 && (
              <InfoRow
                label="Días"
                value={
                  <div className="flex flex-wrap gap-1">
                    {(req.scheduleDays as string[]).map((d) => (
                      <span
                        key={d}
                        className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white"
                      >
                        {DAY_LABELS[d] ?? d}
                      </span>
                    ))}
                  </div>
                }
              />
            )}
            <InfoRow
              label="Horario"
              value={
                req.startTime || req.endTime
                  ? `${req.startTime ?? ""}${req.endTime ? ` – ${req.endTime}` : ""}`
                  : null
              }
            />
            <InfoRow label="Sede" value={event.locationText} />
            {event.mapsUrl && (
              <InfoRow
                label="Maps"
                value={
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1883ff] underline"
                  >
                    Ver en Google Maps
                  </a>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Registro ── */}
      <Card>
        <CardHeader>
          <CardTitle>Registro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label="Cupo máximo" value={event.capacity ?? "Sin límite"} />
          {(isTournament || isRecruitment) && (
            <InfoRow label="Límite de registro" value={fmt(event.registrationDeadline)} />
          )}
          <InfoRow label="Costo" value={req.cost ? String(req.cost) : "Gratuito"} />
          <InfoRow
            label="Auto-cierre"
            value={req.autoClose ? "Sí, al alcanzar el cupo" : "No"}
          />
          {!!req.notes && (
            <div className="pt-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                Notas / políticas
              </p>
              <p className="text-sm text-white/80 whitespace-pre-line">{String(req.notes)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Descripción ── */}
      {(event.shortDescription || event.longDescription) && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.shortDescription && (
              <p className="text-sm font-medium text-white/80">{event.shortDescription}</p>
            )}
            {event.longDescription && (
              <p className="text-sm text-white/70 whitespace-pre-line">{event.longDescription}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Detalles del torneo ── */}
      {isTournament && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del torneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Formato" value={req.format ? FORMAT_LABELS[String(req.format)] ?? String(req.format) : null} />
            <InfoRow label="Categoría" value={req.category ? CATEGORY_LABELS[String(req.category)] ?? String(req.category) : null} />
            <InfoRow label="Equipos mínimos" value={req.minTeams as number} />
            <InfoRow label="Equipos máximos" value={req.maxTeams as number} />
            <InfoRow label="Jugadores por equipo" value={req.playersPerTeam as number} />
            <InfoRow label="Suplentes" value={req.substitutes as number} />
            {Array.isArray(req.gameDays) && req.gameDays.length > 0 && (
              <InfoRow
                label="Días de juego"
                value={
                  <div className="flex flex-wrap gap-1">
                    {(req.gameDays as string[]).map((d) => (
                      <span
                        key={d}
                        className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white"
                      >
                        {DAY_LABELS[d] ?? d}
                      </span>
                    ))}
                  </div>
                }
              />
            )}
            <InfoRow label="Ventana horaria" value={req.timeWindow ? String(req.timeWindow) : null} />
            {!!req.rulesLink && (
              <InfoRow
                label="Reglamento"
                value={
                  <a
                    href={String(req.rulesLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1883ff] underline"
                  >
                    Ver reglamento
                  </a>
                }
              />
            )}
            {!!req.registrationRequirements && (
              <div className="pt-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                  Requisitos de registro
                </p>
                <p className="text-sm text-white/80 whitespace-pre-line">
                  {String(req.registrationRequirements)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Detalles del reclutamiento ── */}
      {isRecruitment && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del reclutamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Equipo objetivo" value={req.targetTeam ? String(req.targetTeam) : null} />
            <InfoRow label="Categoría" value={req.category ? CATEGORY_LABELS[String(req.category)] ?? String(req.category) : null} />
            <InfoRow label="Nivel" value={req.level ? LEVEL_LABELS[String(req.level)] ?? String(req.level) : null} />
            {!!req.sportsCharacteristics &&
              typeof req.sportsCharacteristics === "object" &&
              Object.keys(req.sportsCharacteristics as object).length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    Características buscadas
                  </p>
                  {(SPORT_CHARACTERISTICS[event.sport] ?? []).map((field) => {
                    const raw = (req.sportsCharacteristics as Record<string, unknown>)[field.key];
                    if (!raw || (Array.isArray(raw) && raw.length === 0)) return null;

                    let display: string;
                    if (field.type === "select") {
                      const opt = field.options.find((o) => o.value === String(raw));
                      display = opt?.label ?? String(raw);
                    } else if (field.type === "skills") {
                      const arr = Array.isArray(raw) ? (raw as string[]) : [String(raw)];
                      display = arr
                        .map((v) => field.options.find((o) => o.value === v)?.label ?? v)
                        .join(", ");
                    } else {
                      display = String(raw);
                    }

                    return <InfoRow key={field.key} label={field.label} value={display} />;
                  })}
                </div>
              )}
            {!!req.whatToBring && (
              <div className="pt-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                  Qué llevar
                </p>
                <p className="text-sm text-white/80 whitespace-pre-line">{String(req.whatToBring)}</p>
              </div>
            )}
            {!!req.evaluationFormat && (
              <div className="pt-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                  Formato de evaluación
                </p>
                <p className="text-sm text-white/80 whitespace-pre-line">{String(req.evaluationFormat)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── CTA ── */}
      {isStudent && (
        <div className="flex justify-end pb-6">
          <ApplyButton
            eventId={event.id}
            eventTitle={event.title}
            eventIsOpen={event.status === "open"}
            existingApplication={existingApplication}
            missingSpecializedCard={isRecruitment && !hasSpecializedCard}
          />
        </div>
      )}
    </div>
  );
}

