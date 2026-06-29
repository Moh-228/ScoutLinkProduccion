"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devToken, setDevToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setDevToken("");
    setIsSubmitting(true);

    const fd = new FormData(event.currentTarget);
    const email = String(fd.get("email") ?? "").trim();

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        setError(result.message || "No se pudo procesar la solicitud.");
        return;
      }

      setInfo(result.message);
      if (result.devToken) {
        setDevToken(result.devToken);
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <CardTitle>Recuperar contraseña</CardTitle>
          <p className="text-sm text-white/70">
            Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="fp-email"
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="tu@correo.com"
              required
            />

            {error ? (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
                {error}
              </p>
            ) : null}

            {info ? (
              <p className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100" role="status">
                {info}
              </p>
            ) : null}

            {devToken ? (
              <div className="rounded-lg border border-yellow-400/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
                <p className="mb-1 font-semibold">[DEV] Token de recuperación:</p>
                <p className="break-all font-mono">{devToken}</p>
                <Link
                  href={`/auth/reset-password?token=${devToken}`}
                  className="mt-2 inline-block font-semibold text-yellow-300 underline"
                >
                  Ir a restablecer contraseña →
                </Link>
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
