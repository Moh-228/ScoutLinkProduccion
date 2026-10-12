import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { ContactRevealButton } from "@/components/ContactRevealButton";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { computeAffinityBreakdown, type AffinityEventRequirements } from "@/lib/affinity";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoachRating } from "./_components/CoachRating";
import { StatusActions } from "./_components/StatusActions";

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
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[180px_1fr] sm:gap-2">
			<span className="font-medium text-brand-primary/70">{label}</span>
			<span className="text-brand-primary">{value}</span>
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
				select: { id: true, title: true, type: true, sport: true, coachId: true, requirements: true },
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

	let affinityCriteria: { key: string; label: string; met: boolean }[] = [];
	if (application.event.type === "recruitment") {
		const specializedCard = await prisma.studentSpecializedCard.findFirst({
			where: { studentId: application.student.id, sport: application.event.sport },
			select: { data: true },
		});
		const breakdown = computeAffinityBreakdown({
			sport: application.event.sport,
			requirements: (application.event.requirements ?? {}) as AffinityEventRequirements,
			studentProfile: profile ? { gender: profile.gender } : null,
			generalCard: card ? { experienceLevel: card.experienceLevel } : null,
			specializedData: (specializedCard?.data ?? null) as Record<string, unknown> | null,
		});
		affinityCriteria = breakdown.criteria;
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow={
					<Link
						href="/dashboard/applications"
						aria-label="Volver"
						title="Volver"
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-primary/70 transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
					>
						<Icon name="arrow" size={18} />
					</Link>
				}
				title="Detalle de postulación"
			/>

			<div className="mx-auto w-full max-w-2xl space-y-6">
			{/* Estado actual */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-3">
						<CardTitle>Postulación</CardTitle>
						<ApplicationStatusBadge status={application.status} />
					</div>
				</CardHeader>
				<CardContent className="space-y-1.5">
					<Row label="Evento" value={application.event.title} />
					<Row
						label="Tipo"
						value={TYPE_LABELS[application.event.type] ?? application.event.type}
					/>
					<Row
						label="Deporte"
						value={SPORT_LABELS[application.event.sport] ?? application.event.sport}
					/>
					{application.event.type === "recruitment" && (
						<div className="pt-2">
							<p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Compatibilidad</p>
							<div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
								<div className="relative h-32 w-32 shrink-0">
									<svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
										<circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-brand-border)" strokeOpacity={0.35} strokeWidth="3.2" />
										<circle
											cx="18" cy="18" r="15.9" fill="none"
											stroke={
												application.affinityPercent >= 70
													? "var(--color-sport-football)"
													: application.affinityPercent >= 40
														? "var(--color-sport-volleyball)"
														: "var(--color-brand-surface)"
											}
											strokeWidth="3.2"
											strokeDasharray={`${application.affinityPercent} ${100 - application.affinityPercent}`}
											strokeLinecap="round"
										/>
									</svg>
									<span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-extrabold text-brand-primary">
										{application.affinityPercent}%
									</span>
								</div>
								<div className="space-y-2 text-center sm:text-left">
									<p className="text-base font-semibold text-brand-primary">
										{application.affinityPercent >= 70
											? "Alta compatibilidad con el perfil buscado."
											: application.affinityPercent >= 40
											? "Compatibilidad moderada."
											: application.affinityPercent > 0
											? "Compatibilidad baja con el perfil buscado."
											: "Sin datos suficientes para calcular."}
									</p>
									{affinityCriteria.length > 0 && (
										<ul className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
											{affinityCriteria.map((c) => (
												<li
													key={c.key}
													className={[
														"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
														c.met
															? "border-emerald-300 bg-emerald-100 text-emerald-800"
															: "border-red-300 bg-red-100 text-red-800",
													].join(" ")}
												>
													<Icon name={c.met ? "check_small" : "close_small"} size={14} />
													{c.label}
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						</div>
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
								className="rounded text-sm font-semibold text-brand-secondary hover:text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
							>
								Ver ficha completa
							</Link>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-1.5">
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
						<EmptyState size="compact" icon="id_card" title="El alumno no tiene ficha registrada." />
					)}
					{canManage && (
						<div className="grid grid-cols-1 items-start gap-2 pt-1 sm:grid-cols-[180px_1fr] sm:items-center">
							<span className="text-sm font-medium text-brand-primary/70">Correo institucional</span>
							<ContactRevealButton userId={application.student.id} className="w-fit" />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Retroalimentación del entrenador */}
			{application.coachFeedback && (
				<Card>
					<CardHeader>
						<CardTitle>Comentarios del entrenador</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm text-brand-primary">{application.coachFeedback}</p>
					</CardContent>
				</Card>
			)}

			{/* Calificación — solo entrenador (apoyo visual, no afecta funcionamiento) */}
			{isCoach && (
				<Card>
					<CardContent className="pt-6">
						<CoachRating
							eventId={application.event.id}
							appId={application.id}
							initialRating={application.coachRating}
						/>
					</CardContent>
				</Card>
			)}

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
		</div>
	);
}
