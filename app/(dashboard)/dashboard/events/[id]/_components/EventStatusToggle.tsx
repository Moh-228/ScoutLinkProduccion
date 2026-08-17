"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

type EventStatusToggleProps = {
	eventId: string;
	initialStatus: "open" | "closed";
};

/** Lets the organizer open or close applications for their event. */
export function EventStatusToggle({ eventId, initialStatus }: EventStatusToggleProps) {
	const router = useRouter();
	const [status, setStatus] = useState(initialStatus);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function toggle() {
		setIsLoading(true);
		setError(null);
		const next = status === "open" ? "closed" : "open";
		try {
			const res = await fetch(`/api/events/${eventId}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: next }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "Error al actualizar.");
				return;
			}
			setStatus(next);
			router.refresh();
		} catch {
			setError("Error de red.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-end gap-1">
			<Button variant="secondary" onClick={toggle} disabled={isLoading}>
				{isLoading ? "Guardando..." : status === "open" ? "Cerrar evento" : "Abrir evento"}
			</Button>
			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}
