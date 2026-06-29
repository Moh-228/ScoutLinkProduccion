import { createHash } from "crypto";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = resetPasswordSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { token, password } = parsed.data;

		const tokenHash = createHash("sha256").update(token).digest("hex");

		const resetToken = await prisma.passwordResetToken.findUnique({
			where: { tokenHash },
			include: { user: { select: { id: true, isActive: true } } },
		});

		if (
			!resetToken ||
			resetToken.usedAt !== null ||
			resetToken.expiresAt < new Date() ||
			!resetToken.user.isActive
		) {
			return Response.json(
				{ ok: false, message: "El enlace es inválido o ha expirado. Solicita uno nuevo." },
				{ status: 400 },
			);
		}

		const passwordHash = await hash(password, 12);

		await prisma.$transaction([
			prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
			prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
		]);

		return Response.json({ ok: true, message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
	} catch {
		return Response.json({ ok: false, message: "No se pudo actualizar la contraseña." }, { status: 500 });
	}
}
