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
			className="text-xs font-semibold text-[#1883ff] hover:underline disabled:opacity-60"
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
			className="text-sm font-semibold text-[#1883ff] hover:underline disabled:opacity-60"
		>
			{isLoading ? "..." : "Marcar todas como leídas"}
		</button>
	);
}
