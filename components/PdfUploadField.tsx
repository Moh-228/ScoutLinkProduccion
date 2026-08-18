"use client";

import { useRef, useState, type ChangeEvent } from "react";

type PdfUploadFieldProps = {
	id: string;
	label: string;
	kind: "inscription-proof" | "medical-insurance" | "coach-certification";
	value: string;
	onChange: (key: string) => void;
	helpText?: string;
	required?: boolean;
};

export function PdfUploadField({ id, label, kind, value, onChange, helpText, required }: PdfUploadFieldProps) {
	const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
	const [error, setError] = useState("");
	const [fileName, setFileName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.type !== "application/pdf") {
			setStatus("error");
			setError("El archivo debe ser un PDF.");
			if (inputRef.current) inputRef.current.value = "";
			return;
		}

		setStatus("uploading");
		setError("");

		const formData = new FormData();
		formData.append("file", file);
		formData.append("kind", kind);

		try {
			const res = await fetch("/api/uploads/document", { method: "POST", body: formData });
			const result = await res.json();

			if (!res.ok || !result.ok) {
				setStatus("error");
				setError(result.message || "No se pudo subir el archivo.");
				return;
			}

			setFileName(file.name);
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
			<span>
				{label} {required ? <span className="text-red-500">*</span> : null}
			</span>
			<div className="flex flex-wrap items-center gap-3">
				<label
					htmlFor={id}
					className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm font-semibold text-brand-primary shadow-sm transition-colors hover:bg-brand-background"
				>
					{status === "uploading" ? "Subiendo..." : value ? "Reemplazar PDF" : "Seleccionar PDF"}
				</label>
				<input
					ref={inputRef}
					id={id}
					type="file"
					accept="application/pdf"
					className="sr-only"
					onChange={handleFileChange}
					disabled={status === "uploading"}
				/>
				{value && status !== "uploading" ? (
					<a
						href={`/api/files/document?key=${encodeURIComponent(value)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-brand-secondary underline hover:text-brand-primary"
					>
						Ver {fileName || "documento cargado"}
					</a>
				) : null}
			</div>
			{helpText ? <p className="text-xs font-normal text-brand-primary/70">{helpText}</p> : null}
			{error ? (
				<p className="text-xs font-normal text-red-600" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}
