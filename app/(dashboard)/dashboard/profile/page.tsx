import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { verifySession } from "@/lib/auth";
import { labelField, labelValue } from "@/lib/ficha-labels";
import { prisma } from "@/lib/prisma";
import { CardVisibilityToggle } from "./_components/CardVisibilityToggle";

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

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
      <span className="font-medium text-white/50">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/40">{children}</p>
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

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi perfil</h1>
          <p className="text-white/60">{user.email}</p>
        </div>
        <Link
          href={isStudent ? "/onboarding/student" : isCoach ? "/onboarding/coach" : "#"}
          className={buttonClassNames("secondary")}
        >
          Editar perfil
        </Link>
      </header>

      {isStudent && user.studentProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil estudiantil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
              <Link href="/onboarding/student/card" className={buttonClassNames("secondary") + " text-xs px-3 py-1"}>
                Editar
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
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
                  </>
                )}

                {documents && (
                  <>
                    <SectionTitle>Documentación</SectionTitle>
                    <Row label="Comprobante inscripción" value={documents.inscriptionProof as string} />
                    <Row label="Seguro médico" value={documents.medicalInsurance as string} />
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-white/40">Aún no has completado tu ficha general.</p>
            )}
          </CardContent>
        </Card>
      )}

      {isStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Fichas especializadas</CardTitle>
              <Link href="/onboarding/student/specialized" className={buttonClassNames("secondary") + " text-xs px-3 py-1"}>
                {user.specializedCards.length > 0 ? "Editar / Agregar" : "Agregar"}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.specializedCards.length === 0 ? (
              <p className="text-sm text-white/40">Aún no tienes fichas especializadas.</p>
            ) : (
              user.specializedCards.map((sc) => {
                const data = sc.data as Record<string, unknown>;
                return (
                  <div key={sc.id} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{SPORT_LABELS[sc.sport] ?? sc.sport}</Badge>
                    </div>
                    {Object.entries(data)
                      .filter(([, v]) => v !== "" && v !== false && v !== null && v !== undefined)
                      .map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[200px_1fr] gap-2 text-sm">
                          <span className="font-medium text-white/50">{labelField(k)}</span>
                          <span className="text-white">{labelValue(v)}</span>
                        </div>
                      ))}
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
          <CardContent className="space-y-2">
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
          <CardContent className="space-y-2">
            {user.coachVerifications.map((v) => (
              <Row
                key={v.sport}
                label={SPORT_LABELS[v.sport] ?? v.sport}
                value={v.status === "verified" ? "✓ Verificado" : v.status === "rejected" ? "✗ Rechazado" : "⏳ Pendiente"}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
