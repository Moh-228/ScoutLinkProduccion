"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";

const LEVEL_OPTIONS = [
  { label: "Selecciona tu nivel (opcional)", value: "" },
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Avanzado", value: "advanced" },
];

const TA_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-600";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50">
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
    <Card>
      <CardHeader>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          Paso 2 de 3 — Opcional
        </div>
        <CardTitle>Ficha deportiva general</CardTitle>
        <p className="text-sm text-white/70">
          Esta información ayuda a los entrenadores a encontrarte. Puedes completarla después.
        </p>
      </CardHeader>
      <CardContent>
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
          <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
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
          <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
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
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-white">
            <input
              type="checkbox"
              name="asthma"
              className="h-4 w-4 rounded border-slate-300"
              checked={fields.asthma}
              onChange={setBool("asthma")}
            />
            Padece asma
          </label>

          {/* Documentación */}
          <SectionTitle>Documentación</SectionTitle>
          <Input
            id="ob-inscription"
            name="inscriptionProof"
            label="Comprobante de inscripcion en URL"
            placeholder="https://drive.google.com/file/..."
            value={fields.inscriptionProof}
            onChange={setStr("inscriptionProof")}
          />
          <Input
            id="ob-insurance"
            name="medicalInsurance"
            label="Seguro medico en URL"
            placeholder="https://drive.google.com/file/..."
            value={fields.medicalInsurance}
            onChange={setStr("medicalInsurance")}
          />

          {/* Visibilidad */}
          <SectionTitle>Visibilidad</SectionTitle>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-white">
            <input
              type="checkbox"
              name="isPublic"
              className="h-4 w-4 rounded border-slate-300"
              checked={fields.isPublic}
              onChange={setBool("isPublic")}
            />
            Hacer mi ficha visible para entrenadores
          </label>

          {error ? (
            <p
              className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}

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
      </CardContent>
    </Card>
  );
}
