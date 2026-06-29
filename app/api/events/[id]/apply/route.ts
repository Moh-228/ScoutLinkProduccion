import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteProps) {
	const { id: eventId } = await params;
	const session = await verifySession();

	if (!session || session.role !== "student") {
		return Response.json(
			{ ok: false, message: "Solo los alumnos pueden postularse." },
			{ status: 403 },
		);
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId },
		select: { id: true, status: true, capacity: true, applicationsCount: true, title: true, type: true, sport: true },
	});

	if (!event) {
		return Response.json({ ok: false, message: "Evento no encontrado." }, { status: 404 });
	}

	if (event.status !== "open") {
		return Response.json({ ok: false, message: "El evento ya está cerrado." }, { status: 409 });
	}

	if (event.capacity !== null && event.applicationsCount >= event.capacity) {
		return Response.json(
			{ ok: false, message: "El evento ya alcanzó su cupo máximo." },
			{ status: 409 },
		);
	}

	// Recruitment events require a specialized card for the event's sport
	if (event.type === "recruitment") {
		const specializedCard = await prisma.studentSpecializedCard.findFirst({
			where: { studentId: session.userId, sport: event.sport as never },
			select: { id: true },
		});
		if (!specializedCard) {
			return Response.json(
				{
					ok: false,
					message:
						"Para postularte a un evento de reclutamiento necesitas una ficha deportiva especializada del deporte correspondiente. Completa tu perfil en el onboarding.",
				},
				{ status: 403 },
			);
		}
	}

	const existing = await prisma.eventApplication.findUnique({
		where: { eventId_studentId: { eventId, studentId: session.userId } },
		select: { id: true },
	});

	if (existing) {
		return Response.json(
			{ ok: false, message: "Ya estás postulado a este evento." },
			{ status: 409 },
		);
	}

	const [application] = await prisma.$transaction([
		prisma.eventApplication.create({
			data: { eventId, studentId: session.userId },
		}),
		prisma.event.update({
			where: { id: eventId },
			data: { applicationsCount: { increment: 1 } },
		}),
		prisma.notification.create({
			data: {
				userId: session.userId,
				type: "application_sent",
				payload: {
					title: "Postulación enviada",
					message: `Tu postulación al evento "${event.title}" fue registrada correctamente.`,
					eventId,
				},
			},
		}),
	]);

	return Response.json({ ok: true, data: application }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
	const { id: eventId } = await params;
	const session = await verifySession();

	if (!session || session.role !== "student") {
		return Response.json({ ok: false, message: "No autorizado." }, { status: 403 });
	}

	const application = await prisma.eventApplication.findUnique({
		where: { eventId_studentId: { eventId, studentId: session.userId } },
		select: { id: true, status: true },
	});

	if (!application) {
		return Response.json(
			{ ok: false, message: "No tienes una postulación en este evento." },
			{ status: 404 },
		);
	}

	if (application.status !== "postulado") {
		return Response.json(
			{
				ok: false,
				message: "Solo puedes retirar tu postulación cuando está en estado 'Postulado'.",
			},
			{ status: 409 },
		);
	}

	await prisma.$transaction([
		prisma.eventApplication.delete({ where: { id: application.id } }),
		prisma.event.update({
			where: { id: eventId },
			data: { applicationsCount: { decrement: 1 } },
		}),
	]);

	return Response.json({ ok: true });
}
