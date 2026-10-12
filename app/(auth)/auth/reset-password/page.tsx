"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AUTH_SUBMIT_CLASS, AuthShell } from "@/app/(auth)/_components/AuthShell";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
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
      <p className="text-xs text-brand-primary/70">
        La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.
      </p>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" className={AUTH_SUBMIT_CLASS} disabled={isSubmitting}>
        {isSubmitting ? "Actualizando..." : "Restablecer contraseña"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      back={{ href: "/auth/login", label: "Volver al inicio de sesión" }}
      title="Restablecer contraseña"
      description="Elige una nueva contraseña segura para tu cuenta."
    >
      <Suspense fallback={<p className="text-sm text-brand-primary/70">Cargando...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
