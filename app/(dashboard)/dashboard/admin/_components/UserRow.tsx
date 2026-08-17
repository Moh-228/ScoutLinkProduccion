"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
  studentProfile: { fullName: string } | null;
  coachProfile: { displayName: string } | null;
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

  const displayName = user.studentProfile?.fullName ?? user.coachProfile?.displayName ?? user.email;

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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-background p-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{displayName}</p>
        <p className="truncate text-sm text-brand-primary/70">{user.email}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
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
    </div>
  );
}
