"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

const SPORTS = [
	{ label: "Básquetbol", value: "basketball" },
	{ label: "Fútbol", value: "soccer" },
	{ label: "Flag Football", value: "flag_football" },
	{ label: "Voleibol", value: "volleyball" },
];

export function InterestedSportsForm({ initialSports }: { initialSports: string[] }) {
	const router = useRouter();
	const [selected, setSelected] = useState<string[]>(initialSports);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	function toggle(value: string) {
		setSaved(false);
		setSelected((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
	}

	async function handleSave() {
		setIsSaving(true);
		setError(null);
		setSaved(false);
		try {
			const res = await fetch("/api/users/me/interests", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sports: selected }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo guardar.");
				return;
			}
			setSaved(true);
			router.refresh();
		} catch {
			setError("Error de red.");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-2">
				{SPORTS.map((sport) => (
					<label
						key={sport.value}
						className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
							selected.includes(sport.value)
								? "border-interaction bg-interaction/10 text-interaction"
								: "border-brand-border text-brand-primary/70 hover:border-brand-secondary/40"
						}`}
					>
						<input
							type="checkbox"
							className="sr-only"
							checked={selected.includes(sport.value)}
							onChange={() => toggle(sport.value)}
						/>
						<span
							className={`h-4 w-4 shrink-0 rounded border ${
								selected.includes(sport.value) ? "border-interaction bg-interaction" : "border-brand-border"
							}`}
							aria-hidden="true"
						/>
						{sport.label}
					</label>
				))}
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<div className="flex items-center gap-3">
				<Button onClick={handleSave} disabled={isSaving}>
					{isSaving ? "Guardando..." : "Guardar"}
				</Button>
				{saved && <p className="text-sm text-emerald-700">Guardado.</p>}
			</div>
		</div>
	);
}
