"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

export function SpecializedCardActions({ sport }: { sport: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = SPORT_LABELS[sport] ?? sport;

  function handleCancel() {
    if (loading) return;
    setConfirmOpen(false);
    setError(null);
  }

  async function handleConfirmDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/onboarding/student/specialized?sport=${encodeURIComponent(sport)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    setLoading(false);
    if (!data.ok) {
      setError(data.message ?? "Error al eliminar.");
      return;
    }
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          href={`/onboarding/student/specialized?sport=${encodeURIComponent(sport)}`}
          title="Editar"
          aria-label="Editar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-primary/70 transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
        >
          <Icon name="edit" size={16} />
        </Link>
        <button
          type="button"
          title="Eliminar"
          aria-label="Eliminar"
          onClick={() => setConfirmOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="delete" size={16} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar ficha especializada"
        message={
          <>
            ¿Estás seguro de que deseas eliminar la ficha especializada de{" "}
            <span className="font-semibold text-brand-primary">{label}</span>? Esta acción es irreversible.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancel}
        loading={loading}
        error={error}
      />
    </div>
  );
}
