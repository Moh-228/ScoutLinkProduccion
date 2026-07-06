"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Select } from "@/components/Select";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (role === "student" && !email.endsWith("@alumno.ipn.mx")) {
      setError("Los alumnos deben usar su correo institucional @alumno.ipn.mx.");
      return;
    }

    if (role === "student" && !/\d{4}@alumno\.ipn\.mx$/.test(email)) {
      setError("El correo debe terminar con exactamente 4 dígitos antes de @alumno.ipn.mx (ej. nombre1234@alumno.ipn.mx).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, fullName, email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        const fieldErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
        setError(fieldErrors || result.message || "No se pudo completar el registro.");
        return;
      }

      router.push(result.data.role === "student" ? "/onboarding/student" : "/onboarding/coach");
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
          <CardTitle>Crear cuenta</CardTitle>
          <p className="text-sm text-white">Registra tu perfil para comenzar a explorar oportunidades.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Select
              id="register-role"
              name="role"
              label="Rol"
              options={[
                { label: "Estudiante", value: "student" },
                { label: "Coach / Entrenador", value: "coach" },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Input id="register-name" name="fullName" type="text" label="Nombre completo" placeholder="Tu nombre" required />
            <div className="flex flex-col gap-1.5">
              <Input
                id="register-email"
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder={role === "student" ? "tu@alumno.ipn.mx" : "tu@correo.com"}
                required
              />
              {role === "student" ? (
                <p className="text-xs text-cyan-400/80">Los alumnos deben usar su correo institucional @alumno.ipn.mx.</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <PasswordInput id="register-password" name="password" label="Contraseña" placeholder="Min. 8 caracteres" required />
              <p className="text-xs text-white/40">Debe incluir al menos una mayúscula y un símbolo (ej. !, @, #).</p>
            </div>
            <PasswordInput
              id="register-confirm-password"
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder="********"
              required
            />
            {error ? (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-white">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-[#1883FF] hover:text-[#75C3FF]">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
