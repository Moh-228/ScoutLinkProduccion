"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";

type CommentDTO = {
	id: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	authorId: string;
	authorName: string;
	authorRole: "student" | "coach" | "admin";
	reportedByMe: boolean;
	parentId: string | null;
};

const ROLE_LABELS: Record<CommentDTO["authorRole"], string> = {
	student: "Deportista",
	coach: "Entrenador",
	admin: "Admin",
};

function fmt(iso: string) {
	return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function ReportDialog({
	open,
	onCancel,
	onSubmit,
	loading,
	error,
}: {
	open: boolean;
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
				<h2 className="text-base font-semibold text-brand-primary">Reportar comentario</h2>
				<p className="mt-2 text-sm text-brand-primary/70">
					Indica el motivo del reporte. Nuestro equipo lo revisará.
				</p>
				<textarea
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={3}
					placeholder="Ej. Contenido ofensivo, spam, información falsa..."
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
						{loading ? "Enviando..." : "Reportar"}
					</button>
				</div>
			</div>
		</div>
	);
}

function CommentItem({
	comment,
	replies,
	eventId,
	currentUserId,
	isReply = false,
}: {
	comment: CommentDTO;
	replies?: CommentDTO[];
	eventId: string;
	currentUserId: string | null;
	isReply?: boolean;
}) {
	const router = useRouter();
	const isOwner = currentUserId === comment.authorId;
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(comment.content);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [reportOpen, setReportOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [reported, setReported] = useState(comment.reportedByMe);
	const [isReplying, setIsReplying] = useState(false);
	const [replyContent, setReplyContent] = useState("");
	const [replyLoading, setReplyLoading] = useState(false);
	const [replyError, setReplyError] = useState<string | null>(null);

	async function saveEdit() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/comments/${comment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo guardar.");
				return;
			}
			setIsEditing(false);
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	async function confirmDeleteComment() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/comments/${comment.id}`, { method: "DELETE" });
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo eliminar.");
				return;
			}
			setConfirmDelete(false);
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	async function submitReport(reason: string) {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/comments/${comment.id}/report`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo reportar.");
				return;
			}
			setReported(true);
			setReportOpen(false);
		} finally {
			setLoading(false);
		}
	}

	async function submitReply() {
		if (replyContent.trim().length === 0) return;
		setReplyLoading(true);
		setReplyError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: replyContent, parentId: comment.id }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setReplyError(json.message ?? "No se pudo publicar la respuesta.");
				return;
			}
			setReplyContent("");
			setIsReplying(false);
			router.refresh();
		} finally {
			setReplyLoading(false);
		}
	}

	return (
		<>
		<div className={`rounded-lg border border-brand-border/50 bg-brand-background p-3 ${isReply ? "ml-6" : ""}`}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold text-brand-primary">{comment.authorName}</span>
					<Badge variant="neutral" className="text-[10px]">{ROLE_LABELS[comment.authorRole]}</Badge>
				</div>
				<span className="text-xs text-brand-primary/50">{fmt(comment.createdAt)}</span>
			</div>

			{isEditing ? (
				<div className="mt-2 space-y-2">
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={2}
						className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-primary shadow-sm outline-none focus:border-interaction focus:ring-2 focus:ring-interaction/40"
					/>
					<div className="flex gap-2">
						<Button onClick={saveEdit} disabled={loading || content.trim().length === 0}>
							{loading ? "Guardando..." : "Guardar"}
						</Button>
						<Button variant="ghost" onClick={() => { setIsEditing(false); setContent(comment.content); }} disabled={loading}>
							Cancelar
						</Button>
					</div>
				</div>
			) : (
				<p className="mt-1.5 whitespace-pre-line text-sm text-brand-primary">{comment.content}</p>
			)}

			{error && <p className="mt-1 text-xs text-red-600">{error}</p>}

			{!isEditing && currentUserId && (
				<div className="mt-2 flex gap-3">
					{isOwner ? (
						<>
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="inline-flex items-center gap-1 text-xs font-semibold text-brand-secondary hover:text-brand-primary"
							>
								<Icon name="edit" size={14} /> Editar
							</button>
							<button
								type="button"
								onClick={() => setConfirmDelete(true)}
								className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
							>
								<Icon name="delete" size={14} /> Eliminar
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={() => setReportOpen(true)}
							disabled={reported}
							className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary/50 hover:text-brand-primary disabled:cursor-not-allowed"
						>
							<Icon name="error" size={14} /> {reported ? "Reportado" : "Reportar"}
						</button>
					)}
					{!isReply && (
						<button
							type="button"
							onClick={() => setIsReplying((v) => !v)}
							className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary/50 hover:text-brand-primary"
						>
							Responder
						</button>
					)}
				</div>
			)}

			{isReplying && (
				<div className="mt-2 space-y-2">
					<textarea
						value={replyContent}
						onChange={(e) => setReplyContent(e.target.value)}
						rows={2}
						maxLength={1000}
						placeholder="Escribe una respuesta..."
						className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-primary shadow-sm outline-none focus:border-interaction focus:ring-2 focus:ring-interaction/40"
					/>
					{replyError && <p className="text-xs text-red-600">{replyError}</p>}
					<div className="flex gap-2">
						<Button onClick={submitReply} disabled={replyLoading || replyContent.trim().length === 0}>
							{replyLoading ? "Publicando..." : "Responder"}
						</Button>
						<Button variant="ghost" onClick={() => { setIsReplying(false); setReplyContent(""); }} disabled={replyLoading}>
							Cancelar
						</Button>
					</div>
				</div>
			)}

			<ConfirmDialog
				open={confirmDelete}
				title="Eliminar comentario"
				message="¿Seguro que quieres eliminar este comentario? Esta acción no se puede deshacer."
				onCancel={() => setConfirmDelete(false)}
				onConfirm={confirmDeleteComment}
				loading={loading}
				error={error}
			/>
			<ReportDialog
				open={reportOpen}
				onCancel={() => setReportOpen(false)}
				onSubmit={submitReport}
				loading={loading}
				error={error}
			/>
		</div>

		{!isReply && replies && replies.length > 0 && (
			<div className="mt-2 space-y-2">
				{replies.map((r) => (
					<CommentItem key={r.id} comment={r} eventId={eventId} currentUserId={currentUserId} isReply />
				))}
			</div>
		)}
		</>
	);
}

