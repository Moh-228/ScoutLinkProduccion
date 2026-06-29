import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEventSchema } from "@/lib/validations";

type EventRouteProps = {
	params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: EventRouteProps) {
	const { id } = await params;

	const event = await prisma.event.findUnique({ where: { id } });
	if (!event) {
		return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });
	}
	return Response.json({ ok: true, data: event });
}

export async function PATCH(request: Request, { params }: EventRouteProps) {
	const { id } = await params;
	const session = await verifySession();
	if (!session) return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });

	const event = await prisma.event.findUnique({ where: { id }, select: { coachId: true } });
	if (!event) return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });

	if (event.coachId !== session.userId && session.role !== "admin") {
		return Response.json({ ok: false, message: "Sin permiso para editar este evento." }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo de solicitud inválido." }, { status: 400 });
	}

	const parsed = createEventSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 },
		);
	}

	const {
		type, sport, title, visibility, academicUnit,
		shortDescription, longDescription, locationText, mapsUrl,
		startAt, endAt, capacity, registrationDeadline,
		cost, notes, autoClose,
		format, category, minTeams, maxTeams, playersPerTeam, substitutes,
		rulesLink, gameDays, timeWindow, registrationRequirements,
		scheduleDays, startTime, endTime,
		targetTeam, level, sportsCharacteristics, whatToBring, evaluationFormat,
	} = parsed.data;

	const requirements: Record<string, unknown> = {};
	if (academicUnit) requirements.academicUnit = academicUnit;
	if (cost) requirements.cost = cost;
	if (notes) requirements.notes = notes;
	requirements.autoClose = autoClose;

	if (type === "tournament") {
		if (format) requirements.format = format;
		if (category) requirements.category = category;
		if (minTeams) requirements.minTeams = minTeams;
		if (maxTeams) requirements.maxTeams = maxTeams;
		if (playersPerTeam) requirements.playersPerTeam = playersPerTeam;
		if (substitutes !== undefined && substitutes !== "") requirements.substitutes = substitutes;
		if (rulesLink) requirements.rulesLink = rulesLink;
		if (gameDays?.length) requirements.gameDays = gameDays;
		if (timeWindow) requirements.timeWindow = timeWindow;
		if (registrationRequirements) requirements.registrationRequirements = registrationRequirements;
	}
	if (type === "training") {
		if (scheduleDays?.length) requirements.scheduleDays = scheduleDays;
		if (startTime) requirements.startTime = startTime;
		if (endTime) requirements.endTime = endTime;
	}
	if (type === "recruitment") {
		if (targetTeam) requirements.targetTeam = targetTeam;
		if (category) requirements.category = category;
		if (level) requirements.level = level;
		if (sportsCharacteristics && Object.keys(sportsCharacteristics).length > 0)
			requirements.sportsCharacteristics = sportsCharacteristics;
		if (whatToBring) requirements.whatToBring = whatToBring;
		if (evaluationFormat) requirements.evaluationFormat = evaluationFormat;
	}

	const updated = await prisma.event.update({
		where: { id },
		data: {
			type, sport, title,
			visibility: visibility ?? "public",
			shortDescription: shortDescription || null,
			longDescription: longDescription || null,
			locationText: locationText || null,
			mapsUrl: mapsUrl || null,
			startAt: startAt ? new Date(startAt) : null,
			endAt: endAt ? new Date(endAt) : null,
			capacity: capacity || null,
			registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
			requirements: requirements as never,
		},
	});

	return Response.json({ ok: true, data: { id: updated.id } });
}

export async function DELETE(_request: Request, { params }: EventRouteProps) {
	const { id } = await params;
	const session = await verifySession();
	if (!session) return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });

	const event = await prisma.event.findUnique({ where: { id }, select: { coachId: true } });
	if (!event) return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });

	if (event.coachId !== session.userId && session.role !== "admin") {
		return Response.json({ ok: false, message: "Sin permiso para eliminar este evento." }, { status: 403 });
	}

	await prisma.event.delete({ where: { id } });
	return Response.json({ ok: true });
}
