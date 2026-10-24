"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AUTH_FOCUS_RING, AUTH_FOOTER_LINK, AUTH_SUBMIT_CLASS, AuthShell } from "@/app/(auth)/_components/AuthShell";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
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

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&role=${result.role}`);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      surface="brand"
      large
      back={{ href: "/", label: "Volver al inicio" }}
      title="Crear cuenta"
      description="Registra tu perfil para comenzar a explorar oportunidades."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className={AUTH_FOOTER_LINK}>
            Iniciar sesión
          </Link>
        </>
      }
    >
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
                <p className="text-xs text-brand-primary/70">Los alumnos deben usar su correo institucional @alumno.ipn.mx.</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <PasswordInput id="register-password" name="password" label="Contraseña" placeholder="Min. 8 caracteres" required />
              <p className="text-xs text-brand-primary/70">Debe incluir al menos una mayúscula y un símbolo (ej. !, @, #).</p>
            </div>
            <PasswordInput
              id="register-confirm-password"
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder="********"
              required
            />
            {error ? <Alert variant="error">{error}</Alert> : null}
            <div className="flex justify-center">
              <Button type="submit" className={AUTH_SUBMIT_CLASS} disabled={isSubmitting}>
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </div>
            <p className="text-center text-xs text-brand-primary/70">
              Al crear tu cuenta aceptas nuestro{" "}
              <Link
                href="/aviso-de-privacidad?desde=registro"
                className={`rounded font-medium text-brand-secondary underline underline-offset-2 transition-colors hover:text-brand-primary ${AUTH_FOCUS_RING}`}
              >
                aviso de privacidad
              </Link>
              .
            </p>
          </form>
    </AuthShell>
  );
}
