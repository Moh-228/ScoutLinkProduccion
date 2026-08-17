"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

type PrefKey =
	| "newRecruitments"
	| "applicationStatus"
	| "postActivity"
	| "applicationsOnEvents"
	| "eventActivity"
	| "contactInteractions";

const STUDENT_TYPES: { key: PrefKey; label: string }[] = [
	{ key: "newRecruitments", label: "Nuevas convocatorias" },
	{ key: "applicationStatus", label: "Cambios en el estado de postulaciones" },
	{ key: "postActivity", label: "Actividad en publicaciones" },
	{ key: "contactInteractions", label: "Interacciones de contacto" },
];

const COACH_TYPES: { key: PrefKey; label: string }[] = [
	{ key: "applicationsOnEvents", label: "Postulaciones en mis eventos" },
	{ key: "eventActivity", label: "Actividad en mis eventos" },
	{ key: "contactInteractions", label: "Interacciones de contacto" },
];

function Toggle({
	checked,
	onChange,
	disabled,
	label,
	description,
}: {
	checked: boolean;
	onChange: () => void;
	disabled?: boolean;
	label: string;
	description?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-3 py-1.5">
			<div>
				<p className="text-sm font-medium text-brand-primary">{label}</p>
				{description && <p className="text-xs text-brand-primary/50">{description}</p>}
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={onChange}
				disabled={disabled}
				className={[
					"relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40",
					checked ? "bg-interaction" : "bg-brand-border",
				].join(" ")}
			>
				<span
					className={[
						"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
						checked ? "translate-x-5" : "translate-x-0.5",
					].join(" ")}
				/>
			</button>
		</div>
	);
}

export function NotificationPreferencesForm({
	role,
	initialEnabled,
	initialPreferences,
}: {
	role: "student" | "coach";
	initialEnabled: boolean;
	initialPreferences: Record<string, boolean>;
}) {
	const router = useRouter();
	const [enabled, setEnabled] = useState(initialEnabled);
	const [prefs, setPrefs] = useState<Record<string, boolean>>(initialPreferences);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const types = role === "student" ? STUDENT_TYPES : COACH_TYPES;

	function togglePref(key: PrefKey) {
		setSaved(false);
		setPrefs((prev) => ({ ...prev, [key]: prev[key] === false ? true : false }));
	}

	async function handleSave() {
		setIsSaving(true);
		setError(null);
		setSaved(false);
		try {
			const res = await fetch("/api/users/me/notifications", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ notificationsEnabled: enabled, preferences: prefs }),
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
		<div className="space-y-1">
			<Toggle
				checked={enabled}
				onChange={() => { setEnabled((v) => !v); setSaved(false); }}
				label="Notificaciones activadas"
				description="Interruptor general para todos los avisos."
			/>
			<div className="border-t border-brand-border/50 pt-1">
				{types.map((t) => (
					<Toggle
						key={t.key}
						checked={enabled && prefs[t.key] !== false}
						onChange={() => togglePref(t.key)}
						disabled={!enabled}
						label={t.label}
					/>
				))}
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<div className="flex items-center gap-3 pt-2">
				<Button onClick={handleSave} disabled={isSaving}>
					{isSaving ? "Guardando..." : "Guardar"}
				</Button>
				{saved && <p className="text-sm text-emerald-700">Guardado.</p>}
			</div>
		</div>
	);
}
