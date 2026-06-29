"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";

const SPORTS = [
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

export default function CoachOnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  function toggleSport(value: string) {
    setSelectedSports((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedSports.length === 0) {
      setError("Selecciona al menos un deporte a cargo.");
      return;
    }

    setIsSubmitting(true);

    const fd = new FormData(event.currentTarget);
    const body = {
      displayName: String(fd.get("displayName") ?? "").trim(),
      academicUnit: String(fd.get("academicUnit") ?? "") || undefined,
      phone: String(fd.get("phone") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      sports: selectedSports,
    };

    try {
      const res = await fetch("/api/onboarding/coach", {
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

      const sportsParam = selectedSports.join(",");
      router.push(`/onboarding/coach/documents?sports=${sportsParam}`);
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
        <CardTitle>Configura tu perfil de entrenador</CardTitle>
        <p className="text-sm text-white/70">
          Completa tu información profesional para comenzar.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input id="ob-c-name" name="displayName" label="Nombre para mostrar" placeholder="Prof. Juan Garcia" required />
          <Select
            id="ob-c-unit"
            name="academicUnit"
            label="Unidad académica"
            options={SCHOOL_OPTIONS}
          />
          <Input id="ob-c-phone" name="phone" type="tel" label="Teléfono de contacto" placeholder="55 1234 5678" maxLength={10} />
          <div>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
              <span>Biografía / presentación</span>
              <textarea
                name="bio"
                rows={3}
                placeholder="Describe tu experiencia y enfoque como entrenador..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-600"
              />
            </label>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-white">
              Deportes a cargo <span className="text-red-400">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.map((sport) => (
                <label
                  key={sport.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selectedSports.includes(sport.value)
                      ? "border-cyan-500 bg-cyan-500/10 text-white"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedSports.includes(sport.value)}
                    onChange={() => toggleSport(sport.value)}
                  />
                  <span
                    className={`h-4 w-4 flex-shrink-0 rounded border ${
                      selectedSports.includes(sport.value) ? "border-cyan-500 bg-cyan-500" : "border-white/30"
                    }`}
                    aria-hidden="true"
                  />
                  {sport.label}
                </label>
              ))}
            </div>
          </fieldset>

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
