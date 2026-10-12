"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkReadButton({ notificationId }: { notificationId: string }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function markRead() {
		setIsLoading(true);
		await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
		setIsLoading(false);
		router.refresh();
	}

	return (
		<button
			onClick={markRead}
			disabled={isLoading}
			className="rounded text-xs font-semibold text-brand-secondary hover:text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction disabled:opacity-60"
		>
			{isLoading ? "..." : "Marcar leída"}
		</button>
	);
}

export function MarkAllReadButton({ hasUnread }: { hasUnread: boolean }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	if (!hasUnread) return null;

	async function markAll() {
		setIsLoading(true);
		await fetch("/api/notifications/read-all", { method: "POST" });
		setIsLoading(false);
		router.refresh();
	}

	return (
		<button
			onClick={markAll}
			disabled={isLoading}
			className="rounded text-sm font-semibold text-brand-secondary hover:text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction disabled:opacity-60"
		>
			{isLoading ? "..." : "Marcar todas como leídas"}
		</button>
	);
}
