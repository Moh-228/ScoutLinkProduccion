import { prisma } from "@/lib/prisma";

/**
 * Per-type notification toggles. Not every key applies to every role —
 * students use newRecruitments/applicationStatus/postActivity/contactInteractions,
 * coaches use applicationsOnEvents/eventActivity/contactInteractions.
 */
export type NotificationPrefKey =
	| "newRecruitments"
	| "applicationStatus"
	| "postActivity"
	| "applicationsOnEvents"
	| "eventActivity"
	| "contactInteractions";

/** A user receives a notification unless they turned notifications off globally or disabled this specific type. */
export async function isNotificationEnabled(userId: string, key: NotificationPrefKey): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { notificationsEnabled: true, notificationPreferences: true },
	});
	if (!user || !user.notificationsEnabled) return false;
	const prefs = (user.notificationPreferences ?? {}) as Record<string, boolean>;
	return prefs[key] !== false;
}

/** Creates a notification only if the recipient has this type enabled. Returns null if suppressed. */
export async function createNotificationIfEnabled(params: {
	userId: string;
	type: string;
	prefKey: NotificationPrefKey;
	payload: Record<string, unknown>;
}) {
	const enabled = await isNotificationEnabled(params.userId, params.prefKey);
	if (!enabled) return null;
	return prisma.notification.create({
		data: { userId: params.userId, type: params.type, payload: params.payload as never },
	});
}
