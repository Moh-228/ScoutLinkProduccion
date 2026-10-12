"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AUTH_FOCUS_RING, AUTH_FOOTER_LINK, AUTH_SUBMIT_CLASS, AuthShell } from "@/app/(auth)/_components/AuthShell";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasReset = searchParams.get("reset") === "1";

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        if (result.requiresVerification) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(result.email)}`);
          return;
        }
        setError(result.message ?? "No se pudo iniciar sesión.");
        return;
      }

      const { onboardingCompleted, role } = result.data;
      if (onboardingCompleted === false) {
        router.push(role === "student" ? "/onboarding/student" : "/onboarding/coach");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {wasReset ? (
        <Alert variant="success" className="mb-4">
          Contraseña actualizada. Ya puedes iniciar sesión.
        </Alert>
      ) : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input id="login-email" name="email" type="email" label="Correo electrónico" placeholder="tu@correo.com" required />
        <div className="flex flex-col gap-1.5">
          <PasswordInput id="login-password" name="password" label="Contraseña" placeholder="********" required />
          <Link
            href="/auth/forgot-password"
            className={`self-end rounded text-xs font-medium text-brand-primary/70 underline-offset-2 transition-colors hover:text-brand-secondary hover:underline ${AUTH_FOCUS_RING}`}
          >
            Olvidé mi contraseña
          </Link>
        </div>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Button
          type="submit"
          className={AUTH_SUBMIT_CLASS}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      back={{ href: "/", label: "Volver al inicio" }}
      title="Iniciar sesión"
      description="Accede a tu panel de reclutamiento deportivo."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/auth/register" className={AUTH_FOOTER_LINK}>
            Registrarme
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-brand-primary/70">Cargando...</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