export function CommentsSection({
	eventId,
	comments,
	currentUserId,
}: {
	eventId: string;
	comments: CommentDTO[];
	currentUserId: string | null;
}) {
	const router = useRouter();
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (content.trim().length === 0) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content }),
			});
			const json = (await res.json()) as { ok: boolean; message?: string };
			if (!json.ok) {
				setError(json.message ?? "No se pudo publicar el comentario.");
				return;
			}
			setContent("");
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Comentarios ({comments.length})</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{currentUserId ? (
					<form onSubmit={handleSubmit} className="space-y-2">
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							rows={2}
							maxLength={1000}
							placeholder="Escribe un comentario..."
							className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40"
						/>
						{error && <p className="text-xs text-red-600">{error}</p>}
						<div className="flex justify-end">
							<Button type="submit" disabled={loading || content.trim().length === 0}>
								{loading ? "Publicando..." : "Comentar"}
							</Button>
						</div>
					</form>
				) : (
					<p className="text-sm text-brand-primary/50">Inicia sesión para comentar.</p>
				)}

				{comments.length === 0 ? (
					<p className="text-sm text-brand-primary/50">Aún no hay comentarios.</p>
				) : (
					<div className="space-y-3">
						{comments
							.filter((c) => !c.parentId)
							.map((c) => (
								<CommentItem
									key={c.id}
									comment={c}
									replies={comments.filter((r) => r.parentId === c.id)}
									eventId={eventId}
									currentUserId={currentUserId}
								/>
							))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
