"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";

const TA_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-600";

const GENDERS = ["V", "F", "Mixto"] as const;
type Gender = (typeof GENDERS)[number];

const GENDER_LABELS: Record<Gender, string> = {
  V: "Varonil",
  F: "Femenil",
  Mixto: "Mixto",
};

async function completeOnboarding() {
  await fetch("/api/onboarding/complete", { method: "POST" });
}

export default function CoachCardPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Gender[]>([]);

  function toggleCategory(gender: Gender) {
    setCategories((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const fd = new FormData(event.currentTarget);
    const body = {
      certifications: String(fd.get("certifications") ?? ""),
      experience: String(fd.get("experience") ?? ""),
      yearsExperience: String(fd.get("yearsExperience") ?? ""),
      achievements: String(fd.get("achievements") ?? ""),
      categories,
    };

    try {
      const res = await fetch("/api/onboarding/coach/card", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        setError(result.message || "No se pudo guardar la ficha.");
        return;
      }

      await completeOnboarding();
      router.push("/dashboard");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSkip() {
    await completeOnboarding();
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          Paso 3 de 3 — Opcional
        </div>
        <CardTitle>Ficha de entrenador</CardTitle>
        <p className="text-sm text-white/70">
          Comparte tu trayectoria y certificaciones. Puedes editarlas después desde tu perfil.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Categorías */}
          <div>
            <p className="mb-2 text-sm font-medium text-white">Categorías que entrenas</p>
            <div className="flex gap-3">
              {GENDERS.map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => toggleCategory(gender)}
                  className={[
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    categories.includes(gender)
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                      : "border-white/20 bg-white/5 text-white/60 hover:border-white/40",
                  ].join(" ")}
                  aria-pressed={categories.includes(gender)}
                >
                  {GENDER_LABELS[gender]}
                </button>
              ))}
            </div>
          </div>

          {/* Años de experiencia */}
          <Input
            id="cc-years"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            label="Años de experiencia como entrenador"
            placeholder="5"
          />

          {/* Certificaciones */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
            <span>Certificaciones</span>
            <textarea
              name="certifications"
              rows={3}
              placeholder="Certificación FIBA, UEFA, CONADE..."
              className={TA_CLASS}
            />
          </label>

          {/* Experiencia */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
            <span>Experiencia</span>
            <textarea
              name="experience"
              rows={4}
              placeholder="Equipos que has dirigido, ligas, temporadas..."
              className={TA_CLASS}
            />
          </label>

          {/* Logros */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
            <span>Logros <span className="font-normal text-white/50">(opcional)</span></span>
            <textarea
              name="achievements"
              rows={4}
              placeholder={"- Campeon liga municipal 2024\n- MVP entrenador Sub-20\n- Clasificacion regional 2023"}
              className={TA_CLASS}
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar y finalizar"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleSkip} disabled={isSubmitting}>
              Saltar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
