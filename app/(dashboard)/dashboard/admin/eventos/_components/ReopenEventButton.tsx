"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

export function ReopenEventButton({ eventId }: { eventId: string }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleReopen() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "open" }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo reabrir el evento.");
				return;
			}
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-end gap-1">
			<Button variant="secondary" onClick={handleReopen} disabled={loading} className="px-3 py-1 text-xs">
				{loading ? "Reabriendo..." : "Reabrir convocatoria"}
			</Button>
			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}
