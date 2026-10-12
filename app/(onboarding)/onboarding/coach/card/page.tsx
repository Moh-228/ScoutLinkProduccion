"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { OnboardingCard } from "@/app/(onboarding)/_components/OnboardingCard";
import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";

const TA_CLASS =
  "w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40";

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
    <OnboardingCard
      step={3}
      label="Paso 3 de 3 — Opcional"
      title="Ficha de entrenador"
      description="Comparte tu trayectoria y certificaciones. Puedes editarlas después desde tu perfil."
    >
        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Categorías */}
          <div>
            <p className="mb-2 text-sm font-medium text-brand-primary">Categorías que entrenas</p>
            <div className="flex gap-3">
              {GENDERS.map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => toggleCategory(gender)}
                  className={[
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction",
                    categories.includes(gender)
                      ? "border-interaction bg-interaction/20 text-interaction"
                      : "border-brand-border bg-brand-background text-brand-primary/70 hover:border-brand-secondary/40",
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
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Certificaciones</span>
            <textarea
              name="certifications"
              rows={3}
              placeholder="Certificación FIBA, UEFA, CONADE..."
              className={TA_CLASS}
            />
          </label>

          {/* Experiencia */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Experiencia</span>
            <textarea
              name="experience"
              rows={4}
              placeholder="Equipos que has dirigido, ligas, temporadas..."
              className={TA_CLASS}
            />
          </label>

          {/* Logros */}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Logros <span className="font-normal text-brand-primary/70">(opcional)</span></span>
            <textarea
              name="achievements"
              rows={4}
              placeholder={"- Campeon liga municipal 2024\n- MVP entrenador Sub-20\n- Clasificacion regional 2023"}
              className={TA_CLASS}
            />
          </label>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar y finalizar"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleSkip} disabled={isSubmitting}>
              Saltar
            </Button>
          </div>
        </form>
    </OnboardingCard>
  );
}
