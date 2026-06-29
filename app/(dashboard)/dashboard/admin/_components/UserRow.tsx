"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

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

export function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{displayName}</p>
        <p className="truncate text-sm text-slate-400">{user.email}</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={user.role === "coach" ? "info" : "neutral"}>
          {user.role === "student" ? "Deportista" : "Coach"}
        </Badge>
        <Badge variant={user.isActive ? "success" : "danger"}>
          {user.isActive ? "Activo" : "Inactivo"}
        </Badge>
        <Button
          variant="secondary"
          disabled={!!loading || pending}
          onClick={toggle}
          className="px-3 py-1 text-xs"
        >
          {loading === "toggle" ? "..." : user.isActive ? "Desactivar" : "Activar"}
        </Button>
        <Button
          variant="ghost"
          disabled={!!loading || pending}
          onClick={remove}
          className="px-3 py-1 text-xs text-red-400 hover:bg-red-500/20"
        >
          {loading === "delete" ? "..." : "Eliminar"}
        </Button>
      </div>
    </div>
  );
}
