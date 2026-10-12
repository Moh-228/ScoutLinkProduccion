"use client";

import { FormEvent, useState } from "react";

import { AUTH_SUBMIT_CLASS, AuthShell } from "@/app/(auth)/_components/AuthShell";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
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
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      back={{ href: "/auth/login", label: "Volver al inicio de sesión" }}
      title="Recuperar contraseña"
      description="Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          id="fp-email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          required
        />

        {error ? <Alert variant="error">{error}</Alert> : null}

        {info ? <Alert variant="success">{info}</Alert> : null}

        <Button type="submit" className={AUTH_SUBMIT_CLASS} disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
        </Button>
      </form>
    </AuthShell>
  );
}
