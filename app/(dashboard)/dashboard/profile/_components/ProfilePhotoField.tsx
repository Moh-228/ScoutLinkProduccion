"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/Avatar";

export function ProfilePhotoField({ photoUrl, displayName }: { photoUrl: string | null; displayName: string }) {
	const router = useRouter();
	const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
	const [error, setError] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setStatus("uploading");
		setError("");

		const formData = new FormData();
		formData.append("file", file);

		try {
			const uploadRes = await fetch("/api/uploads/photo", { method: "POST", body: formData });
			const uploadResult = await uploadRes.json();
			if (!uploadRes.ok || !uploadResult.ok) {
				setStatus("error");
				setError(uploadResult.message || "No se pudo subir la foto.");
				return;
			}

			const saveRes = await fetch("/api/users/me/photo", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ photoUrl: uploadResult.data.key }),
			});
			const saveResult = await saveRes.json();
			if (!saveRes.ok || !saveResult.ok) {
				setStatus("error");
				setError(saveResult.message || "No se pudo guardar la foto.");
				return;
			}

			setStatus("idle");
			router.refresh();
		} catch {
			setStatus("error");
			setError("No se pudo conectar con el servidor.");
		} finally {
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	return (
		<div className="flex items-center gap-4">
			<div className="relative">
				<Avatar photoKey={photoUrl} name={displayName} size={96} />
				<label
					htmlFor="profile-photo-input"
					aria-label="Cambiar foto de perfil"
					title="Cambiar foto de perfil"
					className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-brand-primary text-white shadow-sm transition-colors hover:bg-brand-primary/90"
				>
					{status === "uploading" ? (
						<span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
					) : (
						<svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor">
							<path d="M480-336q60 0 102-42t42-102q0-60-42-102t-102-42q-60 0-102 42t-42 102q0 60 42 102t102 42Zm0-72q-30 0-51-21t-21-51q0-30 21-51t51-21q30 0 51 21t21 51q0 30-21 51t-51 21ZM160-192q-33 0-56.5-23.5T80-272v-416q0-33 23.5-56.5T160-768h126l74-80h240l74 80h126q33 0 56.5 23.5T880-688v416q0 33-23.5 56.5T800-192H160Z" />
						</svg>
					)}
				</label>
				<input
					ref={inputRef}
					id="profile-photo-input"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					className="sr-only"
					onChange={handleFileChange}
					disabled={status === "uploading"}
				/>
			</div>
			{error && (
				<p className="text-xs text-red-600" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
