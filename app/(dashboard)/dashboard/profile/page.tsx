import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { verifySession } from "@/lib/auth";
import { labelField, labelFieldValue } from "@/lib/ficha-labels";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS } from "@/lib/sport-colors";
import { CardVisibilityToggle } from "./_components/CardVisibilityToggle";
import { ProfilePhotoField } from "./_components/ProfilePhotoField";
import { SpecializedCardActions } from "./_components/SpecializedCardActions";

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

const GENDER_LABELS: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

const EXP_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[160px_1fr] sm:gap-2">
      <span className="font-medium text-brand-primary/70">{label}</span>
      <span className="min-w-0 wrap-break-word text-brand-primary">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">{children}</p>
  );
}

function ageFromBirthDate(birthDate: Date | null | undefined) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function IdentityField({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="w-full space-y-1 text-left">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">{label}</p>
      {typeof value === "string" || typeof value === "number" ? (
        <p className="text-sm text-brand-primary">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}

export default async function ProfilePage() {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      role: true,
      studentProfile: true,
      coachProfile: true,
      generalCard: true,
      specializedCards: { orderBy: { createdAt: "asc" } },
      coachVerifications: { select: { sport: true, status: true } },
    },
  });

  if (!user) redirect("/auth/login");

  const isStudent = user.role === "student";
  const isCoach = user.role === "coach";

  const medicalInfo = user.generalCard?.medicalInfo as Record<string, unknown> | null;
  const documents = user.generalCard?.documents as Record<string, unknown> | null;

  const displayName = isStudent
    ? user.studentProfile?.fullName
    : isCoach
      ? user.coachProfile?.displayName
      : "Administrador";
  const photoUrl = isStudent ? user.studentProfile?.photoUrl : isCoach ? user.coachProfile?.photoUrl : null;
  const age = isStudent ? ageFromBirthDate(user.studentProfile?.birthDate) : null;
  const bio = isCoach ? user.coachProfile?.bio : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi perfil"
        description={
          <>
            {displayName && <p className="text-sm font-semibold text-brand-primary">{displayName}</p>}
            <p>{user.email}</p>
          </>
        }
        actions={
          (isStudent || isCoach) && (
            <Link
              href={isStudent ? "/onboarding/student" : "/onboarding/coach"}
              className={buttonClassNames("secondary", "gap-2")}
            >
              <Icon name="person_edit" size={16} />
              Editar perfil
            </Link>
          )
        }
      />

      <div className="mx-auto w-full max-w-2xl space-y-6">
      {(isStudent || isCoach) && displayName && (
        <Card>
          <div className="flex items-center gap-4">
            <ProfilePhotoField photoUrl={photoUrl ?? null} displayName={displayName} />
            <div>
              <p className="font-display text-xl font-bold text-brand-primary">{displayName}</p>
              {age !== null && <p className="text-sm text-brand-primary/70">{age} años</p>}
            </div>
          </div>

          <div className="w-full border-t border-brand-border/50" />

          <div className="grid w-full grid-cols-2 gap-4">
            {isStudent ? (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Escuela</p>
                  <p className="text-sm font-semibold text-brand-primary">{user.studentProfile?.school ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Semestre</p>
                  <p className="text-sm font-semibold text-brand-primary">{user.studentProfile?.semester ?? "—"}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Unidad académica</p>
                  <p className="text-sm font-semibold text-brand-primary">{user.coachProfile?.academicUnit ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Años de experiencia</p>
                  <p className="text-sm font-semibold text-brand-primary">{user.coachProfile?.yearsExperience ?? "—"}</p>
                </div>
              </>
            )}
          </div>

          <IdentityField label="Bio" value={bio} />

          {isStudent && user.studentProfile?.favoriteSport && (
            <IdentityField
              label="Deporte favorito"
              value={
                <Badge variant="neutral" className={`w-fit ${SPORT_BADGE_CLASS[user.studentProfile.favoriteSport]}`}>
                  {SPORT_LABELS[user.studentProfile.favoriteSport] ?? user.studentProfile.favoriteSport}
                </Badge>
              }
            />
          )}

          {isCoach && user.coachProfile && user.coachProfile.sports.length > 0 && (
            <IdentityField
              label="Deportes"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {user.coachProfile.sports.map((s) => (
                    <Badge key={s} variant="neutral" className={`w-fit ${SPORT_BADGE_CLASS[s] ?? ""}`}>
                      {SPORT_LABELS[s] ?? s}
                    </Badge>
                  ))}
                </div>
              }
            />
          )}

          {isStudent && user.studentProfile?.socialLink && (
            <IdentityField
              label="Red social"
              value={<Badge variant="neutral" className="w-fit">{user.studentProfile.socialLink}</Badge>}
            />
          )}
        </Card>
      )}

      {isStudent && user.studentProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil estudiantil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Row label="Nombre" value={user.studentProfile.fullName} />
            <Row label="Escuela" value={user.studentProfile.school} />
            <Row label="Semestre" value={user.studentProfile.semester} />
            <Row label="Género" value={user.studentProfile.gender ? GENDER_LABELS[user.studentProfile.gender] ?? user.studentProfile.gender : undefined} />
            <Row
              label="Deporte favorito"
              value={user.studentProfile.favoriteSport ? SPORT_LABELS[user.studentProfile.favoriteSport] : undefined}
            />
          </CardContent>
        </Card>
      )}

      {isStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Ficha general</CardTitle>
              <Link href="/onboarding/student/card" className={buttonClassNames("secondary", "", "sm")}>
                Editar
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {user.generalCard ? (
              <>
                <Row label="Estatura" value={user.generalCard.heightCm ? `${user.generalCard.heightCm} cm` : undefined} />
                <Row label="Peso" value={user.generalCard.weightKg ? `${user.generalCard.weightKg} kg` : undefined} />
                <Row
                  label="Nivel"
                  value={user.generalCard.experienceLevel ? EXP_LABELS[user.generalCard.experienceLevel] ?? user.generalCard.experienceLevel : undefined}
                />
                <Row label="Teléfono" value={user.generalCard.phone} />
                <Row label="Correo público" value={user.generalCard.publicEmail} />
                <CardVisibilityToggle initialIsPublic={user.generalCard.isPublic} />

                {medicalInfo && (
                  <>
                    <SectionTitle>Salud</SectionTitle>
                    <Row label="Lesiones previas" value={medicalInfo.previousInjuries as string} />
                    <Row label="Lesión actual" value={medicalInfo.currentInjury as string} />
                    <Row label="Cirugías" value={medicalInfo.surgeries as string} />
                    {medicalInfo.asthma && <Row label="Asma" value="Sí" />}
                    <Row label="Patologías" value={medicalInfo.pathologies as string} />
                    <Row label="Enfermedades crónicas" value={medicalInfo.chronicDiseases as string} />
                    <Row label="Padecimientos cardíacos" value={medicalInfo.cardiacConditions as string} />
                  </>
                )}

                {documents && (
                  <>
                    <SectionTitle>Documentación</SectionTitle>
                    <Row
                      label="Comprobante inscripción"
                      value={
                        documents.inscriptionProof ? (
                          <a
                            href={`/api/files/document?key=${encodeURIComponent(String(documents.inscriptionProof))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-secondary underline hover:text-brand-primary"
                          >
                            Ver PDF
                          </a>
                        ) : undefined
                      }
                    />
                    <Row
                      label="Seguro médico"
                      value={
                        documents.medicalInsurance ? (
                          <a
                            href={`/api/files/document?key=${encodeURIComponent(String(documents.medicalInsurance))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-secondary underline hover:text-brand-primary"
                          >
                            Ver PDF
                          </a>
                        ) : undefined
                      }
                    />
                  </>
                )}
              </>
            ) : (
              <EmptyState size="compact" title="Aún no has completado tu ficha general." icon="id_card" />
            )}
          </CardContent>
        </Card>
      )}

      {isStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Fichas especializadas</CardTitle>
              <Link href="/onboarding/student/specialized" className={buttonClassNames("secondary", "", "sm")}>
                + Agregar ficha
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.specializedCards.length === 0 ? (
              <EmptyState size="compact" title="Aún no tienes fichas especializadas." icon="id_card" />
            ) : (
              user.specializedCards.map((sc) => {
                const data = sc.data as Record<string, unknown>;
                return (
                  <div key={sc.id} className="rounded-lg border border-brand-border/50 bg-brand-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="info" className={SPORT_BADGE_CLASS[sc.sport]}>
                        {SPORT_LABELS[sc.sport] ?? sc.sport}
                      </Badge>
                      <SpecializedCardActions sport={sc.sport} />
                    </div>
                    <div className="mt-3 space-y-2">
                      {Object.entries(data)
                        .filter(([, v]) => v !== "" && v !== false && v !== null && v !== undefined)
                        .map(([k, v]) => (
                          <div key={k} className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[200px_1fr] sm:gap-2">
                            <span className="font-medium text-brand-primary/70">{labelField(k)}</span>
                            <span className="text-brand-primary">{labelFieldValue(k, v)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {isCoach && user.coachProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil de entrenador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Row label="Nombre" value={user.coachProfile.displayName} />
            <Row label="Unidad académica" value={user.coachProfile.academicUnit} />
            <Row label="Teléfono" value={user.coachProfile.phone} />
            <Row label="Bio" value={user.coachProfile.bio} />
            <Row
              label="Deportes"
              value={user.coachProfile.sports.map((s) => SPORT_LABELS[s] ?? s).join(", ")}
            />
            <Row label="Años de experiencia" value={user.coachProfile.yearsExperience} />
          </CardContent>
        </Card>
      )}

      {isCoach && user.coachVerifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {user.coachVerifications.map((v) => (
              <Row
                key={v.sport}
                label={SPORT_LABELS[v.sport] ?? v.sport}
                value={
                  v.status === "verified" ? (
                    "✓ Verificado"
                  ) : v.status === "rejected" ? (
                    "✗ Rechazado"
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="hourglass" size={14} />
                      Pendiente
                    </span>
                  )
                }
              />
            ))}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
