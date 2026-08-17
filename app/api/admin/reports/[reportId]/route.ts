import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { resolveReportSchema } from "@/lib/validations";

type Props = { params: Promise<{ reportId: string }> };

/** Marks a report as resolved or dismissed without touching the underlying content. */
export async function PATCH(request: Request, { params }: Props) {
	const session = await requireAdmin();
	if (!session) {
		return Response.json({ ok: false, message: "Acceso denegado." }, { status: 403 });
	}

	const { reportId } = await params;

	const report = await prisma.commentReport.findUnique({
		where: { id: reportId },
		select: { id: true, status: true, commentId: true },
	});
	if (!report) {
		return Response.json({ ok: false, message: "Reporte no encontrado." }, { status: 404 });
	}

	if (report.status !== "pending") {
		return Response.json({ ok: false, message: "Este reporte ya fue revisado." }, { status: 409 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, message: "Cuerpo inválido." }, { status: 400 });
	}

	const parsed = resolveReportSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ ok: false, message: parsed.error.flatten().fieldErrors.reason?.[0] ?? "Datos inválidos." },
			{ status: 400 },
		);
	}

	const nextStatus = parsed.data.action === "resolve" ? "resolved" : "dismissed";

	const updated = await prisma.commentReport.update({
		where: { id: reportId },
		data: {
			status: nextStatus,
			resolutionReason: parsed.data.reason,
			resolvedAt: new Date(),
			resolvedById: session.userId,
		},
	});

	await logAdminAction({
		adminId: session.userId,
		action: nextStatus === "resolved" ? "report_resolved" : "report_dismissed",
		targetType: "comment_report",
		targetId: reportId,
		reason: parsed.data.reason,
		metadata: { commentId: report.commentId },
	});

	return Response.json({ ok: true, data: updated });
}
