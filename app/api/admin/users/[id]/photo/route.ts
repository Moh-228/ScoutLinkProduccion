import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { createNotificationIfEnabled } from "@/lib/notifications";
import { deleteObjectFromS3 } from "@/lib/s3";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

// Lets admins moderate profile photos unsuitable for the platform.
export async function DELETE(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	const body = await request.json().catch(() => ({})) as { reason?: string };
	const reason = (body.reason ?? "").trim();
	if (reason.length < 3) {
		return Response.json({ ok: false, message: "Describe el motivo del reporte." }, { status: 400 });
	}

	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			email: true,
			role: true,
			studentProfile: { select: { photoUrl: true } },
			coachProfile: { select: { photoUrl: true } },
		},
	});
	if (!user) {
		return Response.json({ ok: false, message: "Usuario no encontrado." }, { status: 404 });
	}

	const photoKey = user.studentProfile?.photoUrl ?? user.coachProfile?.photoUrl ?? null;
	if (!photoKey) {
		return Response.json({ ok: false, message: "Este usuario no tiene foto de perfil." }, { status: 400 });
	}

	if (user.role === "student") {
		await prisma.studentProfile.update({ where: { userId: id }, data: { photoUrl: null } });
	} else if (user.role === "coach") {
		await prisma.coachProfile.update({ where: { userId: id }, data: { photoUrl: null } });
	}

	await logAdminAction({
		adminId: session.userId,
		action: "profile_photo_removed",
		targetType: "user",
		targetId: id,
		reason,
		metadata: { email: user.email },
	});

	if (id !== session.userId) {
		await createNotificationIfEnabled({
			userId: id,
			type: "profile_photo_removed",
			prefKey: "moderationAlerts",
			payload: {
				title: "Foto de perfil eliminada",
				message: `Tu foto de perfil fue eliminada por un administrador. Motivo: ${reason}`,
			},
		});
	}

	// Best-effort cleanup; the DB update above is what actually removes the photo from the app.
	try {
		await deleteObjectFromS3(photoKey);
	} catch (err) {
		console.error("[admin/users/photo]", err);
	}

	return Response.json({ ok: true });
}
