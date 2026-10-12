"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/Button";
import { OnboardingCard } from "@/app/(onboarding)/_components/OnboardingCard";
import { Alert } from "@/components/Alert";
import { PdfUploadField } from "@/components/PdfUploadField";

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

function CoachDocumentsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sports = (searchParams.get("sports") ?? "").split(",").filter(Boolean);

  const [documentKeys, setDocumentKeys] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setDocumentKey(sport: string) {
    return (key: string) => setDocumentKeys((prev) => ({ ...prev, [sport]: key }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const documents = sports.map((sport) => ({
      sport,
      documentUrl: documentKeys[sport] ?? "",
    }));

    const missing = documents.find((d) => !d.documentUrl);
    if (missing) {
      setError(`Sube el PDF del documento certificado para ${SPORT_LABELS[missing.sport] ?? missing.sport}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/coach/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        const fieldErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
        setError(fieldErrors || result.message || "No se pudieron guardar los documentos.");
        return;
      }

      router.push("/onboarding/coach/card");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sports.length === 0) {
    return <Alert variant="warning">No se encontraron deportes seleccionados. Regresa al paso anterior.</Alert>;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {sports.map((sport) => (
        <div key={sport} className="rounded-lg border border-brand-border p-4">
          <p className="mb-3 text-sm font-semibold text-brand-primary">{SPORT_LABELS[sport] ?? sport}</p>
          <PdfUploadField
            id={`doc-${sport}`}
            kind="coach-certification"
            label="Documento que te certifica"
            value={documentKeys[sport] ?? ""}
            onChange={setDocumentKey(sport)}
            required
            helpText="Sube el PDF que acredite tu rol como entrenador. Este documento NO será visible para los alumnos."
          />
        </div>
      ))}

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => router.push("/dashboard/profile")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

export default function CoachDocumentsPage() {
  return (
    <OnboardingCard
      step={2}
      label="Paso 2 de 3"
      title="Documentos de certificación"
      description="Sube un documento por deporte que acredite tu rol como entrenador. Un administrador los revisará para verificarte."
    >
        <Suspense fallback={<p className="text-sm text-brand-primary/70">Cargando...</p>}>
          <CoachDocumentsForm />
        </Suspense>
    </OnboardingCard>
  );
}
