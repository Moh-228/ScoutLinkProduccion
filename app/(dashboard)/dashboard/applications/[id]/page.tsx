import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/Badge";
import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusActions } from "./_components/StatusActions";

const STATUS_BADGES = {
	postulado: { label: "Postulado", variant: "info" as const },
	preseleccionado: { label: "Preseleccionado", variant: "warning" as const },
	aceptado: { label: "Aceptado", variant: "success" as const },
	rechazado: { label: "Rechazado", variant: "danger" as const },
};

const SPORT_LABELS: Record<string, string> = {
	basketball: "Básquetbol",
	soccer: "Fútbol",
	flag_football: "Flag Football",
	volleyball: "Voleibol",
};

const TYPE_LABELS: Record<string, string> = {
	tournament: "Torneo",
	training: "Entrenamiento",
	recruitment: "Reclutamiento",
};

const EXP_LABELS: Record<string, string> = {
	beginner: "Principiante",
	intermediate: "Intermedio",
	advanced: "Avanzado",
};

const GENDER_LABELS: Record<string, string> = {
	male: "Masculino",
	female: "Femenino",
	other: "Otro",
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
	if (!value && value !== 0) return null;
	return (
		<div className="grid grid-cols-[180px_1fr] gap-2 text-sm">
			<span className="font-medium text-white/50">{label}</span>
			<span className="text-white">{value}</span>
		</div>
	);
}

type Props = { params: Promise<{ id: string }> };

export default async function ApplicationDetailPage({ params }: Props) {
	const { id } = await params;
	const session = await verifySession();
	if (!session) redirect("/auth/login");

	const application = await prisma.eventApplication.findUnique({
		where: { id },
		include: {
			event: {
				select: { id: true, title: true, type: true, sport: true, coachId: true },
			},
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
						},
					},
					generalCard: {
						select: {
							id: true,
							heightCm: true,
							weightKg: true,
							experienceLevel: true,
							isPublic: true,
						},
					},
				},
			},
		},
	});

	if (!application) notFound();

	const isCoach = session.role === "coach" && application.event.coachId === session.userId;
	const isAdmin = session.role === "admin";
	const isOwner = session.role === "student" && application.studentId === session.userId;

	if (!isCoach && !isAdmin && !isOwner) redirect("/dashboard");

	const canManage = isCoach || isAdmin;
	const profile = application.student.studentProfile;
	const card = application.student.generalCard;
	const badge = STATUS_BADGES[application.status];

	return (
		<div className="space-y-6">
			<header className="flex items-center gap-3">
				<Link
					href="/dashboard/applications"
					className={buttonClassNames("secondary") + " text-xs px-3 py-1"}
				>
					← Volver
				</Link>
				<h1 className="text-xl font-bold text-white">Detalle de postulación</h1>
			</header>

			{/* Estado actual */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-3">
						<CardTitle>Postulación</CardTitle>
						<Badge variant={badge.variant}>{badge.label}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-2">
					<Row label="Evento" value={application.event.title} />
					<Row
						label="Tipo"
						value={TYPE_LABELS[application.event.type] ?? application.event.type}
					/>
					<Row
						label="Deporte"
						value={SPORT_LABELS[application.event.sport] ?? application.event.sport}
					/>
					{application.affinityPercent > 0 && (
						<Row label="Afinidad" value={`${application.affinityPercent}%`} />
					)}
				</CardContent>
			</Card>

			{/* Datos del alumno */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-3">
						<CardTitle>{profile?.fullName ?? "Deportista"}</CardTitle>
						{card?.isPublic && (
							<Link
								href={`/dashboard/fichas/${card.id}`}
								className="text-sm font-semibold text-[#1883ff] hover:underline"
							>
								Ver ficha completa →
							</Link>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-2">
					<Row label="Escuela" value={profile?.school ?? null} />
					<Row label="Semestre" value={profile?.semester ?? null} />
					<Row
						label="Género"
						value={profile?.gender ? (GENDER_LABELS[profile.gender] ?? profile.gender) : null}
					/>
					<Row
						label="Deporte favorito"
						value={
							profile?.favoriteSport
								? (SPORT_LABELS[profile.favoriteSport] ?? profile.favoriteSport)
								: null
						}
					/>
					{card && (
						<>
							<Row label="Talla" value={card.heightCm ? `${card.heightCm} cm` : null} />
							<Row label="Peso" value={card.weightKg ? `${card.weightKg} kg` : null} />
							<Row
								label="Nivel de experiencia"
								value={
									card.experienceLevel
										? (EXP_LABELS[card.experienceLevel] ?? card.experienceLevel)
										: null
								}
							/>
						</>
					)}
					{!card && (
						<p className="text-sm text-white/40">El alumno no tiene ficha registrada.</p>
					)}
				</CardContent>
			</Card>

			{/* Acciones — solo entrenador / admin */}
			{canManage && (
				<Card>
					<CardContent className="pt-6">
						<StatusActions
							eventId={application.event.id}
							appId={application.id}
							currentStatus={application.status}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
