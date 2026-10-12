"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { OnboardingCard } from "@/app/(onboarding)/_components/OnboardingCard";
import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";
import { PhotoUploadField } from "@/components/PhotoUploadField";
import { Select } from "@/components/Select";

const SPORT_OPTIONS = [
  { label: "Selecciona un deporte (opcional)", value: "" },
  { label: "Básquetbol", value: "basketball" },
  { label: "Fútbol", value: "soccer" },
  { label: "Tocho Bandera", value: "flag_football" },
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

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    birthDate: "",
    school: "",
    semester: "",
    gender: "",
    favoriteSport: "",
    socialLink: "",
    photoUrl: "",
  });

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((result) => {
        if (result.ok && result.data?.profile) {
          const p = result.data.profile;
          setValues({
            fullName: p.fullName ?? "",
            birthDate: p.birthDate ? String(p.birthDate).split("T")[0] : "",
            school: p.school ?? "",
            semester: p.semester != null ? String(p.semester) : "",
            gender: p.gender ?? "",
            favoriteSport: p.favoriteSport ?? "",
            socialLink: p.socialLink ?? "",
            photoUrl: p.photoUrl ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  function set(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function setPhoto(key: string) {
    setValues((v) => ({ ...v, photoUrl: key }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!values.school) {
      setError("La unidad académica es obligatoria.");
      return;
    }

    setIsSubmitting(true);

    const body = {
      fullName: values.fullName.trim(),
      birthDate: values.birthDate,
      school: values.school || undefined,
      semester: values.semester,
      gender: values.gender || undefined,
      favoriteSport: values.favoriteSport || undefined,
      socialLink: values.socialLink,
      photoUrl: values.photoUrl,
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
    <OnboardingCard
      step={1}
      label="Paso 1 de 3"
      title="Completa tu perfil"
      description="Estos datos son obligatorios para usar la plataforma."
    >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <PhotoUploadField
            id="ob-photo"
            label="Foto de perfil"
            displayName={values.fullName}
            value={values.photoUrl}
            onChange={setPhoto}
          />
          <Input
            id="ob-name"
            name="fullName"
            label="Nombre completo"
            placeholder="Tu nombre"
            required
            value={values.fullName}
            onChange={set("fullName")}
          />
          <Input
            id="ob-birth"
            name="birthDate"
            type="date"
            label="Fecha de nacimiento"
            value={values.birthDate}
            onChange={set("birthDate")}
          />
          <Select
            id="ob-school"
            name="school"
            label="Unidad académica / escuela *"
            options={SCHOOL_OPTIONS}
            value={values.school}
            onChange={set("school")}
            required
          />
          <Input
            id="ob-semester"
            name="semester"
            type="number"
            min={1}
            max={12}
            label="Semestre actual"
            placeholder="1-12"
            value={values.semester}
            onChange={set("semester")}
          />
          <div>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
              <span>Género</span>
              <select
                name="gender"
                value={values.gender}
                onChange={set("gender")}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-primary shadow-sm outline-none transition-colors focus:border-interaction focus:ring-2 focus:ring-interaction/40"
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
            value={values.favoriteSport}
            onChange={set("favoriteSport")}
          />
          <Input
            id="ob-social"
            name="socialLink"
            type="url"
            label="Red social o portafolio (opcional)"
            placeholder="https://..."
            value={values.socialLink}
            onChange={set("socialLink")}
          />

          {error ? <Alert variant="error">{error}</Alert> : null}

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
    </OnboardingCard>
  );
}
