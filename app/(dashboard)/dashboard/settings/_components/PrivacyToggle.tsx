"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PrivacyToggle({ initialVisible }: { initialVisible: boolean }) {
	const router = useRouter();
	const [visible, setVisible] = useState(initialVisible);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function toggle() {
		setIsLoading(true);
		setError(null);
		const next = !visible;
		try {
			const res = await fetch("/api/users/me/privacy", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contactEmailVisible: next }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "Error al actualizar.");
				return;
			}
			setVisible(next);
			router.refresh();
		} catch {
			setError("Error de red.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex items-center justify-between gap-3">
			<div>
				<p className="text-sm font-medium text-brand-primary">
					{visible ? "Permitir que me contacten" : "Correo de contacto oculto"}
				</p>
				<p className="text-xs text-brand-primary/50">
					{visible
						? "Al hacer clic en \"Contactar\", tu correo se revelará."
						: "Nadie podrá ver tu correo de contacto, ni siquiera al seleccionar \"Contactar\"."}
				</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={visible}
				onClick={toggle}
				disabled={isLoading}
				className={[
					"relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
					visible ? "bg-interaction" : "bg-brand-border",
				].join(" ")}
			>
				<span
					className={[
						"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
						visible ? "translate-x-5" : "translate-x-0.5",
					].join(" ")}
				/>
			</button>
			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}
