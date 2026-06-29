import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = registerSchema.safeParse(body);

		if (!parsed.success) {
			return Response.json(
				{
					ok: false,
					message: "Datos de registro inválidos.",
					errors: parsed.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { email, password, role, fullName } = parsed.data;
		const passwordHash = await hash(password, 12);

		const user = await prisma.user.create({
			data: {
				email,
				passwordHash,
				role,
				...(role === "student"
					? { studentProfile: { create: { fullName } } }
					: { coachProfile: { create: { displayName: fullName } } }),
			},
			select: { id: true, email: true, role: true, createdAt: true },
		});

		await createSession({ userId: user.id, email: user.email, role: user.role, onboardingCompleted: false });

		return Response.json(
			{ ok: true, message: "Usuario registrado correctamente.", data: { ...user, onboardingCompleted: false } },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
			return Response.json(
				{ ok: false, message: "El correo ya está registrado." },
				{ status: 409 },
			);
		}

		return Response.json(
			{ ok: false, message: "No se pudo completar el registro." },
			{ status: 500 },
		);
	}
}
