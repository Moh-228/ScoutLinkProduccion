import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEventSchema } from "@/lib/validations";

export async function GET() {
	return Response.json(
		{
			ok: true,
			data: [],
			message: "Prototipo UI: usa datos mock en frontend.",
		},
		{ status: 200 },
	);
}

export async function POST(request: Request) {
	const session = await verifySession();

	if (!session || (session.role !== "coach" && session.role !== "admin")) {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
	}

	// Coaches must have at least one verified sport
	if (session.role === "coach") {
		const verifiedCount = await prisma.coachVerification.count({
			where: { coachId: session.userId, status: "verified" },
		});
		if (verifiedCount === 0) {
			return Response.json(
				{
					ok: false,
					message:
						"Debes tener al menos un deporte verificado para crear eventos.",
				},
				{ status: 403 },
			);
		}
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

	// Coaches can only create events for their verified sports
	if (session.role === "coach") {
		const verifiedSport = await prisma.coachVerification.findFirst({
			where: { coachId: session.userId, status: "verified", sport: parsed.data.sport as never },
			select: { id: true },
		});
		if (!verifiedSport) {
			return Response.json(
				{
					ok: false,
					message:
						"Solo puedes crear eventos del deporte en que tienes verificación aprobada.",
				},
				{ status: 403 },
			);
		}
	}

	const {
		type,
		sport,
		title,
		visibility,
		academicUnit,
		shortDescription,
		longDescription,
		locationText,
		mapsUrl,
		startAt,
		endAt,
		capacity,
		registrationDeadline,
		cost,
		notes,
		autoClose,
		// tournament
		format,
		category,
		minTeams,
		maxTeams,
		playersPerTeam,
		substitutes,
		rulesLink,
		gameDays,
		timeWindow,
		registrationRequirements,
		// training
		scheduleDays,
		startTime,
		endTime,
		// recruitment
		targetTeam,
		level,
		sportsCharacteristics,
		whatToBring,
		evaluationFormat,
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

	try {
		const event = await prisma.event.create({
			data: {
				coachId: session.userId,
				type,
				sport,
				title,
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
				status: "open",
			},
		});

		return Response.json({ ok: true, data: { id: event.id } }, { status: 201 });
	} catch {
		return Response.json(
			{ ok: false, message: "No se pudo crear el evento." },
			{ status: 500 },
		);
	}
}
