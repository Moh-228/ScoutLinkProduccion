"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const role = searchParams.get("role") ?? "student";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Ingresa los 6 dígitos del código.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        setError(result.message || "No se pudo verificar el código.");
        return;
      }

      router.push(result.role === "student" ? "/onboarding/student" : "/onboarding/coach");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      setInfo(result.message || "Código reenviado.");
      setResendCooldown(60);
    } catch {
      setError("No se pudo reenviar el código.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg">
      <div className="mb-6">
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al registro
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Verifica tu correo</CardTitle>
          <p className="text-sm text-white/70">
            Enviamos un código de 6 dígitos a{" "}
            <span className="font-semibold text-white">{email || "tu correo"}</span>.
            Ingrésalo a continuación para activar tu cuenta.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 6-digit code inputs */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  aria-label={`Dígito ${i + 1}`}
                  className="h-14 w-12 rounded-lg border border-white/20 bg-white/5 text-center text-2xl font-bold text-white
                    caret-transparent outline-none transition focus:border-[#1883FF] focus:ring-1 focus:ring-[#1883FF]
                    disabled:opacity-50 sm:w-14"
                  disabled={isSubmitting}
                />
              ))}
            </div>

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

            <Button type="submit" className="w-full" disabled={isSubmitting || digits.join("").length !== 6}>
              {isSubmitting ? "Verificando..." : "Verificar cuenta"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-1 text-sm text-white/60">
            <span>¿No recibiste el correo?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="font-semibold text-[#1883FF] hover:text-[#75C3FF] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : "Reenviar código"}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
