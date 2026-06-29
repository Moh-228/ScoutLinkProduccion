"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select, type SelectOption } from "@/components/Select";
import { SPORT_CHARACTERISTICS, type CharField } from "@/lib/sport-characteristics";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = "tournament" | "training" | "recruitment";

type SportsChar = Record<string, string | string[]>;

type FormState = {
  type: EventType;
  sport: string;
  title: string;
  visibility: string;
  academicUnit: string;
  shortDescription: string;
  longDescription: string;
  locationText: string;
  mapsUrl: string;
  startAt: string;
  endAt: string;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  capacity: string;
  registrationDeadline: string;
  cost: string;
  notes: string;
  autoClose: boolean;
  format: string;
  category: string;
  minTeams: string;
  maxTeams: string;
  playersPerTeam: string;
  substitutes: string;
  rulesLink: string;
  gameDays: string[];
  timeWindow: string;
  registrationRequirements: string;
  targetTeam: string;
  level: string;
  sportsCharacteristics: SportsChar;
  whatToBring: string;
  evaluationFormat: string;
};

type Props = {
  organizerName: string;
  defaultAcademicUnit: string;
  /** When provided (coach role), only these sports can be selected */
  verifiedSports?: string[];
};

// ─── (SPORT_CHARACTERISTICS imported from @/lib/sport-characteristics) ────────

// ─── Step definitions ─────────────────────────────────────────────────────────

type StepId =
  | "base"
  | "location"
  | "schedule"
  | "tournament_details"
  | "recruitment"
  | "sport_characteristics"
  | "registration"
  | "description";

const STEP_LABELS: Record<StepId, string> = {
  base: "Información base",
  location: "Fecha y lugar",
  schedule: "Horario y lugar",
  tournament_details: "Formato del torneo",
  recruitment: "Reclutamiento",
  sport_characteristics: "Características buscadas",
  registration: "Registro",
  description: "Descripción",
};

function getSteps(type: EventType): StepId[] {
  if (type === "tournament")  return ["base", "location", "tournament_details", "registration", "description"];
  if (type === "training")    return ["base", "schedule", "registration", "description"];
  /* recruitment */           return ["base", "location", "recruitment", "sport_characteristics", "registration", "description"];
}

// ─── Select/textarea constants ────────────────────────────────────────────────

const SPORT_OPTIONS: SelectOption[] = [
  { label: "Selecciona un deporte", value: "" },
  { label: "Básquetbol", value: "basketball" },
  { label: "Fútbol", value: "soccer" },
  { label: "Flag Football (Tocho)", value: "flag_football" },
  { label: "Voleibol", value: "volleyball" },
];

const VISIBILITY_OPTIONS: SelectOption[] = [
  { label: "Pública (todas las unidades)", value: "public" },
  { label: "Solo mi deporte", value: "sport" },
  { label: "Solo mi unidad académica", value: "unit" },
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { label: "Selecciona", value: "" },
  { label: "Varonil", value: "V" },
  { label: "Femenil", value: "F" },
  { label: "Mixto", value: "Mixto" },
];

const FORMAT_OPTIONS: SelectOption[] = [
  { label: "Selecciona", value: "" },
  { label: "Liga (todos contra todos)", value: "liga" },
  { label: "Eliminación directa (KO)", value: "KO" },
  { label: "Fase de grupos + eliminatoria", value: "grupos" },
];

const LEVEL_OPTIONS: SelectOption[] = [
  { label: "Selecciona", value: "" },
  { label: "Abierto (cualquier nivel)", value: "open" },
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Experimentado", value: "experienced" },
];

const WEEK_DAYS = [
  { value: "lunes", label: "Lun" },
  { value: "martes", label: "Mar" },
  { value: "miercoles", label: "Mié" },
  { value: "jueves", label: "Jue" },
  { value: "viernes", label: "Vie" },
  { value: "sabado", label: "Sáb" },
  { value: "domingo", label: "Dom" },
];

const TA_CLASS =
  "w-full rounded-lg border border-[#18181b] bg-white px-3 py-2 text-black shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#18181b] text-sm";

// ─── Helper UI components ─────────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

function TextArea({
  id, label, value, onChange, rows = 3, placeholder,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-medium text-white">
      <span>{label}</span>
      <textarea
        id={id} rows={rows} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className={TA_CLASS}
      />
    </label>
  );
}

