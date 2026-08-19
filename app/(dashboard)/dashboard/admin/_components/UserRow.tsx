"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Select } from "@/components/Select";

type User = {
  id: string;
  email: string;
  role: "student" | "coach" | "admin";
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  studentProfile: { fullName: string; photoUrl: string | null } | null;
  coachProfile: { displayName: string; photoUrl: string | null } | null;
};

const ROLE_OPTIONS = [
  { label: "Deportista", value: "student" },
  { label: "Entrenador / Coordinador", value: "coach" },
  { label: "Administrador", value: "admin" },
];

const ROLE_LABELS: Record<string, string> = {
  student: "Deportista",
  coach: "Coach",
  admin: "Admin",
};

export function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [reportingPhoto, setReportingPhoto] = useState(false);
  const [photoReason, setPhotoReason] = useState("");

  const displayName = user.studentProfile?.fullName ?? user.coachProfile?.displayName ?? user.email;
  const photoUrl = user.studentProfile?.photoUrl ?? user.coachProfile?.photoUrl ?? null;

  async function toggle() {
    setLoading("toggle");
    setError(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const data = await res.json() as { ok: boolean; message?: string };
    setLoading(null);
    if (!data.ok) { setError(data.message ?? "Error."); return; }
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (!confirm(`¿Eliminar la cuenta de ${displayName}? Esta acción es irreversible.`)) return;
    setLoading("delete");
    setError(null);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await res.json() as { ok: boolean; message?: string };
    setLoading(null);
    if (!data.ok) { setError(data.message ?? "Error."); return; }
    startTransition(() => router.refresh());
  }

  async function confirmRoleChange() {
    if (!pendingRole) return;
    setLoading("role");
    setError(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: pendingRole }),
    });
    const data = await res.json() as { ok: boolean; message?: string };
    setLoading(null);
    if (!data.ok) { setError(data.message ?? "Error."); return; }
    setPendingRole(null);
    startTransition(() => router.refresh());
  }

  async function confirmRemovePhoto() {
    if (photoReason.trim().length < 3) return;
    setLoading("photo");
    setError(null);
    const res = await fetch(`/api/admin/users/${user.id}/photo`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: photoReason }),
    });
    const data = await res.json() as { ok: boolean; message?: string };
    setLoading(null);
    if (!data.ok) { setError(data.message ?? "Error."); return; }
    setReportingPhoto(false);
    setPhotoReason("");
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-background p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar photoKey={photoUrl} name={displayName} size={40} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{displayName}</p>
          <p className="truncate text-sm text-brand-primary/70">{user.email}</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={user.role === "coach" ? "info" : "neutral"}>
          {ROLE_LABELS[user.role] ?? user.role}
        </Badge>
        <Badge variant={user.isActive ? "success" : "danger"}>
          {user.isActive ? "Activo" : "Inactivo"}
        </Badge>
        <div className="w-44">
          <Select
            id={`role-${user.id}`}
            options={ROLE_OPTIONS}
            value={user.role}
            disabled={!!loading || pending}
            onChange={(e) => setPendingRole(e.target.value)}
            className="py-1 text-xs"
          />
        </div>
        <Button
          variant="secondary"
          disabled={!!loading || pending}
          onClick={toggle}
          className="px-3 py-1 text-xs"
        >
          {loading === "toggle" ? "..." : user.isActive ? "Desactivar" : "Activar"}
        </Button>
        {photoUrl && (
          <Button
            variant="secondary"
            disabled={!!loading || pending}
            onClick={() => setReportingPhoto(true)}
            className="px-3 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Reportar foto
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={!!loading || pending}
          onClick={remove}
          className="px-3 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          {loading === "delete" ? "..." : "Eliminar"}
        </Button>
      </div>

      <ConfirmDialog
        open={pendingRole !== null && pendingRole !== user.role}
        title="Cambiar rol de usuario"
        message={`¿Cambiar el rol de ${displayName} a "${ROLE_LABELS[pendingRole ?? ""] ?? pendingRole}"?`}
        confirmLabel="Cambiar rol"
        onCancel={() => setPendingRole(null)}
        onConfirm={confirmRoleChange}
        loading={loading === "role"}
        error={error}
      />

      {reportingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-brand-border">
            <h2 className="text-base font-semibold text-brand-primary">Reportar y eliminar foto de perfil</h2>
            <p className="mt-2 text-sm text-brand-primary/70">
              La foto de {displayName} se eliminará de inmediato. Este motivo quedará registrado en el historial administrativo.
            </p>
            <Avatar photoKey={photoUrl} name={displayName} size={96} className="mt-3" />
            <textarea
              value={photoReason}
              onChange={(e) => setPhotoReason(e.target.value)}
              rows={3}
              placeholder="Describe por qué la foto no es apta para la plataforma..."
              className="mt-3 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40"
            />
            {error && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setReportingPhoto(false); setPhotoReason(""); setError(null); }}
                disabled={loading === "photo"}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-primary ring-1 ring-brand-border hover:bg-brand-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemovePhoto}
                disabled={loading === "photo" || photoReason.trim().length < 3}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading === "photo" ? "Eliminando..." : "Eliminar foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
