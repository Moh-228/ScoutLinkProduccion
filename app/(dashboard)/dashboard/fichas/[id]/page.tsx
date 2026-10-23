import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { ContactRevealButton } from "@/components/ContactRevealButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { labelField, labelFieldValue } from "@/lib/ficha-labels";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS } from "@/lib/sport-colors";

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

const EXP_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === "" || value === null || value === undefined || value === false) return null;
  return (
    <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[200px_1fr] sm:gap-2">
      <span className="font-medium text-brand-primary/70">{label}</span>
      <span className="text-brand-primary">{value === true ? "Sí" : String(value)}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-primary/70 border-t border-brand-border/40 pt-4">
      {children}
    </p>
  );
}

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ deporte?: string }> };

export default async function FichaDetailPage({ params, searchParams }: Props) {
  const { deporte } = await searchParams;
  const session = await verifySession();
  const { id } = await params;

  const card = await prisma.studentGeneralCard.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          studentProfile: {
            select: {
              fullName: true,
              school: true,
              semester: true,
              gender: true,
              favoriteSport: true,
              birthDate: true,
              socialLink: true,
            },
          },
          specializedCards: { orderBy: { sport: "asc" } },
        },
      },
    },
  });

  if (!card || !card.isPublic) notFound();

  const profile = card.student.studentProfile;
  // `?deporte=` (from the per-sport tiles) narrows the view to that sport's card;
  // without it, or if the student has no card for it, every card is shown as before.
  const allSpecialized = card.student.specializedCards;
  const selectedCard = deporte ? allSpecialized.find((sc) => sc.sport === deporte) : undefined;
  const shownSpecialized = selectedCard ? [selectedCard] : allSpecialized;
  const headerSport = selectedCard?.sport ?? profile?.favoriteSport;
  const isCoachOrAdmin = session?.role === "coach" || session?.role === "admin";
  const medicalInfo = card.medicalInfo as Record<string, unknown> | null;

  let isFavorited = false;
  if (session) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_targetType_targetId: { userId: session.userId, targetType: "ficha", targetId: id } },
      select: { id: true },
    });
    isFavorited = fav !== null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <Link
            href="/dashboard/fichas"
            aria-label="Volver"
            title="Volver"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-primary/70 transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
          >
            <Icon name="arrow" size={18} />
          </Link>
        }
        title={profile?.fullName ?? "Deportista"}
        description={profile?.school}
        actions={
          <>
            {headerSport && (
              <Badge variant="info" className={SPORT_BADGE_CLASS[headerSport] ?? ""}>
                {SPORT_LABELS[headerSport] ?? headerSport}
              </Badge>
            )}
            {session && (
              <FavoriteButton targetType="ficha" targetId={card.id} isFavorited={isFavorited} />
            )}
          </>
        }
      />

      <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* General card */}
      <Card>
        <CardHeader>
          <CardTitle>Ficha general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {profile?.gender && <Row label="Género" value={profile.gender} />}
          {profile?.semester && <Row label="Semestre" value={profile.semester} />}
          {card.heightCm && <Row label="Estatura" value={`${card.heightCm} cm`} />}
          {card.weightKg && <Row label="Peso" value={`${card.weightKg} kg`} />}
          {card.experienceLevel && (
            <Row label="Nivel de experiencia" value={EXP_LABELS[card.experienceLevel] ?? card.experienceLevel} />
          )}

          {/* Contact only for coaches/admins */}
          {isCoachOrAdmin && (
            <>
              {card.phone && <Row label="Teléfono" value={card.phone} />}
              {card.publicEmail && <Row label="Correo público" value={card.publicEmail} />}
              {profile?.socialLink && <Row label="Enlace social" value={profile.socialLink} />}
              <div className="grid grid-cols-1 items-start gap-2 pt-1 text-sm sm:grid-cols-[200px_1fr] sm:items-center">
                <span className="font-medium text-brand-primary/70">Correo institucional</span>
                <ContactRevealButton userId={card.student.id} className="w-fit" />
              </div>
            </>
          )}

          {medicalInfo && (isCoachOrAdmin) && (
            <>
              <SectionTitle>Salud / Condición física</SectionTitle>
              <Row label="Lesiones previas" value={medicalInfo.previousInjuries as string} />
              <Row label="Lesión actual" value={medicalInfo.currentInjury as string} />
              <Row label="Cirugías" value={medicalInfo.surgeries as string} />
              {medicalInfo.asthma && <Row label="Asma" value={true} />}
              <Row label="Patologías" value={medicalInfo.pathologies as string} />
              <Row label="Enfermedades crónicas" value={medicalInfo.chronicDiseases as string} />
              <Row label="Padecimientos cardíacos" value={medicalInfo.cardiacConditions as string} />
              <p className="pt-1 text-xs text-brand-primary/70">Esta información no afecta el cálculo de afinidad.</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Specialized cards */}
      {shownSpecialized.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCard
                ? `Ficha especializada · ${SPORT_LABELS[selectedCard.sport] ?? selectedCard.sport}`
                : "Fichas especializadas"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {shownSpecialized.map((sc) => {
              const data = sc.data as Record<string, unknown>;
              const entries = Object.entries(data).filter(
                ([, v]) => v !== "" && v !== false && v !== null && v !== undefined,
              );
              return (
                <div key={sc.id} className="space-y-2">
                  <Badge variant="info" className={SPORT_BADGE_CLASS[sc.sport]}>
                    {SPORT_LABELS[sc.sport] ?? sc.sport}
                  </Badge>
                  {entries.map(([k, v]) => (
                    <Row key={k} label={labelField(k)} value={labelFieldValue(k, v)} />
                  ))}
                </div>
              );
            })}

            {/* Switch between this student's real sport cards (archive-style). */}
            {selectedCard && allSpecialized.length > 1 && (
              <nav aria-label="Otras fichas de este deportista" className="border-t border-brand-border/50 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
                  Otras fichas de este deportista
                </p>
                <div className="flex flex-wrap gap-2">
                  {allSpecialized
                    .filter((sc) => sc.sport !== selectedCard.sport)
                    .map((sc) => (
                      <Link
                        key={sc.id}
                        href={`/dashboard/fichas/${card.id}?deporte=${sc.sport}`}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction focus-visible:ring-offset-2 ${SPORT_BADGE_CLASS[sc.sport] ?? ""}`}
                      >
                        {SPORT_LABELS[sc.sport] ?? sc.sport}
                      </Link>
                    ))}
                </div>
              </nav>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
