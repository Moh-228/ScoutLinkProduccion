"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FavoriteButtonProps = {
	targetType: "event" | "ficha";
	targetId: string;
	isFavorited: boolean;
};

export function FavoriteButton({ targetType, targetId, isFavorited: initialFavorited }: FavoriteButtonProps) {
	const router = useRouter();
	const [isFavorited, setIsFavorited] = useState(initialFavorited);
	const [isLoading, setIsLoading] = useState(false);

	async function toggle() {
		setIsLoading(true);
		try {
			if (isFavorited) {
				await fetch(`/api/favorites/${targetId}?type=${targetType}`, { method: "DELETE" });
			} else {
				await fetch("/api/favorites", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ targetType, targetId }),
				});
			}
			setIsFavorited((prev) => !prev);
			router.refresh();
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<button
			onClick={toggle}
			disabled={isLoading}
			title={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
			className={[
				"flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
				isFavorited
					? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30"
					: "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white",
			].join(" ")}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill={isFavorited ? "currentColor" : "none"}
				stroke="currentColor"
				strokeWidth={2}
				className="h-5 w-5"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
				/>
			</svg>
		</button>
	);
}
