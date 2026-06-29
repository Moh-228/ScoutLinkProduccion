import { compare } from "bcryptjs";

import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = loginSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{ ok: false, message: "Credenciales inválidas.", errors: parsed.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { email, password } = parsed.data;

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, role: true, isActive: true, passwordHash: true, onboardingCompleted: true },
		});

		if (!user) {
			return Response.json(
				{ ok: false, message: "Correo o contraseña incorrectos." },
				{ status: 401 },
			);
		}

		if (!user.isActive) {
			return Response.json(
				{ ok: false, message: "Tu cuenta ha sido desactivada." },
				{ status: 403 },
			);
		}

		const isValidPassword = await compare(password, user.passwordHash);

		if (!isValidPassword) {
			return Response.json(
				{ ok: false, message: "Correo o contraseña incorrectos." },
				{ status: 401 },
			);
		}

		await createSession({ userId: user.id, email: user.email, role: user.role, onboardingCompleted: user.onboardingCompleted });

		return Response.json({
			ok: true,
			message: "Inicio de sesión exitoso.",
			data: { id: user.id, email: user.email, role: user.role, onboardingCompleted: user.onboardingCompleted },
		});
	} catch {
		return Response.json(
			{ ok: false, message: "No se pudo iniciar sesión." },
			{ status: 500 },
		);
	}
}
