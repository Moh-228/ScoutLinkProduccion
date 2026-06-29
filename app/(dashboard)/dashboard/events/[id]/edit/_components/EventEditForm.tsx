"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select, type SelectOption } from "@/components/Select";

type EventType = "tournament" | "training" | "recruitment";

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
  sportsCharacteristics: Record<string, string>;
  whatToBring: string;
  evaluationFormat: string;
};

type Props = {
  eventId: string;
  initial: FormState;
};

const TA_CLASS =
  "w-full rounded-lg border border-[#18181b] bg-white px-3 py-2 text-black shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#18181b] text-sm";

const SPORT_OPTIONS: SelectOption[] = [
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

const POSITION_OPTIONS: Record<string, SelectOption[]> = {
  soccer: [
    { value: "", label: "Cualquier posición" },
    { value: "POR", label: "Portero (POR)" },
    { value: "DEF", label: "Defensa (DEF)" },
    { value: "MED", label: "Mediocampista (MED)" },
    { value: "DEL", label: "Delantero (DEL)" },
  ],
  basketball: [
    { value: "", label: "Cualquier posición" },
    { value: "PG", label: "Base (PG)" },
    { value: "SG", label: "Escolta (SG)" },
    { value: "SF", label: "Alero (SF)" },
    { value: "PF", label: "Ala-Pívot (PF)" },
    { value: "C", label: "Pívot (C)" },
  ],
  volleyball: [
    { value: "", label: "Cualquier posición" },
    { value: "punta", label: "Punta" },
    { value: "central", label: "Central" },
    { value: "opuesto", label: "Opuesto" },
    { value: "colocador", label: "Colocador" },
    { value: "libero", label: "Líbero" },
  ],
  flag_football: [
    { value: "", label: "Cualquier posición" },
    { value: "QB", label: "Quarterback (QB)" },
    { value: "WR", label: "Receptor (WR)" },
    { value: "RB", label: "Corredor (RB)" },
    { value: "OL", label: "Línea Ofensiva (OL)" },
    { value: "DB", label: "Defensa Secundaria (DB)" },
    { value: "LB", label: "Linebacker (LB)" },
    { value: "rush", label: "Rusher" },
  ],
};

const HAND_OPTIONS: SelectOption[] = [
  { value: "", label: "Indiferente" },
  { value: "right", label: "Diestro/a" },
  { value: "left", label: "Zurdo/a" },
  { value: "both", label: "Ambidiestro/a" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">
        {children}
      </h3>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function TextArea({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-medium text-white">
      <span>{label}</span>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={TA_CLASS}
      />
    </label>
  );
}

function DaysToggle({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string[];
  onChange: (days: string[]) => void;
}) {
  function toggle(day: string) {
    onChange(selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day]);
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white">{label}</p>
      <div className="flex flex-wrap gap-2">
        {WEEK_DAYS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => toggle(d.value)}
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selected.includes(d.value)
                ? "bg-[#1883ff] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20",
            ].join(" ")}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EventEditForm({ eventId, initial }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<FormState>(initial);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSportChar(key: string, val: string) {
    setForm((prev) => ({
      ...prev,
      sportsCharacteristics: { ...prev.sportsCharacteristics, [key]: val },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      "academicUnit", "shortDescription", "longDescription", "locationText", "mapsUrl",
      "startAt", "endAt", "registrationDeadline", "cost", "notes", "timeWindow",
      "registrationRequirements", "startTime", "endTime", "targetTeam", "rulesLink",
      "whatToBring", "evaluationFormat", "format", "category", "level",
    ];
    for (const k of optionalStrings) {
      const v = form[k];
      if (typeof v === "string" && v.trim()) raw[k] = v.trim();
    }

    const optionalNumbers: (keyof FormState)[] = [
      "capacity", "minTeams", "maxTeams", "playersPerTeam", "substitutes",
    ];
    for (const k of optionalNumbers) {
      const v = form[k];
      if (typeof v === "string" && v !== "") raw[k] = Number(v);
    }

    if (form.gameDays.length > 0) raw.gameDays = form.gameDays;
    if (form.scheduleDays.length > 0) raw.scheduleDays = form.scheduleDays;
    if (Object.keys(form.sportsCharacteristics).some((k) => form.sportsCharacteristics[k])) {
      raw.sportsCharacteristics = Object.fromEntries(
        Object.entries(form.sportsCharacteristics).filter(([, v]) => v),
      );
    }

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        const fieldErrors = result.errors
          ? Object.values(result.errors as Record<string, string[]>).flat().join(" ")
          : "";
        setError(fieldErrors || result.message || "No se pudo guardar el evento.");
        return;
      }

      router.push(`/dashboard/events/${eventId}`);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setError(result.message || "No se pudo eliminar el evento.");
        setConfirmDelete(false);
        return;
      }
      router.push("/dashboard/events");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  const isTournament = form.type === "tournament";
  const isTraining = form.type === "training";
  const isRecruitment = form.type === "recruitment";
  const positions = POSITION_OPTIONS[form.sport] ?? [];
  const hasHand = ["soccer", "basketball", "flag_football"].includes(form.sport);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Información base ── */}
      <Card>
        <CardHeader>
          <CardTitle>Información base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              options={SPORT_OPTIONS}
              value={form.sport}
              onChange={(e) => set("sport", e.target.value)}
            />
          </Row>
          <Input
            id="title"
            label="Título del evento"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
          <Row>
            <Input
              id="academicUnit"
              label="Unidad académica"
              value={form.academicUnit}
              onChange={(e) => set("academicUnit", e.target.value)}
            />
            <Select
              id="visibility"
              label="Visibilidad"
              options={VISIBILITY_OPTIONS}
              value={form.visibility}
              onChange={(e) => set("visibility", e.target.value)}
            />
          </Row>
        </CardContent>
      </Card>

      {/* ── Fecha, Hora y Lugar ── */}
      {(isTournament || isRecruitment) && (
        <Card>
          <CardHeader>
            <CardTitle>Fecha, hora y lugar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row>
              <Input
                id="startAt"
                label="Inicio"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => set("startAt", e.target.value)}
                required
              />
              <Input
                id="endAt"
                label="Fin"
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => set("endAt", e.target.value)}
              />
            </Row>
            <Input
              id="locationText"
              label="Sede / dirección"
              value={form.locationText}
              onChange={(e) => set("locationText", e.target.value)}
            />
            <Input
              id="mapsUrl"
              label="Link de Google Maps"
              type="url"
              value={form.mapsUrl}
              onChange={(e) => set("mapsUrl", e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Horario (entrenamiento) ── */}
      {isTraining && (
        <Card>
          <CardHeader>
            <CardTitle>Horario y lugar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DaysToggle
              label="Días de entrenamiento"
              selected={form.scheduleDays}
              onChange={(days) => set("scheduleDays", days)}
            />
            <Row>
              <Input
                id="startTime"
                label="Hora inicio"
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
              <Input
                id="endTime"
                label="Hora fin"
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </Row>
            <Input
              id="locationText"
              label="Sede / dirección"
              value={form.locationText}
              onChange={(e) => set("locationText", e.target.value)}
            />
            <Input
              id="mapsUrl"
              label="Link de Google Maps"
              type="url"
              value={form.mapsUrl}
              onChange={(e) => set("mapsUrl", e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Registro ── */}
      <Card>
        <CardHeader>
          <CardTitle>Registro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row>
            <Input
              id="capacity"
              label={isTournament ? "Cupo máximo (equipos)" : "Cupo máximo (personas)"}
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
            />
            {(isTournament || isRecruitment) && (
              <Input
                id="registrationDeadline"
                label="Límite de registro"
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)}
              />
            )}
          </Row>
          <Input
            id="cost"
            label="Costo"
            value={form.cost}
            onChange={(e) => set("cost", e.target.value)}
          />
          <TextArea
            id="notes"
            label="Notas / políticas"
            value={form.notes}
            onChange={(v) => set("notes", v)}
          />
          <label className="flex cursor-pointer items-center gap-3 text-sm text-white/90">
            <input
              type="checkbox"
              checked={form.autoClose}
              onChange={(e) => set("autoClose", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Cerrar registro automáticamente al alcanzar el cupo
          </label>
        </CardContent>
      </Card>

      {/* ── Descripción ── */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextArea
            id="shortDescription"
            label="Descripción corta"
            value={form.shortDescription}
            onChange={(v) => set("shortDescription", v)}
            rows={2}
          />
          <TextArea
            id="longDescription"
            label="Descripción larga"
            value={form.longDescription}
            onChange={(v) => set("longDescription", v)}
            rows={5}
          />
        </CardContent>
      </Card>

      {/* ── Detalles torneo ── */}
      {isTournament && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del torneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row>
              <Select
                id="format"
                label="Formato"
                options={FORMAT_OPTIONS}
                value={form.format}
                onChange={(e) => set("format", e.target.value)}
              />
              <Select
                id="category"
                label="Categoría"
                options={CATEGORY_OPTIONS}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </Row>
            <Row>
              <Input id="minTeams" label="Equipos mínimos" type="number" min={2} value={form.minTeams} onChange={(e) => set("minTeams", e.target.value)} />
              <Input id="maxTeams" label="Equipos máximos" type="number" min={2} value={form.maxTeams} onChange={(e) => set("maxTeams", e.target.value)} />
            </Row>
            <Row>
              <Input id="playersPerTeam" label="Jugadores por equipo" type="number" min={1} value={form.playersPerTeam} onChange={(e) => set("playersPerTeam", e.target.value)} />
              <Input id="substitutes" label="Suplentes" type="number" min={0} value={form.substitutes} onChange={(e) => set("substitutes", e.target.value)} />
            </Row>
            <Input id="rulesLink" label="Link de reglamento" type="url" value={form.rulesLink} onChange={(e) => set("rulesLink", e.target.value)} />
            <DaysToggle label="Días de juego" selected={form.gameDays} onChange={(days) => set("gameDays", days)} />
            <Input id="timeWindow" label="Ventana horaria" value={form.timeWindow} onChange={(e) => set("timeWindow", e.target.value)} />
            <TextArea id="registrationRequirements" label="Requisitos de registro" value={form.registrationRequirements} onChange={(v) => set("registrationRequirements", v)} />
          </CardContent>
        </Card>
      )}

      {/* ── Detalles reclutamiento ── */}
      {isRecruitment && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del reclutamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input id="targetTeam" label="Equipo objetivo" value={form.targetTeam} onChange={(e) => set("targetTeam", e.target.value)} />
            <Row>
              <Select id="rec-category" label="Categoría" options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => set("category", e.target.value)} />
              <Select id="rec-level" label="Nivel requerido" options={LEVEL_OPTIONS} value={form.level} onChange={(e) => set("level", e.target.value)} />
            </Row>
            {form.sport && (
              <>
                <SectionTitle>Características deportivas buscadas</SectionTitle>
                {positions.length > 0 && (
                  <Select
                    id="rec-position"
                    label="Posición buscada"
                    options={positions}
                    value={form.sportsCharacteristics.position ?? ""}
                    onChange={(e) => updateSportChar("position", e.target.value)}
                  />
                )}
                {hasHand && (
                  <Select
                    id="rec-hand"
                    label={form.sport === "soccer" ? "Pie dominante" : "Mano dominante"}
                    options={HAND_OPTIONS}
                    value={form.sportsCharacteristics.dominantHand ?? ""}
                    onChange={(e) => updateSportChar("dominantHand", e.target.value)}
                  />
                )}
              </>
            )}
            <SectionTitle>Información adicional</SectionTitle>
            <TextArea id="whatToBring" label="Qué llevar" value={form.whatToBring} onChange={(v) => set("whatToBring", v)} />
            <TextArea id="evaluationFormat" label="Formato de evaluación" value={form.evaluationFormat} onChange={(v) => set("evaluationFormat", v)} />
          </CardContent>
        </Card>
      )}

      {/* ── Acciones ── */}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      <div className="flex items-center justify-between gap-3 pb-8">
        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isSubmitting}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {isDeleting
            ? "Eliminando…"
            : confirmDelete
              ? "¿Confirmar eliminación?"
              : "Eliminar evento"}
        </button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/dashboard/events/${eventId}`)}
            disabled={isSubmitting || isDeleting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isDeleting || !form.sport || !form.title}>
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
