import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteProps = { params: Promise<{ targetId: string }> };

export async function DELETE(request: Request, { params }: RouteProps) {
	const { targetId } = await params;
	const session = await verifySession();
	if (!session) {
		return Response.json({ ok: false, message: "No autenticado." }, { status: 401 });
	}

	const url = new URL(request.url);
	const targetType = url.searchParams.get("type");

	if (targetType !== "event" && targetType !== "ficha") {
		return Response.json({ ok: false, message: "Tipo de favorito inválido." }, { status: 400 });
	}

	const existing = await prisma.favorite.findUnique({
		where: {
			userId_targetType_targetId: {
				userId: session.userId,
				targetType,
				targetId,
			},
		},
		select: { id: true },
	});

	if (!existing) {
		return Response.json({ ok: false, message: "Favorito no encontrado." }, { status: 404 });
	}

	await prisma.favorite.delete({ where: { id: existing.id } });

	return Response.json({ ok: true });
}
