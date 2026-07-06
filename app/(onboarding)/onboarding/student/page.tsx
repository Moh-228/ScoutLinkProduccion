"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
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
          });
        }
      })
      .catch(() => {});
  }, []);

  function set(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));
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
            <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
              <span>Género</span>
              <select
                name="gender"
                value={values.gender}
                onChange={set("gender")}
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
