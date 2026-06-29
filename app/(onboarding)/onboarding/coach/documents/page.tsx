"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";

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

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const fd = new FormData(event.currentTarget);
    const documents = sports.map((sport) => ({
      sport,
      documentUrl: String(fd.get(`doc_${sport}`) ?? "").trim(),
    }));

    const missing = documents.find((d) => !d.documentUrl);
    if (missing) {
      setError(`Ingresa el enlace del documento para ${SPORT_LABELS[missing.sport] ?? missing.sport}.`);
      setIsSubmitting(false);
      return;
    }

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
    return <p className="text-sm text-white/60">No se encontraron deportes seleccionados. Regresa al paso anterior.</p>;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {sports.map((sport) => (
        <div key={sport} className="rounded-lg border border-white/10 p-4">
          <p className="mb-3 text-sm font-semibold text-white">{SPORT_LABELS[sport] ?? sport}</p>
          <Input
            id={`doc-${sport}`}
            name={`doc_${sport}`}
            type="url"
            label="Enlace al documento que te certifica"
            placeholder="https://drive.google.com/..."
            required
          />
          <p className="mt-1.5 text-xs text-white/40">
            Sube tu documento a Google Drive u otro servicio y pega el enlace compartible aquí.
            Este documento NO será visible para los alumnos.
          </p>
        </div>
      ))}

      {error ? (
        <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Continuar"}
      </Button>
    </form>
  );
}

export default function CoachDocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          Paso 2 de 3
        </div>
        <CardTitle>Documentos de certificación</CardTitle>
        <p className="text-sm text-white/70">
          Sube un documento por deporte que acredite tu rol como entrenador. Un administrador los revisará para verificarte.
        </p>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-sm text-white/60">Cargando...</p>}>
          <CoachDocumentsForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
