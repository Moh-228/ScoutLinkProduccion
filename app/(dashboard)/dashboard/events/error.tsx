"use client";

import { Button } from "@/components/Button";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="text-base font-semibold text-brand-primary">No se pudieron cargar los eventos</h2>
      <p className="text-sm text-brand-primary/50">
        {error.message || "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      <Button variant="secondary" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
