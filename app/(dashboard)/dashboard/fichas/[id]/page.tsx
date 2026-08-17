import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { ContactRevealButton } from "@/components/ContactRevealButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { verifySession } from "@/lib/auth";
import { labelField, labelValue } from "@/lib/ficha-labels";
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
    <div className="grid grid-cols-[200px_1fr] gap-2 text-sm">
      <span className="font-medium text-brand-primary/50">{label}</span>
      <span className="text-brand-primary">{value === true ? "Sí" : String(value)}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-primary/50 border-t border-brand-border/40 pt-4">
      {children}
    </p>
  );
}

type Props = { params: Promise<{ id: string }> };

export default async function FichaDetailPage({ params }: Props) {
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
      <header className="flex items-center gap-3">
        <Link
          href="/dashboard/fichas"
          aria-label="Volver"
          title="Volver"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-primary/70 transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
        >
          <Icon name="arrow" size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-brand-primary">{profile?.fullName ?? "Deportista"}</h1>
          {profile?.school && <p className="text-brand-primary/70">{profile.school}</p>}
        </div>
        {profile?.favoriteSport && (
          <Badge variant="info" className={`ml-auto ${SPORT_BADGE_CLASS[profile.favoriteSport] ?? ""}`}>
            {SPORT_LABELS[profile.favoriteSport] ?? profile.favoriteSport}
          </Badge>
        )}
        {session && (
          <FavoriteButton targetType="ficha" targetId={card.id} isFavorited={isFavorited} />
        )}
      </header>

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
              <div className="grid grid-cols-[200px_1fr] items-center gap-2 pt-1 text-sm">
                <span className="font-medium text-brand-primary/50">Correo institucional</span>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Specialized cards */}
      {card.student.specializedCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichas especializadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {card.student.specializedCards.map((sc) => {
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
                    <Row key={k} label={labelField(k)} value={labelValue(v)} />
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
