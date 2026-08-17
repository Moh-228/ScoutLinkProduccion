"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

type ApplyButtonProps = {
	eventId: string;
	eventTitle: string;
	eventIsOpen: boolean;
	existingApplication: { status: string } | null;
	missingSpecializedCard?: boolean;
};

export function ApplyButton({
	eventId,
	eventTitle,
	eventIsOpen,
	existingApplication,
	missingSpecializedCard = false,
}: ApplyButtonProps) {
	const router = useRouter();
	const [showModal, setShowModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const canWithdraw = existingApplication?.status === "postulado";
	const alreadyApplied = existingApplication !== null;

	async function handleApply() {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/apply`, { method: "POST" });
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "Error al postularse.");
				return;
			}
			setShowModal(false);
			router.refresh();
		} catch {
			setError("Error de red. Intenta de nuevo.");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleWithdraw() {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/apply`, { method: "DELETE" });
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "Error al retirar postulación.");
				return;
			}
			router.refresh();
		} catch {
			setError("Error de red. Intenta de nuevo.");
		} finally {
			setIsLoading(false);
		}
	}

	// Already applied but can't withdraw (preseleccionado / aceptado / rechazado)
	if (alreadyApplied && !canWithdraw) {
		const STATUS_LABELS: Record<string, string> = {
			preseleccionado: "Preseleccionado",
			aceptado: "Invitado",
			rechazado: "Descartado",
		};
		return (
			<p className="text-sm text-brand-primary/70">
				Ya estás postulado —{" "}
				<span className="font-semibold text-brand-primary">
					{STATUS_LABELS[existingApplication.status] ?? existingApplication.status}
				</span>
			</p>
		);
	}

	if (missingSpecializedCard && !alreadyApplied) {
		return (
			<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
				<p className="font-semibold">Ficha deportiva especializada requerida</p>
				<p className="mt-1 text-amber-800/80">
					Los eventos de reclutamiento requieren que tengas una ficha deportiva
					especializada del deporte correspondiente.{" "}
					<Link href="/onboarding/student/specialized" className="font-semibold underline hover:text-brand-primary">
						Completar ficha
					</Link>
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center gap-3">
				{canWithdraw ? (
					<Button variant="secondary" onClick={handleWithdraw} disabled={isLoading}>
						{isLoading ? "Retirando..." : "Retirar postulación"}
					</Button>
				) : eventIsOpen ? (
					<Button onClick={() => setShowModal(true)}>Postularme</Button>
				) : null}
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>

			{/* Modal de confirmación */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl ring-1 ring-brand-border">
						<h2 className="text-base font-semibold text-brand-primary">Confirmar postulación</h2>
						<p className="mt-2 text-sm text-brand-primary/70">
							¿Deseas postularte al evento{" "}
							<span className="font-semibold text-brand-primary">&quot;{eventTitle}&quot;</span>? El
							entrenador recibirá tu solicitud y podrá ver tu ficha.
						</p>
						{error && <p className="mt-3 text-sm text-red-600">{error}</p>}
						<div className="mt-6 flex justify-end gap-3">
							<Button
								variant="secondary"
								onClick={() => {
									setShowModal(false);
									setError(null);
								}}
								disabled={isLoading}
							>
								Cancelar
							</Button>
							<Button onClick={handleApply} disabled={isLoading}>
								{isLoading ? "Enviando..." : "Confirmar"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
