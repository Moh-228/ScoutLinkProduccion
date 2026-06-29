"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CardVisibilityToggle({ initialIsPublic }: { initialIsPublic: boolean }) {
	const router = useRouter();
	const [isPublic, setIsPublic] = useState(initialIsPublic);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function toggle() {
		setIsLoading(true);
		setError(null);
		const next = !isPublic;
		try {
			const res = await fetch("/api/users/me/card-visibility", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isPublic: next }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "Error al actualizar.");
				return;
			}
			setIsPublic(next);
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
				<p className="text-sm font-medium text-white">
					{isPublic ? "Ficha visible al público" : "Ficha oculta"}
				</p>
				<p className="text-xs text-white/50">
					{isPublic
						? "Entrenadores pueden encontrarte en el directorio."
						: "Solo tú puedes ver tu ficha."}
				</p>
				{error && <p className="text-xs text-red-400 mt-1">{error}</p>}
			</div>
			<button
				onClick={toggle}
				disabled={isLoading}
				role="switch"
				aria-checked={isPublic}
				className={[
					"relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
					isPublic ? "bg-[#1883ff]" : "bg-white/20",
				].join(" ")}
			>
				<span
					className={[
						"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform",
						isPublic ? "translate-x-5" : "translate-x-0.5",
					].join(" ")}
				/>
			</button>
		</div>
	);
}
