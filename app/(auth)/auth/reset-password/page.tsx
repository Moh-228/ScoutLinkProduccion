"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const fd = new FormData(event.currentTarget);
    const token = String(fd.get("token") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        const fieldErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
        setError(fieldErrors || result.message || "No se pudo restablecer la contraseña.");
        return;
      }

      router.push("/auth/login?reset=1");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!tokenFromUrl ? (
        <Input
          id="rp-token"
          name="token"
          label="Token de recuperación"
          placeholder="Pega aquí el token recibido"
          required
        />
      ) : (
        <input type="hidden" name="token" value={tokenFromUrl} />
      )}
      <Input
        id="rp-password"
        name="password"
        type="password"
        label="Nueva contraseña"
        placeholder="Min 8 caracteres, 1 mayúscula, 1 símbolo"
        required
      />
      <Input
        id="rp-confirm"
        name="confirmPassword"
        type="password"
        label="Confirmar nueva contraseña"
        placeholder="********"
        required
      />
      <p className="text-xs text-white/40">
        La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.
      </p>

      {error ? (
        <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Actualizando..." : "Restablecer contraseña"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-lg">
      <div className="mb-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio de sesión
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
          <p className="text-sm text-white/70">
            Elige una nueva contraseña segura para tu cuenta.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-white/60">Cargando...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
