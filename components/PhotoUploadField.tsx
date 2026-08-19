"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { Avatar } from "@/components/Avatar";

type PhotoUploadFieldProps = {
	id: string;
	label: string;
	displayName: string;
	value: string;
	onChange: (key: string) => void;
};

export function PhotoUploadField({ id, label, displayName, value, onChange }: PhotoUploadFieldProps) {
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
			const res = await fetch("/api/uploads/photo", { method: "POST", body: formData });
			const result = await res.json();

			if (!res.ok || !result.ok) {
				setStatus("error");
				setError(result.message || "No se pudo subir la foto.");
				return;
			}

			setStatus("idle");
			onChange(result.data.key as string);
		} catch {
			setStatus("error");
			setError("No se pudo conectar con el servidor.");
		} finally {
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	return (
		<div className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
			<span>{label} (opcional)</span>
			<div className="flex items-center gap-3">
				<Avatar photoKey={value} name={displayName || "?"} size={64} />
				<label
					htmlFor={id}
					className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-semibold text-brand-primary shadow-sm transition-colors hover:bg-brand-background"
				>
					{status === "uploading" ? "Subiendo..." : value ? "Cambiar foto" : "Seleccionar foto"}
				</label>
				<input
					ref={inputRef}
					id={id}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					className="sr-only"
					onChange={handleFileChange}
					disabled={status === "uploading"}
				/>
			</div>
			<p className="text-xs font-normal text-brand-primary/70">JPG, PNG o WEBP. Máximo 5 MB.</p>
			{error ? (
				<p className="text-xs font-normal text-red-600" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}