function DaysToggle({
  label, selected, onChange,
}: {
  label: string; selected: string[]; onChange: (d: string[]) => void;
}) {
  function toggle(day: string) {
    onChange(selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day]);
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white">{label}</p>
      <div className="flex flex-wrap gap-2">
        {WEEK_DAYS.map((d) => (
          <button key={d.value} type="button" onClick={() => toggle(d.value)}
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selected.includes(d.value) ? "bg-[#1883ff] text-white" : "bg-white/10 text-white/70 hover:bg-white/20",
            ].join(" ")}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ steps, current }: { steps: StepId[]; current: number }) {
  return (
    <nav aria-label="Pasos del formulario">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step} className="flex items-center gap-1">
              <span className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done ? "bg-emerald-500/30 text-emerald-300" : active ? "bg-[#1883ff] text-white" : "bg-white/10 text-white/40",
              ].join(" ")}>
                {done ? "✓" : i + 1}
              </span>
              <span className={[
                "hidden text-xs sm:inline",
                active ? "font-semibold text-white" : "text-white/40",
              ].join(" ")}>
                {STEP_LABELS[step]}
              </span>
              {i < steps.length - 1 && (
                <svg aria-hidden="true" className="mx-1 h-3 w-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Sport characteristics panel ─────────────────────────────────────────────

function SportCharacteristicsPanel({
  sport, characteristics, onChange,
}: {
  sport: string;
  characteristics: SportsChar;
  onChange: (key: string, value: string | string[]) => void;
}) {
  const fields = SPORT_CHARACTERISTICS[sport] ?? [];

  if (!sport) {
    return <p className="py-4 text-sm text-white/40">Selecciona un deporte en el primer paso para ver las características disponibles.</p>;
  }
  if (fields.length === 0) {
    return <p className="py-4 text-sm text-white/40">No hay características definidas para este deporte.</p>;
  }

  function toggleSkill(key: string, skill: string) {
    const current = (characteristics[key] as string[] | undefined) ?? [];
    onChange(key, current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-white/60">
        Selecciona las características que buscas. Estas se compararán con las fichas especializadas de los postulantes para calcular la afinidad de perfil.
      </p>
      {fields.map((field) => {
        if (field.type === "select") {
          return (
            <Select
              key={field.key}
              id={`sc-${field.key}`}
              label={field.label}
              options={field.options as SelectOption[]}
              value={(characteristics[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          );
        }
        if (field.type === "number") {
          return (
            <Input
              key={field.key}
              id={`sc-${field.key}`}
              type="number"
              label={field.label}
              min={field.min}
              max={field.max}
              placeholder={field.placeholder}
              value={(characteristics[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          );
        }
        // skills — multicheck
        const selected = (characteristics[field.key] as string[] | undefined) ?? [];
        return (
          <div key={field.key} className="space-y-2">
            <p className="text-sm font-medium text-white">{field.label}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {field.options.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-white/80 hover:text-white">
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggleSkill(field.key, opt.value)}
                    className="h-4 w-4 rounded border-slate-400 accent-[#1883ff]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <p className="text-xs text-[#1883ff]/70">
                {selected.length} seleccionada{selected.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function EventCreateForm({ organizerName, defaultAcademicUnit, verifiedSports }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    type: "tournament",
    sport: "",
    title: "",
    visibility: "public",
    academicUnit: defaultAcademicUnit,
    shortDescription: "",
    longDescription: "",
    locationText: "",
    mapsUrl: "",
    startAt: "",
    endAt: "",
    scheduleDays: [],
    startTime: "",
    endTime: "",
    capacity: "",
    registrationDeadline: "",
    cost: "",
    notes: "",
    autoClose: false,
    format: "",
    category: "",
    minTeams: "",
    maxTeams: "",
    playersPerTeam: "",
    substitutes: "",
    rulesLink: "",
    gameDays: [],
    timeWindow: "",
    registrationRequirements: "",
    targetTeam: "",
    level: "",
    sportsCharacteristics: {},
    whatToBring: "",
    evaluationFormat: "",
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setSportChar(key: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, sportsCharacteristics: { ...prev.sportsCharacteristics, [key]: value } }));
  }

  const steps = useMemo(() => getSteps(form.type), [form.type]);

  // Reset to step 0 whenever event type changes
  useEffect(() => { setCurrentStep(0); setError(""); }, [form.type]);

  const currentStepId = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const sportOptions = verifiedSports
    ? SPORT_OPTIONS.filter((o) => o.value === "" || verifiedSports.includes(o.value))
    : SPORT_OPTIONS;

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    const raw: Record<string, unknown> = {
      type: form.type,
      sport: form.sport,
      title: form.title,
      visibility: form.visibility,
      autoClose: form.autoClose,
    };

    const optionalStrings: (keyof FormState)[] = [
      "academicUnit", "shortDescription", "longDescription", "locationText",
      "mapsUrl", "startAt", "endAt", "registrationDeadline", "cost", "notes",
      "timeWindow", "registrationRequirements", "startTime", "endTime",
      "targetTeam", "rulesLink", "whatToBring", "evaluationFormat", "format",
      "category", "level",
    ];
    for (const k of optionalStrings) {
      const v = form[k];
      if (typeof v === "string" && v.trim()) raw[k] = v.trim();
    }

    const optionalNumbers: (keyof FormState)[] = ["capacity", "minTeams", "maxTeams", "playersPerTeam", "substitutes"];
    for (const k of optionalNumbers) {
      const v = form[k];
      if (typeof v === "string" && v !== "") raw[k] = Number(v);
    }

    if (form.gameDays.length > 0) raw.gameDays = form.gameDays;
    if (form.scheduleDays.length > 0) raw.scheduleDays = form.scheduleDays;

    // sportsCharacteristics: filter out empty strings and empty arrays
    const chars = Object.fromEntries(
      Object.entries(form.sportsCharacteristics).filter(([, v]) =>
        Array.isArray(v) ? v.length > 0 : Boolean(v),
      ),
    );
    if (Object.keys(chars).length > 0) raw.sportsCharacteristics = chars;

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      const result = await res.json() as { ok: boolean; data?: { id: string }; message?: string; errors?: Record<string, string[]> };
      if (!res.ok || !result.ok) {
        const fieldErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
        setError(fieldErrors || result.message || "No se pudo crear el evento.");
        return;
      }
      router.push(`/dashboard/events/${result.data!.id}`);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function handleNext() {
    if (currentStepId === "base") {
      if (!form.type || !form.sport || !form.title.trim()) {
        setError("Completa el tipo de evento, deporte y título para continuar.");
        return;
      }
    }
    setError("");
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function handleBack() {
    setError("");
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  // ── Step content ────────────────────────────────────────────────────────────

  function renderStep() {
    switch (currentStepId) {
      case "base":
        return (
          <div className="space-y-4">
            <Row>
              <Select
                id="type"
                label="Tipo de evento"
                options={[
                  { label: "Torneo", value: "tournament" },
                  { label: "Reclutamiento", value: "recruitment" },
                  { label: "Entrenamiento", value: "training" },
                ]}
                value={form.type}
                onChange={(e) => set("type", e.target.value as EventType)}
              />
              <Select
                id="sport"
                label="Deporte"
                options={sportOptions}
                value={form.sport}
                onChange={(e) => set("sport", e.target.value)}
              />
            </Row>
            <Input
              id="title"
              label="Título del evento"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ej: 1er Torneo Interescolar de Básquetbol ESIME"
              required
            />
            <Row>
              <Input id="organizer" label="Organizador" value={organizerName} readOnly className="bg-slate-100 cursor-not-allowed" />
              <Input id="academicUnit" label="Unidad académica" value={form.academicUnit} onChange={(e) => set("academicUnit", e.target.value)} placeholder="Ej: ESIME Zacatenco" />
            </Row>
            <Select id="visibility" label="Visibilidad" options={VISIBILITY_OPTIONS} value={form.visibility} onChange={(e) => set("visibility", e.target.value)} />
          </div>
        );

      case "location":
        return (
          <div className="space-y-4">
            <Row>
              <Input id="startAt" label="Fecha y hora de inicio" type="datetime-local" value={form.startAt} onChange={(e) => set("startAt", e.target.value)} />
              <Input id="endAt" label="Fecha y hora de fin" type="datetime-local" value={form.endAt} onChange={(e) => set("endAt", e.target.value)} />
            </Row>
            <Input id="locationText" label="Sede / dirección" value={form.locationText} onChange={(e) => set("locationText", e.target.value)} placeholder="Ej: Gimnasio Rolando Zapata, ESIME Zacatenco" />
            <Input id="mapsUrl" label="Link de Google Maps" type="url" value={form.mapsUrl} onChange={(e) => set("mapsUrl", e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
        );

      case "schedule":
        return (
          <div className="space-y-4">
            <DaysToggle label="Días de entrenamiento" selected={form.scheduleDays} onChange={(days) => set("scheduleDays", days)} />
            <Row>
              <Input id="startTime" label="Hora inicio" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
              <Input id="endTime" label="Hora fin" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
            </Row>
            <Input id="locationText-t" label="Sede / dirección" value={form.locationText} onChange={(e) => set("locationText", e.target.value)} placeholder="Ej: Cancha principal, ESIME Zacatenco" />
            <Input id="mapsUrl-t" label="Link de Google Maps" type="url" value={form.mapsUrl} onChange={(e) => set("mapsUrl", e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
        );

      case "tournament_details":
        return (
          <div className="space-y-4">
            <Row>
              <Select id="format" label="Formato" options={FORMAT_OPTIONS} value={form.format} onChange={(e) => set("format", e.target.value)} />
              <Select id="category" label="Categoría" options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => set("category", e.target.value)} />
            </Row>
            <Row>
              <Input id="minTeams" label="Equipos mínimos" type="number" min={2} value={form.minTeams} onChange={(e) => set("minTeams", e.target.value)} />
              <Input id="maxTeams" label="Equipos máximos" type="number" min={2} value={form.maxTeams} onChange={(e) => set("maxTeams", e.target.value)} />
            </Row>
            <Row>
              <Input id="playersPerTeam" label="Jugadores por equipo" type="number" min={1} value={form.playersPerTeam} onChange={(e) => set("playersPerTeam", e.target.value)} />
              <Input id="substitutes" label="Suplentes por equipo" type="number" min={0} value={form.substitutes} onChange={(e) => set("substitutes", e.target.value)} />
            </Row>
            <Input id="rulesLink" label="Link de reglamento" type="url" value={form.rulesLink} onChange={(e) => set("rulesLink", e.target.value)} placeholder="https://..." />
            <DaysToggle label="Días de juego" selected={form.gameDays} onChange={(days) => set("gameDays", days)} />
            <Input id="timeWindow" label="Ventana horaria de partidos" value={form.timeWindow} onChange={(e) => set("timeWindow", e.target.value)} placeholder="Ej: 8:00 – 18:00" />
            <TextArea id="registrationRequirements" label="Requisitos de registro" value={form.registrationRequirements} onChange={(v) => set("registrationRequirements", v)} placeholder="Documentos, credenciales, condiciones…" />
          </div>
        );

      case "recruitment":
        return (
          <div className="space-y-4">
            <Input id="targetTeam" label="Equipo objetivo" value={form.targetTeam} onChange={(e) => set("targetTeam", e.target.value)} placeholder="Nombre del equipo que recluta" />
            <Row>
              <Select id="rec-category" label="Categoría" options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => set("category", e.target.value)} />
              <Select id="rec-level" label="Nivel requerido" options={LEVEL_OPTIONS} value={form.level} onChange={(e) => set("level", e.target.value)} />
            </Row>
            <SubTitle>Logística del día</SubTitle>
            <TextArea id="whatToBring" label="Qué llevar" value={form.whatToBring} onChange={(v) => set("whatToBring", v)} placeholder="Ropa deportiva, calzado, credencial vigente…" />
            <TextArea id="evaluationFormat" label="Formato de evaluación" value={form.evaluationFormat} onChange={(v) => set("evaluationFormat", v)} placeholder="Describe cómo se evaluará a los candidatos…" />
          </div>
        );

      case "sport_characteristics":
        return (
          <SportCharacteristicsPanel
            sport={form.sport}
            characteristics={form.sportsCharacteristics}
            onChange={setSportChar}
          />
        );

      case "registration":
        return (
          <div className="space-y-4">
            <Row>
              <Input
                id="capacity"
                label={form.type === "tournament" ? "Cupo máximo (equipos)" : "Cupo máximo (personas)"}
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                placeholder="Sin límite"
              />
              {form.type !== "training" && (
                <Input id="registrationDeadline" label="Límite de registro" type="datetime-local" value={form.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} />
              )}
            </Row>
            <Input id="cost" label="Costo (opcional)" value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="Ej: Gratis, $150 MXN…" />
            <TextArea id="notes" label="Notas / políticas" value={form.notes} onChange={(v) => set("notes", v)} placeholder="Reglas de pago, políticas de cancelación…" />
            <label className="flex cursor-pointer items-center gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                checked={form.autoClose}
                onChange={(e) => set("autoClose", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#1883ff]"
              />
              Cerrar registro automáticamente al alcanzar el cupo
            </label>
          </div>
        );

      case "description":
        return (
          <div className="space-y-4">
            <TextArea id="shortDescription" label="Descripción corta" value={form.shortDescription} onChange={(v) => set("shortDescription", v)} rows={2} placeholder="Resumen del evento (máx. 300 caracteres)" />
            <TextArea id="longDescription" label="Descripción larga" value={form.longDescription} onChange={(v) => set("longDescription", v)} rows={6} placeholder="Descripción detallada, contexto, objetivo del evento…" />
          </div>
        );

      default:
        return null;
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <StepIndicator steps={steps} current={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle>{STEP_LABELS[currentStepId]}</CardTitle>
          {currentStepId === "sport_characteristics" && form.sport && (
            <p className="text-sm text-white/50">
              {SPORT_OPTIONS.find((o) => o.value === form.sport)?.label ?? form.sport}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      <div className="flex justify-between gap-3 pb-8">
        <Button
          type="button"
          variant="secondary"
          onClick={isFirstStep ? () => router.push("/dashboard/events") : handleBack}
          disabled={isSubmitting}
        >
          {isFirstStep ? "Cancelar" : "← Atrás"}
        </Button>
        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={isSubmitting || !form.sport || !form.title}>
            {isSubmitting ? "Publicando…" : "Publicar evento"}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} disabled={isSubmitting}>
            Siguiente →
          </Button>
        )}
      </div>
    </div>
  );
}

