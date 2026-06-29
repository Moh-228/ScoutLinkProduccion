"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";

const SPORT_OPTIONS = [
  { label: "Selecciona un deporte (opcional)", value: "" },
  { label: "Básquetbol", value: "basketball" },
  { label: "Fútbol", value: "soccer" },
  { label: "Flag Football", value: "flag_football" },
  { label: "Voleibol", value: "volleyball" },
];

const SCHOOL_OPTIONS = [
  { label: "Selecciona tu unidad académica (opcional)", value: "" },
  { label: "ESIME", value: "ESIME" },
  { label: "ESIQIE", value: "ESIQIE" },
  { label: "ESFM", value: "ESFM" },
  { label: "ESIA", value: "ESIA" },
  { label: "ESIT", value: "ESIT" },
  { label: "ENCB", value: "ENCB" },
  { label: "ESCOM", value: "ESCOM" },
  { label: "UPIITA", value: "UPIITA" },
  { label: "UPIBI", value: "UPIBI" },
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const fd = new FormData(event.currentTarget);

    const body = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      birthDate: String(fd.get("birthDate") ?? ""),
      school: String(fd.get("school") ?? "") || undefined,
      semester: fd.get("semester") ? String(fd.get("semester")) : "",
      gender: String(fd.get("gender") ?? "") || undefined,
      favoriteSport: String(fd.get("favoriteSport") ?? "") || undefined,
      socialLink: String(fd.get("socialLink") ?? ""),
    };

    try {
      const res = await fetch("/api/onboarding/student", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        const fieldErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
        setError(fieldErrors || result.message || "No se pudo guardar el perfil.");
        return;
      }

      router.push("/onboarding/student/card");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          Paso 1 de 3
        </div>
        <CardTitle>Completa tu perfil</CardTitle>
        <p className="text-sm text-white/70">
          Estos datos son obligatorios para usar la plataforma.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input id="ob-name" name="fullName" label="Nombre completo" placeholder="Tu nombre" required />
          <Input id="ob-birth" name="birthDate" type="date" label="Fecha de nacimiento" />
          <Select
            id="ob-school"
            name="school"
            label="Unidad académica / escuela"
            options={SCHOOL_OPTIONS}
          />
          <Input id="ob-semester" name="semester" type="number" min={1} max={12} label="Semestre actual" placeholder="1-12" />
          <div>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
              <span>Género</span>
              <select
                name="gender"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition-colors focus:border-cyan-600"
              >
                <option value="">Prefiero no decir</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </label>
          </div>
          <Select
            id="ob-sport"
            name="favoriteSport"
            label="Deporte favorito (opcional)"
            options={SPORT_OPTIONS}
          />
          <Input id="ob-social" name="socialLink" type="url" label="Red social o portafolio (opcional)" placeholder="https://..." />

          {error ? (
            <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
