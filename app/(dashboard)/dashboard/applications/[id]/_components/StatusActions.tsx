"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

type Status = "preseleccionado" | "aceptado" | "rechazado";

type StatusActionsProps = {
	eventId: string;
	appId: string;
	currentStatus: string;
};

const ACTIONS: { status: Status; label: string; variant: "primary" | "secondary" | "ghost" }[] = [
	{ status: "preseleccionado", label: "Preseleccionar", variant: "secondary" },
	{ status: "aceptado", label: "Aceptar", variant: "primary" },
	{ status: "rechazado", label: "Rechazar", variant: "ghost" },
];

export function StatusActions({ eventId, appId, currentStatus }: StatusActionsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<Status | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleUpdate(status: Status) {
		setIsLoading(status);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/applications/${appId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "Error al actualizar estado.");
				return;
			}
			router.refresh();
		} catch {
			setError("Error de red. Intenta de nuevo.");
		} finally {
			setIsLoading(null);
		}
	}

	const availableActions = ACTIONS.filter((a) => a.status !== currentStatus);

	if (availableActions.length === 0) {
		return <p className="text-sm text-white/40">No hay más estados disponibles.</p>;
	}

	return (
		<div className="space-y-3">
			<p className="text-xs font-semibold uppercase tracking-widest text-white/40">
				Cambiar estado
			</p>
			<div className="flex flex-wrap gap-2">
				{availableActions.map((action) => (
					<Button
						key={action.status}
						variant={action.variant}
						onClick={() => handleUpdate(action.status)}
						disabled={isLoading !== null}
					>
						{isLoading === action.status ? "Guardando..." : action.label}
					</Button>
				))}
			</div>
			{error && <p className="text-sm text-red-400">{error}</p>}
		</div>
	);
}
