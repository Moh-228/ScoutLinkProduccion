"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { OnboardingCard } from "@/app/(onboarding)/_components/OnboardingCard";
import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";
import { PdfUploadField } from "@/components/PdfUploadField";
import { Select } from "@/components/Select";

const LEVEL_OPTIONS = [
  { label: "Selecciona tu nivel (opcional)", value: "" },
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Avanzado", value: "advanced" },
];

const TA_CLASS =
  "w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-brand-border pt-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-primary/70">
        {children}
      </h3>
    </div>
  );
}

async function completeOnboarding() {
  await fetch("/api/onboarding/complete", { method: "POST" });
}

export default function StudentCardPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fields, setFields] = useState({
    heightCm: "",
    weightKg: "",
    phone: "",
    publicEmail: "",
    experienceLevel: "",
    isPublic: false,
    previousInjuries: "",
    currentInjury: "",
    surgeries: "",
    asthma: false,
    pathologies: "",
    chronicDiseases: "",
    cardiacConditions: "",
    inscriptionProof: "",
    medicalInsurance: "",
  });

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((result) => {
        if (result.ok && result.data?.generalCard) {
          const c = result.data.generalCard;
          const med = (c.medicalInfo ?? {}) as Record<string, unknown>;
          const docs = (c.documents ?? {}) as Record<string, unknown>;
          setFields({
            heightCm: c.heightCm != null ? String(c.heightCm) : "",
            weightKg: c.weightKg != null ? String(c.weightKg) : "",
            phone: c.phone ?? "",
            publicEmail: c.publicEmail ?? "",
            experienceLevel: c.experienceLevel ?? "",
            isPublic: c.isPublic ?? false,
            previousInjuries: (med.previousInjuries as string) ?? "",
            currentInjury: (med.currentInjury as string) ?? "",
            surgeries: (med.surgeries as string) ?? "",
            asthma: (med.asthma as boolean) ?? false,
            pathologies: (med.pathologies as string) ?? "",
            chronicDiseases: (med.chronicDiseases as string) ?? "",
            cardiacConditions: (med.cardiacConditions as string) ?? "",
            inscriptionProof: (docs.inscriptionProof as string) ?? "",
            medicalInsurance: (docs.medicalInsurance as string) ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  function setStr(field: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((v) => ({ ...v, [field]: e.target.value }));
  }

  function setBool(field: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((v) => ({ ...v, [field]: e.target.checked }));
  }

  function setDoc(field: "inscriptionProof" | "medicalInsurance") {
    return (key: string) => setFields((v) => ({ ...v, [field]: key }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const body = {
      heightCm: fields.heightCm,
      weightKg: fields.weightKg,
      phone: fields.phone,
      publicEmail: fields.publicEmail,
      experienceLevel: fields.experienceLevel || undefined,
      isPublic: fields.isPublic,
      medicalInfo: {
        previousInjuries: fields.previousInjuries,
        currentInjury: fields.currentInjury,
        surgeries: fields.surgeries,
        asthma: fields.asthma,
        pathologies: fields.pathologies,
        chronicDiseases: fields.chronicDiseases,
        cardiacConditions: fields.cardiacConditions,
      },
      documents: {
        inscriptionProof: fields.inscriptionProof,
        medicalInsurance: fields.medicalInsurance,
      },
    };

    try {
      const res = await fetch("/api/onboarding/student/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        const fieldErrors = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";
        setError(fieldErrors || result.message || "No se pudo guardar la ficha.");
        return;
      }

      router.push("/onboarding/student/specialized");
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
      step={2}
      label="Paso 2 de 3 — Opcional"
      title="Ficha deportiva general"
      description="Esta información ayuda a los entrenadores a encontrarte. Puedes completarla después."
    >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Fisico */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="ob-height"
              name="heightCm"
              type="number"
              min={50}
              max={270}
              label="Estatura (cm)"
              placeholder="175"
              value={fields.heightCm}
              onChange={setStr("heightCm")}
            />
            <Input
              id="ob-weight"
              name="weightKg"
              type="number"
              min={20}
              max={400}
              label="Peso (kg)"
              placeholder="70"
              value={fields.weightKg}
              onChange={setStr("weightKg")}
            />
          </div>
          <Input
            id="ob-phone"
            name="phone"
            type="tel"
            label="Teléfono de contacto"
            placeholder="55 1234 5678"
            maxLength={10}
            value={fields.phone}
            onChange={setStr("phone")}
          />
          <Input
            id="ob-pub-email"
            name="publicEmail"
            type="email"
            label="Correo público (opcional)"
            placeholder="tu@correo.com"
            value={fields.publicEmail}
            onChange={setStr("publicEmail")}
          />
          <Select
            id="ob-level"
            name="experienceLevel"
            label="Nivel de experiencia"
            options={LEVEL_OPTIONS}
            value={fields.experienceLevel}
            onChange={setStr("experienceLevel")}
          />

          {/* Salud */}
          <SectionTitle>Salud / Condición física</SectionTitle>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Lesiones previas</span>
            <textarea
              name="previousInjuries"
              rows={2}
              placeholder="Describe lesiones anteriores relevantes..."
              className={TA_CLASS}
              value={fields.previousInjuries}
              onChange={setStr("previousInjuries")}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Lesión actual</span>
            <textarea
              name="currentInjury"
              rows={2}
              placeholder="Describe si tienes alguna lesion activa..."
              className={TA_CLASS}
              value={fields.currentInjury}
              onChange={setStr("currentInjury")}
            />
          </label>
          <Input
            id="ob-surgeries"
            name="surgeries"
            label="Cirugías"
            placeholder="Tipo de cirugia y ano..."
            value={fields.surgeries}
            onChange={setStr("surgeries")}
          />
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-brand-primary">
            <input
              type="checkbox"
              name="asthma"
              className="h-4 w-4 rounded border-brand-border accent-interaction"
              checked={fields.asthma}
              onChange={setBool("asthma")}
            />
            Padece asma
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Patologías relevantes para el deporte</span>
            <textarea
              name="pathologies"
              rows={2}
              placeholder="Ej. displasia de cadera, escoliosis..."
              className={TA_CLASS}
              value={fields.pathologies}
              onChange={setStr("pathologies")}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Enfermedades crónicas</span>
            <textarea
              name="chronicDiseases"
              rows={2}
              placeholder="Ej. diabetes, hipertensión..."
              className={TA_CLASS}
              value={fields.chronicDiseases}
              onChange={setStr("chronicDiseases")}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
            <span>Padecimientos cardíacos</span>
            <textarea
              name="cardiacConditions"
              rows={2}
              placeholder="Ej. soplo cardíaco, arritmia..."
              className={TA_CLASS}
              value={fields.cardiacConditions}
              onChange={setStr("cardiacConditions")}
            />
          </label>
          <p className="text-xs text-brand-primary/70">
            Esta información es solo informativa para entrenadores y personal médico; no afecta el cálculo de afinidad.
          </p>

          {/* Documentación */}
          <SectionTitle>Documentación</SectionTitle>
          <PdfUploadField
            id="ob-inscription"
            kind="inscription-proof"
            label="Comprobante de inscripción"
            value={fields.inscriptionProof}
            onChange={setDoc("inscriptionProof")}
            helpText="Sube el PDF de tu comprobante de inscripción."
          />
          <PdfUploadField
            id="ob-insurance"
            kind="medical-insurance"
            label="Seguro médico"
            value={fields.medicalInsurance}
            onChange={setDoc("medicalInsurance")}
            helpText="Sube el PDF de tu comprobante de seguro médico."
          />

          {/* Visibilidad */}
          <SectionTitle>Visibilidad</SectionTitle>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-brand-primary">
            <input
              type="checkbox"
              name="isPublic"
              className="h-4 w-4 rounded border-brand-border accent-interaction"
              checked={fields.isPublic}
              onChange={setBool("isPublic")}
            />
            Hacer mi ficha visible para entrenadores
          </label>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar y continuar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Saltar
            </Button>
          </div>
        </form>
    </OnboardingCard>
  );
}
