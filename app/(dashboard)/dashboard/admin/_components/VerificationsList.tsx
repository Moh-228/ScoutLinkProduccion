"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";

type Verification = {
  id: string;
  sport: string;
  status: string;
  documentUrl: string | null;
  rejectionReason: string | null;
  coach: { id: string; email: string; coachProfile: { displayName: string } | null };
};

const sportLabels: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

export function VerificationsList({ verifications }: { verifications: Verification[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(id: string, action: "verify" | "reject") {
    setLoading(id + action);
    setError(null);
    const res = await fetch(`/api/admin/verifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json() as { ok: boolean; message?: string };
    setLoading(null);
    if (!data.ok) {
      setError(data.message ?? "Error al procesar.");
      return;
    }
    startTransition(() => router.refresh());
  }

  if (verifications.length === 0) {
    return <EmptyState size="compact" icon="verified_user" title="No hay solicitudes pendientes." />;
  }

  return (
    <div className="space-y-3">
      {error && <Alert variant="error">{error}</Alert>}
      {verifications.map((v) => (
        <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-background p-3">
          <div>
            <p className="font-display font-semibold text-brand-primary">{v.coach.coachProfile?.displayName ?? v.coach.email}</p>
            <p className="text-sm text-brand-primary/70">Deporte: {sportLabels[v.sport] ?? v.sport}</p>
            {v.documentUrl && (
              <a
                href={`/api/files/document?key=${encodeURIComponent(v.documentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs rounded text-brand-secondary underline hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
              >
                Ver documento certificado
              </a>
            )}
            {v.rejectionReason && (
              <p className="text-xs text-red-600">Motivo rechazo: {v.rejectionReason}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={v.status === "verified" ? "success" : v.status === "rejected" ? "danger" : "warning"}>
              {v.status === "verified" ? "Verificado" : v.status === "rejected" ? "Rechazado" : "Pendiente"}
            </Badge>
            {v.status === "pending" && (
              <>
                <Button
                  disabled={!!loading || pending}
                  onClick={() => handleAction(v.id, "verify")}
                  size="sm"
                >
                  {loading === v.id + "verify" ? "..." : "Aprobar"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!!loading || pending}
                  onClick={() => handleAction(v.id, "reject")}
                  size="sm"
                >
                  {loading === v.id + "reject" ? "..." : "Rechazar"}
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
