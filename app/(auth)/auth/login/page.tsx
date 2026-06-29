"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
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
        <p className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100" role="status">
          Contraseña actualizada. Ya puedes iniciar sesión.
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input id="login-email" name="email" type="email" label="Correo electrónico" placeholder="tu@correo.com" required />
        <div className="flex flex-col gap-1.5">
          <PasswordInput id="login-password" name="password" label="Contraseña" placeholder="********" required />
          <Link href="/auth/forgot-password" className="self-end text-xs text-white/50 hover:text-white">
            Olvidé mi contraseña
          </Link>
        </div>
        {error ? (
          <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-lg">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <p className="text-sm text-white">Accede a tu panel de reclutamiento deportivo.</p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-white/60">Cargando...</p>}>
            <LoginForm />
          </Suspense>
          <p className="mt-4 text-sm text-white">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/auth/register" className="font-semibold text-[#1883FF] hover:text-[#75C3FF]">
              Registrarme
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
