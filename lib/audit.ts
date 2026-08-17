import { prisma } from "@/lib/prisma";

export type AdminAction =
	| "role_change"
	| "user_status_change"
	| "verification_review"
	| "comment_removed"
	| "report_resolved"
	| "report_dismissed"
	| "event_reopened"
	| "event_closed"
	| "application_status_change";

/** Records an administrative action for the audit history view. */
export function logAdminAction(params: {
	adminId: string;
	action: AdminAction;
	targetType: string;
	targetId?: string;
	reason?: string | null;
	metadata?: Record<string, unknown>;
}) {
	return prisma.adminAuditLog.create({
		data: {
			adminId: params.adminId,
			action: params.action,
			targetType: params.targetType,
			targetId: params.targetId ?? null,
			reason: params.reason ?? null,
			metadata: (params.metadata ?? {}) as never,
		},
	});
}
