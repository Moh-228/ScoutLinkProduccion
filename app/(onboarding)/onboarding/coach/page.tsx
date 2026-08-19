"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { PhotoUploadField } from "@/components/PhotoUploadField";
import { Select } from "@/components/Select";

const SPORTS = [
  { label: "Básquetbol", value: "basketball" },
  { label: "Fútbol", value: "soccer" },
  { label: "Flag Football", value: "flag_football" },
  { label: "Voleibol", value: "volleyball" },
];

const SCHOOL_OPTIONS = [
  { label: "Selecciona tu unidad académica *", value: "" },
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
  const [values, setValues] = useState({
    displayName: "",
    academicUnit: "",
    phone: "",
    bio: "",
    photoUrl: "",
  });

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((result) => {
        if (result.ok && result.data?.profile) {
          const p = result.data.profile;
          setValues({
            displayName: p.displayName ?? "",
            academicUnit: p.academicUnit ?? "",
            phone: p.phone ?? "",
            bio: p.bio ?? "",
            photoUrl: p.photoUrl ?? "",
          });
          if (Array.isArray(p.sports) && p.sports.length > 0) {
            setSelectedSports(p.sports);
          }
        }
      })
      .catch(() => {});
  }, []);

  function set(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function setPhoto(key: string) {
    setValues((v) => ({ ...v, photoUrl: key }));
  }

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

    if (!values.academicUnit) {
      setError("La unidad académica es obligatoria.");
      return;
    }

    setIsSubmitting(true);

    const body = {
      displayName: values.displayName.trim(),
      academicUnit: values.academicUnit || undefined,
      phone: values.phone,
      bio: values.bio,
      sports: selectedSports,
      photoUrl: values.photoUrl,
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
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
          Paso 1 de 3
        </div>
        <CardTitle>Configura tu perfil de entrenador</CardTitle>
        <CardDescription>
          Completa tu información profesional para comenzar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <PhotoUploadField
            id="ob-c-photo"
            label="Foto de perfil"
            displayName={values.displayName}
            value={values.photoUrl}
            onChange={setPhoto}
          />
          <Input
            id="ob-c-name"
            name="displayName"
            label="Nombre para mostrar"
            placeholder="Prof. Juan Garcia"
            required
            value={values.displayName}
            onChange={set("displayName")}
          />
          <Select
            id="ob-c-unit"
            name="academicUnit"
            label="Unidad académica *"
            options={SCHOOL_OPTIONS}
            value={values.academicUnit}
            onChange={set("academicUnit")}
            required
          />
          <Input
            id="ob-c-phone"
            name="phone"
            type="tel"
            label="Teléfono de contacto"
            placeholder="55 1234 5678"
            maxLength={10}
            value={values.phone}
            onChange={set("phone")}
          />
          <div>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
              <span>Biografía / presentación</span>
              <textarea
                name="bio"
                rows={3}
                placeholder="Describe tu experiencia y enfoque como entrenador..."
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40"
                value={values.bio}
                onChange={set("bio")}
              />
            </label>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-brand-primary">
              Deportes a cargo <span className="text-red-500">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.map((sport) => (
                <label
                  key={sport.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-interaction has-focus-visible:ring-offset-2 ${
                    selectedSports.includes(sport.value)
                      ? "border-interaction bg-interaction/10 text-interaction"
                      : "border-brand-border text-brand-primary/70 hover:border-brand-secondary/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedSports.includes(sport.value)}
                    onChange={() => toggleSport(sport.value)}
                  />
                  <span
                    className={`h-4 w-4 shrink-0 rounded border ${
                      selectedSports.includes(sport.value) ? "border-interaction bg-interaction" : "border-brand-border"
                    }`}
                    aria-hidden="true"
                  />
                  {sport.label}
                </label>
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => router.push("/dashboard/profile")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
