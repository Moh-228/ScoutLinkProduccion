import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteProps) {
	const { id } = await params;
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autenticado." }, { status: 401 });
	}

	const notification = await prisma.notification.findUnique({
		where: { id },
		select: { id: true, userId: true },
	});

	if (!notification) {
		return Response.json({ ok: false, message: "Notificación no encontrada." }, { status: 404 });
	}

	if (notification.userId !== session.userId) {
		return Response.json({ ok: false, message: "Sin permiso." }, { status: 403 });
	}

	const updated = await prisma.notification.update({
		where: { id },
		data: { readAt: new Date() },
	});

	return Response.json({ ok: true, data: updated });
}
