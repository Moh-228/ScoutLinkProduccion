"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";

export default function FavoritesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      tone="error"
      titleAs="h2"
      title="No se pudieron cargar tus favoritos"
      description={error.message || "Ocurrió un error inesperado. Intenta de nuevo."}
      action={
        <Button variant="secondary" onClick={reset}>
          Reintentar
        </Button>
      }
      className="my-8"
    />
  );
}
