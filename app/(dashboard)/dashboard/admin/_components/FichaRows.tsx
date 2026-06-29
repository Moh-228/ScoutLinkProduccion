"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

// ─── Shared action button ─────────────────────────────────────────────────────

function ActionButton({
  url,
  method = "DELETE",
  body,
  label,
  confirmText,
  variant = "danger",
}: {
  url: string;
  method?: string;
  body?: Record<string, unknown>;
  label: string;
  confirmText?: string;
  variant?: "danger" | "secondary";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction() {
    if (confirmText && !confirm(confirmText)) return;
    setLoading(true);
    setError(null);
    const res = await fetch(url, {
      method,
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    setLoading(false);
    if (!data.ok) { setError(data.message ?? "Error."); return; }
    startTransition(() => router.refresh());
  }

  const cls =
    variant === "danger"
      ? "px-3 py-1 text-xs text-red-400 hover:bg-red-500/20"
      : "px-3 py-1 text-xs text-white/60 hover:bg-white/10";

  return (
    <div>
      <Button variant="ghost" disabled={loading || pending} onClick={handleAction} className={cls}>
        {loading ? "..." : label}
      </Button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const sportLabels: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

const eventTypeLabels: Record<string, string> = {
  training: "Entrenamiento",
  tournament: "Torneo",
  recruitment: "Reclutamiento",
};

const expLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const verifLabels: Record<string, string> = {
  pending: "Pendiente",
  verified: "Verificado",
  rejected: "Rechazado",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Student = { id: string; email: string; studentProfile: { fullName: string } | null };
type Coach = { id: string; email: string; coachProfile: { displayName: string } | null };

export type GeneralCard = {
  id: string;
  heightCm: number | null;
  weightKg: number | null;
  phone: string | null;
  publicEmail: string | null;
  experienceLevel: string | null;
  isPublic: boolean;
  student: Student;
};

export type SpecializedCard = {
  id: string;
  sport: string;
  data: unknown;
  student: Student;
};

export type EventCard = {
  id: string;
  title: string;
  type: string;
  sport: string;
  status: string;
  coach: Coach;
};

export type CoachProfile = {
  userId: string;
  displayName: string;
  academicUnit: string | null;
  phone: string | null;
  bio: string | null;
  sports: string[];
  user: {
    email: string;
    coachVerifications: { sport: string; status: string }[];
  };
};

// ─── Row components ───────────────────────────────────────────────────────────

export function GeneralCardRow({ card }: { card: GeneralCard }) {
  const [expanded, setExpanded] = useState(false);
  const name = card.student.studentProfile?.fullName ?? card.student.email;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-slate-400">
            {card.heightCm ? `${card.heightCm} cm` : "—"} ·{" "}
            {card.weightKg ? `${card.weightKg} kg` : "—"}
            {card.experienceLevel
              ? ` · ${expLabels[card.experienceLevel] ?? card.experienceLevel}`
              : ""}
          </p>
          <Badge variant={card.isPublic ? "success" : "neutral"} className="mt-1">
            {card.isPublic ? "Pública" : "Privada"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/fichas/${card.id}`}>
            <Button variant="secondary" className="px-3 py-1 text-xs">Ver detalle</Button>
          </Link>
          <Button
            variant="ghost"
            className="px-3 py-1 text-xs text-white/60 hover:bg-white/10"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Ocultar" : "Editar"}
          </Button>
          <ActionButton
            url={`/api/admin/fichas/student-general/${card.id}`}
            label="Eliminar"
            confirmText={`¿Eliminar la ficha general de ${name}? Esta acción es irreversible.`}
          />
        </div>
      </div>

      {expanded && <GeneralCardEditForm card={card} />}
    </div>
  );
}

function GeneralCardEditForm({ card }: { card: GeneralCard }) {
  const router = useRouter();
  const [values, setValues] = useState({
    heightCm: card.heightCm?.toString() ?? "",
    weightKg: card.weightKg?.toString() ?? "",
    phone: card.phone ?? "",
    publicEmail: card.publicEmail ?? "",
    experienceLevel: card.experienceLevel ?? "",
    isPublic: card.isPublic,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const res = await fetch(`/api/admin/fichas/student-general/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    setSaving(false);
    if (!data.ok) { setError(data.message ?? "Error al guardar."); return; }
    setSuccess(true);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/30 outline-none";

  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
        Editar ficha general
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Estatura (cm)
          <input
            className={inputCls}
            value={values.heightCm}
            onChange={(e) => setValues((v) => ({ ...v, heightCm: e.target.value }))}
            placeholder="175"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Peso (kg)
          <input
            className={inputCls}
            value={values.weightKg}
            onChange={(e) => setValues((v) => ({ ...v, weightKg: e.target.value }))}
            placeholder="70"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Teléfono
          <input
            className={inputCls}
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            placeholder="55 1234 5678"
            maxLength={10}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Correo público
          <input
            className={inputCls}
            type="email"
            value={values.publicEmail}
            onChange={(e) => setValues((v) => ({ ...v, publicEmail: e.target.value }))}
            placeholder="contacto@correo.com"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Nivel de experiencia
          <select
            className={inputCls}
            value={values.experienceLevel}
            onChange={(e) => setValues((v) => ({ ...v, experienceLevel: e.target.value }))}
          >
            <option value="">—</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-white/60 pt-4">
          <input
            type="checkbox"
            checked={values.isPublic}
            onChange={(e) => setValues((v) => ({ ...v, isPublic: e.target.checked }))}
          />
          Ficha pública
        </label>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">Guardado correctamente.</p>}
      <Button onClick={handleSave} disabled={saving} className="text-xs px-3 py-1">
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}

export function SpecializedCardRow({ card }: { card: SpecializedCard }) {
  const [expanded, setExpanded] = useState(false);
  const name = card.student.studentProfile?.fullName ?? card.student.email;
  const dataEntries =
    card.data && typeof card.data === "object"
      ? Object.entries(card.data as Record<string, unknown>)
      : [];

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-slate-400">
            Deporte: {sportLabels[card.sport] ?? card.sport}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="px-3 py-1 text-xs text-white/60 hover:bg-white/10"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Ocultar" : "Ver datos"}
          </Button>
          <ActionButton
            url={`/api/admin/fichas/student-specialized/${card.id}`}
            label="Eliminar"
            confirmText={`¿Eliminar la ficha especializada de ${name}? Esta acción es irreversible.`}
          />
        </div>
      </div>

      {expanded && (
        <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Datos especializados — {sportLabels[card.sport] ?? card.sport}
          </p>
          {dataEntries.length === 0 ? (
            <p className="text-xs text-white/40">Sin datos registrados.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {dataEntries.map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-white/50 capitalize">{k.replace(/_/g, " ")}</span>
                  <span className="text-white font-medium">{String(v ?? "—")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EventRow({ event }: { event: EventCard }) {
  const coachName = event.coach.coachProfile?.displayName ?? event.coach.email;
  const isOpen = event.status === "open";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <div>
        <p className="font-semibold">{event.title}</p>
        <p className="text-sm text-slate-400">
          {eventTypeLabels[event.type] ?? event.type} · {sportLabels[event.sport] ?? event.sport}
        </p>
        <p className="text-sm text-slate-400">Coach: {coachName}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isOpen ? "success" : "neutral"}>
          {isOpen ? "Abierto" : "Cerrado"}
        </Badge>
        <Link href={`/dashboard/events/${event.id}`}>
          <Button variant="secondary" className="px-3 py-1 text-xs">Ver</Button>
        </Link>
        <Link href={`/dashboard/events/${event.id}/edit`}>
          <Button variant="ghost" className="px-3 py-1 text-xs text-white/60 hover:bg-white/10">
            Editar
          </Button>
        </Link>
        {isOpen && (
          <ActionButton
            url={`/api/admin/fichas/events/${event.id}`}
            method="PATCH"
            body={{ status: "closed" }}
            label="Desactivar"
            confirmText={`¿Desactivar "${event.title}"? Los estudiantes ya no podrán postularse.`}
            variant="secondary"
          />
        )}
        <ActionButton
          url={`/api/admin/fichas/events/${event.id}`}
          label="Eliminar"
          confirmText={`¿Eliminar "${event.title}"? Esta acción es irreversible.`}
        />
      </div>
    </div>
  );
}

export function CoachProfileRow({ coach }: { coach: CoachProfile }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{coach.displayName}</p>
          <p className="text-sm text-slate-400">{coach.user.email}</p>
          {coach.academicUnit && (
            <p className="text-sm text-slate-400">{coach.academicUnit}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-1">
            {coach.user.coachVerifications.map((v) => (
              <Badge
                key={v.sport}
                variant={
                  v.status === "verified"
                    ? "success"
                    : v.status === "rejected"
                    ? "danger"
                    : "warning"
                }
              >
                {sportLabels[v.sport] ?? v.sport}: {verifLabels[v.status] ?? v.status}
              </Badge>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          className="px-3 py-1 text-xs text-white/60 hover:bg-white/10"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Ocultar" : "Ver detalle"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-3 space-y-2 text-sm">
          {coach.phone && (
            <p>
              <span className="text-white/50">Teléfono:</span> {coach.phone}
            </p>
          )}
          {coach.sports.length > 0 && (
            <p>
              <span className="text-white/50">Deportes:</span>{" "}
              {coach.sports.map((s) => sportLabels[s] ?? s).join(", ")}
            </p>
          )}
          {coach.bio && (
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Biografía</p>
              <p className="text-white/80 whitespace-pre-line">{coach.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

