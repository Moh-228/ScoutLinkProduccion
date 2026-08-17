"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/Badge";

type ReportStatus = "pending" | "resolved" | "dismissed";

function fmt(iso: string) {
	return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const STATUS_BADGE: Record<ReportStatus, { label: string; variant: "warning" | "success" | "neutral" }> = {
	pending: { label: "Pendiente", variant: "warning" },
	resolved: { label: "Resuelto", variant: "success" },
	dismissed: { label: "Descartado", variant: "neutral" },
};

function ReasonDialog({
	open,
	title,
	confirmLabel,
	onCancel,
	onSubmit,
	loading,
	error,
}: {
	open: boolean;
	title: string;
	confirmLabel: string;
	onCancel: () => void;
	onSubmit: (reason: string) => void;
	loading: boolean;
	error: string | null;
}) {
	const [reason, setReason] = useState("");

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-brand-border">
				<h2 className="text-base font-semibold text-brand-primary">{title}</h2>
				<p className="mt-2 text-sm text-brand-primary/70">Este motivo quedará registrado en el historial administrativo.</p>
				<textarea
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={3}
					placeholder="Describe el motivo de esta acción..."
					className="mt-3 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40"
				/>
				{error && (
					<p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
						{error}
					</p>
				)}
				<div className="mt-4 flex justify-end gap-3">
					<button type="button" onClick={onCancel} disabled={loading} className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-primary ring-1 ring-brand-border hover:bg-brand-background disabled:cursor-not-allowed disabled:opacity-60">
						Cancelar
					</button>
					<button
						type="button"
						onClick={() => onSubmit(reason)}
						disabled={loading || reason.trim().length < 3}
						className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loading ? "Enviando..." : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

export function ReportRow({
	reportId,
	commentId,
	eventId,
	eventTitle,
	commentContent,
	commentAuthorName,
	reporterName,
	reason,
	status,
	createdAt,
	resolutionReason,
	resolverName,
	resolvedAt,
}: {
	reportId: string;
	commentId: string;
	eventId: string;
	eventTitle: string;
	commentContent: string;
	commentAuthorName: string;
	reporterName: string;
	reason: string;
	status: ReportStatus;
	createdAt: string;
	resolutionReason: string | null;
	resolverName: string | null;
	resolvedAt: string | null;
}) {
	const router = useRouter();
	const [dialog, setDialog] = useState<"delete" | "resolve" | "dismiss" | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete(deleteReason: string) {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/admin/comments/${commentId}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason: deleteReason }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo eliminar el comentario.");
				return;
			}
			setDialog(null);
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	async function handleResolution(action: "resolve" | "dismiss", resolutionText: string) {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/admin/reports/${reportId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action, reason: resolutionText }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo actualizar el reporte.");
				return;
			}
			setDialog(null);
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="rounded-lg border border-brand-border bg-brand-background p-3">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div className="min-w-0">
					<Link href={`/dashboard/events/${eventId}`} className="text-sm font-semibold text-brand-secondary hover:underline">
						{eventTitle}
					</Link>
					<p className="mt-1 text-sm text-brand-primary">
						<span className="font-semibold">{commentAuthorName}:</span> {commentContent}
					</p>
					<p className="mt-1 text-xs text-brand-primary/60">
						Reportado por <span className="font-semibold">{reporterName}</span> el {fmt(createdAt)}
					</p>
					<p className="mt-1 text-xs text-brand-primary/70">
						<span className="font-semibold">Motivo del reporte:</span> {reason}
					</p>
					{status !== "pending" && (
						<p className="mt-1 text-xs text-brand-primary/60">
							{status === "resolved" ? "Resuelto" : "Descartado"} por{" "}
							<span className="font-semibold">{resolverName ?? "Admin"}</span>
							{resolvedAt ? ` el ${fmt(resolvedAt)}` : ""}
							{resolutionReason ? ` — Motivo: ${resolutionReason}` : ""}
						</p>
					)}
				</div>
				<Badge variant={STATUS_BADGE[status].variant}>{STATUS_BADGE[status].label}</Badge>
			</div>

			{error && <p className="mt-2 text-xs text-red-600">{error}</p>}

			{status === "pending" && (
				<div className="mt-3 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setDialog("delete")}
						className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
					>
						Eliminar comentario
					</button>
					<button
						type="button"
						onClick={() => setDialog("resolve")}
						className="rounded-lg px-3 py-1 text-xs font-semibold text-brand-primary ring-1 ring-brand-border hover:bg-white"
					>
						Marcar como resuelto
					</button>
					<button
						type="button"
						onClick={() => setDialog("dismiss")}
						className="rounded-lg px-3 py-1 text-xs font-semibold text-brand-primary/70 ring-1 ring-brand-border hover:bg-white"
					>
						Descartar reporte
					</button>
				</div>
			)}

			<ReasonDialog
				open={dialog === "delete"}
				title="Eliminar comentario reportado"
				confirmLabel="Eliminar"
				onCancel={() => setDialog(null)}
				onSubmit={handleDelete}
				loading={loading}
				error={error}
			/>
			<ReasonDialog
				open={dialog === "resolve"}
				title="Marcar reporte como resuelto"
				confirmLabel="Marcar como resuelto"
				onCancel={() => setDialog(null)}
				onSubmit={(r) => handleResolution("resolve", r)}
				loading={loading}
				error={error}
			/>
			<ReasonDialog
				open={dialog === "dismiss"}
				title="Descartar reporte"
				confirmLabel="Descartar"
				onCancel={() => setDialog(null)}
				onSubmit={(r) => handleResolution("dismiss", r)}
				loading={loading}
				error={error}
			/>
		</div>
	);
}
