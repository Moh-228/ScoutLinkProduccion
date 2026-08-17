import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	// Prevent admin from modifying their own account via this endpoint
	if (id === session.userId) {
		return Response.json({ ok: false, message: "No puedes modificar tu propia cuenta desde aquí." }, { status: 400 });
	}

	const body = await request.json() as Record<string, unknown>;
	const { isActive, role } = body;

	const data: Record<string, unknown> = {};
	if (typeof isActive === "boolean") data.isActive = isActive;
	if (role === "student" || role === "coach" || role === "admin") data.role = role;

	if (Object.keys(data).length === 0) {
		return Response.json({ ok: false, message: "Sin cambios válidos." }, { status: 400 });
	}

	const before = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true, isActive: true } });
	if (!before) {
		return Response.json({ ok: false, message: "Usuario no encontrado." }, { status: 404 });
	}

	const updated = await prisma.user.update({
		where: { id },
		data,
		select: { id: true, email: true, role: true, isActive: true },
	});

	if (typeof data.role === "string" && data.role !== before.role) {
		await logAdminAction({
			adminId: session.userId,
			action: "role_change",
			targetType: "user",
			targetId: id,
			metadata: { email: before.email, fromRole: before.role, toRole: data.role },
		});
	}

	if (typeof data.isActive === "boolean" && data.isActive !== before.isActive) {
		await logAdminAction({
			adminId: session.userId,
			action: "user_status_change",
			targetType: "user",
			targetId: id,
			metadata: { email: before.email, isActive: data.isActive },
		});
	}

	return Response.json({ ok: true, data: updated });
}

export async function DELETE(_request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { id } = await params;

	if (id === session.userId) {
		return Response.json({ ok: false, message: "No puedes eliminar tu propia cuenta." }, { status: 400 });
	}

	// Prevent deleting other admins
	const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
	if (!target) {
		return Response.json({ ok: false, message: "Usuario no encontrado." }, { status: 404 });
	}
	if (target.role === "admin") {
		return Response.json({ ok: false, message: "No se puede eliminar a otro administrador." }, { status: 403 });
	}

	await prisma.user.delete({ where: { id } });

	return Response.json({ ok: true, message: "Usuario eliminado." });
}
