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
	{ status: "aceptado", label: "Invitar", variant: "primary" },
	{ status: "rechazado", label: "Descartar", variant: "ghost" },
];

export function StatusActions({ eventId, appId, currentStatus }: StatusActionsProps) {
	const router = useRouter();
	const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
	const [feedback, setFeedback] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleConfirm() {
		if (!pendingStatus) return;
		if (feedback.trim().length === 0) {
			setError("Debes escribir un comentario de retroalimentación para el postulado.");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/applications/${appId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: pendingStatus, feedback: feedback.trim() }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "Error al actualizar estado.");
				return;
			}
			setPendingStatus(null);
			setFeedback("");
			router.refresh();
		} catch {
			setError("Error de red. Intenta de nuevo.");
		} finally {
			setIsLoading(false);
		}
	}

	const availableActions = ACTIONS.filter((a) => a.status !== currentStatus);

	if (availableActions.length === 0) {
		return <p className="text-sm text-brand-primary/50">No hay más estados disponibles.</p>;
	}

	return (
		<div className="space-y-3">
			<p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/50">
				Cambiar estado
			</p>
			<div className="flex flex-wrap gap-2">
				{availableActions.map((action) => (
					<Button
						key={action.status}
						variant={action.variant}
						onClick={() => {
							setPendingStatus(action.status);
							setError(null);
						}}
						disabled={isLoading}
					>
						{action.label}
					</Button>
				))}
			</div>
			{pendingStatus && (
				<div className="space-y-2 rounded-lg border border-brand-border/60 bg-brand-background p-3">
					<label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
						<span>Comentario / retroalimentación para el postulado (obligatorio)</span>
						<textarea
							rows={3}
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							placeholder="Explica el motivo de este cambio de estado..."
							className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40"
						/>
					</label>
					<div className="flex gap-2">
						<Button onClick={handleConfirm} disabled={isLoading || feedback.trim().length === 0}>
							{isLoading ? "Guardando..." : "Confirmar cambio"}
						</Button>
						<Button
							variant="ghost"
							onClick={() => {
								setPendingStatus(null);
								setFeedback("");
								setError(null);
							}}
							disabled={isLoading}
						>
							Cancelar
						</Button>
					</div>
				</div>
			)}
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
}
