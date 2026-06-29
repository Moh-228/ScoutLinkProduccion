import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;
	const body = await request.json() as { action: "verify" | "reject"; rejectionReason?: string };

	if (body.action !== "verify" && body.action !== "reject") {
		return Response.json({ ok: false, message: "Acción inválida." }, { status: 400 });
	}

	const verification = await prisma.coachVerification.findUnique({
		where: { id },
		include: {
			coach: { select: { coachProfile: { select: { academicUnit: true } } } },
		},
	});
	if (!verification) {
		return Response.json({ ok: false, message: "Verificación no encontrada." }, { status: 404 });
	}

	if (body.action === "verify") {
		const academicUnit = verification.coach.coachProfile?.academicUnit;
		if (academicUnit) {
			const conflicting = await prisma.coachVerification.findFirst({
				where: {
					id: { not: id },
					sport: verification.sport,
					status: "verified",
					coach: { coachProfile: { academicUnit } },
				},
				select: { id: true, coach: { select: { coachProfile: { select: { displayName: true } } } } },
			});
			if (conflicting) {
				const name = conflicting.coach.coachProfile?.displayName ?? "Otro entrenador";
				return Response.json(
					{
						ok: false,
						message: `Ya existe un entrenador verificado para ${verification.sport} en ${academicUnit}: ${name}.`,
					},
					{ status: 409 },
				);
			}
		}
	}

	const updated = await prisma.coachVerification.update({
		where: { id },
		data: {
			status: body.action === "verify" ? "verified" : "rejected",
			rejectionReason: body.action === "reject" ? (body.rejectionReason ?? null) : null,
			reviewedBy: session.userId,
			reviewedAt: new Date(),
		},
	});

	return Response.json({ ok: true, data: updated });
}
