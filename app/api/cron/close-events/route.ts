import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	const cronSecret = process.env.CRON_SECRET;
	if (cronSecret) {
		const auth = request.headers.get("authorization");
		if (auth !== `Bearer ${cronSecret}`) {
			return Response.json({ ok: false, message: "No autorizado." }, { status: 401 });
		}
	}

	const now = new Date();

	const { count } = await prisma.event.updateMany({
		where: {
			status: "open",
			registrationDeadline: { lte: now },
		},
		data: { status: "closed" },
	});

	return Response.json({ ok: true, closed: count });
}
