"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/Icon";

type CoachRatingProps = {
	eventId: string;
	appId: string;
	initialRating: number | null;
};

// Visual aid only for the coach's own reference — never used in affinity/ranking calculations.
export function CoachRating({ eventId, appId, initialRating }: CoachRatingProps) {
	const router = useRouter();
	const [rating, setRating] = useState(initialRating ?? 0);
	const [hovered, setHovered] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function setStars(value: number) {
		const next = value === rating ? 0 : value;
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/applications/${appId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ coachRating: next === 0 ? null : next }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo guardar la calificación.");
				return;
			}
			setRating(next);
			router.refresh();
		} catch {
			setError("Error de red. Intenta de nuevo.");
		} finally {
			setIsLoading(false);
		}
	}

	const display = hovered ?? rating;

	return (
		<div className="space-y-1.5">
			<p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
				Tu calificación (solo visible para ti)
			</p>
			<div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación del postulado">
				{[1, 2, 3, 4, 5].map((value) => (
					<button
						key={value}
						type="button"
						role="radio"
						aria-checked={rating === value}
						aria-label={`${value} estrella${value > 1 ? "s" : ""}`}
						disabled={isLoading}
						onMouseEnter={() => setHovered(value)}
						onMouseLeave={() => setHovered(null)}
						onClick={() => setStars(value)}
						className="rounded p-0.5 text-brand-border transition-transform hover:scale-110 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction motion-reduce:transform-none"
					>
						<Icon
							name="star"
							size={22}
							className={value <= display ? "text-amber-500" : "text-brand-border"}
						/>
					</button>
				))}
				{rating > 0 && <span className="ml-1 text-sm font-medium text-brand-primary/70">{rating}/5</span>}
			</div>
			{error && <p className="text-xs text-red-600">{error}</p>}
			<p className="text-xs text-brand-primary/70">Es solo apoyo visual; no afecta la afinidad ni el estado de la postulación.</p>
		</div>
	);
}
