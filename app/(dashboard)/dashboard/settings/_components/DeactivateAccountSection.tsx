"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeactivateAccountSection() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleConfirm() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/users/me/deactivate", { method: "POST" });
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo desactivar la cuenta.");
				return;
			}
			router.push("/auth/login");
			router.refresh();
		} catch {
			setError("Error de red.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<Button
				variant="secondary"
				onClick={() => setOpen(true)}
				className="text-red-600 hover:bg-red-50"
			>
				Desactivar mi cuenta
			</Button>

			<ConfirmDialog
				open={open}
				title="Desactivar tu cuenta"
				message="Tu acceso quedará bloqueado de inmediato y solo un administrador podrá reactivarlo. ¿Deseas continuar?"
				confirmLabel="Desactivar cuenta"
				onCancel={() => setOpen(false)}
				onConfirm={handleConfirm}
				loading={loading}
				error={error}
			/>
		</div>
	);
}
