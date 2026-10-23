"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button, buttonClassNames } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { Icon, type IconName } from "@/components/Icon";
import { labelField, labelFieldValue } from "@/lib/ficha-labels";
import { SPORT_BADGE_CLASS } from "@/lib/sport-colors";

// ─── Shared action button ─────────────────────────────────────────────────────

function ActionButton({
  url,
  method = "DELETE",
  body,
  label,
  confirmText,
  variant = "danger",
  icon,
}: {
  url: string;
  method?: string;
  body?: Record<string, unknown>;
  label: string;
  confirmText?: string;
  variant?: "danger" | "secondary";
  /** When set, renders as a compact icon-only button instead of a text label. */
  icon?: IconName;
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

  if (icon) {
    const iconCls =
      variant === "danger"
        ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
        : "border-brand-border bg-white text-brand-primary/70 hover:bg-brand-background";
    return (
      <div>
        <button
          type="button"
          title={label}
          aria-label={label}
          disabled={loading || pending}
          onClick={handleAction}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction disabled:cursor-not-allowed disabled:opacity-60 ${iconCls}`}
        >
          <Icon name={icon} size={16} />
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <Button variant={variant} size="sm" disabled={loading || pending} onClick={handleAction}>
        {loading ? "..." : label}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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

type Student = { id: string; email: string; studentProfile: { fullName: string; photoUrl: string | null } | null };
type Coach = { id: string; email: string; coachProfile: { displayName: string } | null };

export type GeneralCard = {
  id: string;
  heightCm: number | null;
  weightKg: number | null;
  phone: string | null;
  publicEmail: string | null;
  experienceLevel: string | null;
  isPublic: boolean;
  documents: unknown;
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
  photoUrl: string | null;
  user: {
    email: string;
    coachVerifications: { sport: string; status: string }[];
  };
};

// ─── Row components ───────────────────────────────────────────────────────────

export function GeneralCardRow({ card }: { card: GeneralCard }) {
  const [expanded, setExpanded] = useState(false);
  const name = card.student.studentProfile?.fullName ?? card.student.email;
  const docs = card.documents as Record<string, unknown> | null;

  return (
    <div className="rounded-lg border border-brand-border bg-brand-background p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar photoKey={card.student.studentProfile?.photoUrl} name={name} size={40} />
          <div>
          <p className="font-display font-semibold text-brand-primary">{name}</p>
          <p className="text-sm text-brand-primary/70">
            {card.heightCm ? `${card.heightCm} cm` : "—"} ·{" "}
            {card.weightKg ? `${card.weightKg} kg` : "—"}
            {card.experienceLevel
              ? ` · ${expLabels[card.experienceLevel] ?? card.experienceLevel}`
              : ""}
          </p>
          <Badge variant={card.isPublic ? "success" : "neutral"} className="mt-1">
            {card.isPublic ? "Pública" : "Privada"}
          </Badge>
          {docs && !!(docs.inscriptionProof || docs.medicalInsurance) && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">Documentos</p>
              {docs.inscriptionProof ? (
                <p className="text-xs text-brand-primary/70">
                  <span className="text-brand-primary/70">Comprobante de inscripción:</span>{" "}
                  <a
                    href={`/api/files/document?key=${encodeURIComponent(String(docs.inscriptionProof))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded text-brand-secondary underline hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
                  >
                    Ver PDF
                  </a>
                </p>
              ) : null}
              {docs.medicalInsurance ? (
                <p className="text-xs text-brand-primary/70">
                  <span className="text-brand-primary/70">Comprobante de servicio médico:</span>{" "}
                  <a
                    href={`/api/files/document?key=${encodeURIComponent(String(docs.medicalInsurance))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded text-brand-secondary underline hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
                  >
                    Ver PDF
                  </a>
                </p>
              ) : null}
            </div>
          )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/fichas/${card.id}`} className={buttonClassNames("secondary", "", "sm")}>
            Ver detalle
          </Link>
          <button
            type="button"
            title={expanded ? "Ocultar" : "Editar"}
            aria-label={expanded ? "Ocultar" : "Editar"}
            onClick={() => setExpanded((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-primary/70 transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
          >
            <Icon name={expanded ? "close" : "edit"} size={16} />
          </button>
          <ActionButton
            url={`/api/admin/fichas/student-general/${card.id}`}
            label="Eliminar"
            icon="delete"
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
    "w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm text-brand-primary placeholder:text-brand-primary/50 outline-none focus:border-interaction focus:ring-2 focus:ring-interaction/40";

  return (
    <div className="mt-2 rounded-lg border border-brand-border bg-brand-background p-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
        Editar ficha general
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-brand-primary/70">
          Estatura (cm)
          <input
            className={inputCls}
            value={values.heightCm}
            onChange={(e) => setValues((v) => ({ ...v, heightCm: e.target.value }))}
            placeholder="175"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-brand-primary/70">
          Peso (kg)
          <input
            className={inputCls}
            value={values.weightKg}
            onChange={(e) => setValues((v) => ({ ...v, weightKg: e.target.value }))}
            placeholder="70"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-brand-primary/70">
          Teléfono
          <input
            className={inputCls}
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            placeholder="55 1234 5678"
            maxLength={10}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-brand-primary/70">
          Correo público
          <input
            className={inputCls}
            type="email"
            value={values.publicEmail}
            onChange={(e) => setValues((v) => ({ ...v, publicEmail: e.target.value }))}
            placeholder="contacto@correo.com"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-brand-primary/70">
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
        <label className="flex items-center gap-2 text-xs text-brand-primary/70 pt-4">
          <input
            type="checkbox"
            checked={values.isPublic}
            onChange={(e) => setValues((v) => ({ ...v, isPublic: e.target.checked }))}
            className="h-4 w-4 rounded border-brand-border accent-interaction"
          />
          Ficha pública
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-emerald-700">Guardado correctamente.</p>}
      <Button onClick={handleSave} disabled={saving} size="sm">
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
    <div className="rounded-lg border border-brand-border bg-brand-background p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar photoKey={card.student.studentProfile?.photoUrl} name={name} size={40} />
          <div>
            <p className="font-display font-semibold text-brand-primary">{name}</p>
            <p className="text-sm text-brand-primary/70">
              Deporte: {sportLabels[card.sport] ?? card.sport}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Ocultar" : "Ver datos"}
          </Button>
          <ActionButton
            url={`/api/admin/fichas/student-specialized/${card.id}`}
            label="Eliminar"
            icon="delete"
            confirmText={`¿Eliminar la ficha especializada de ${name}? Esta acción es irreversible.`}
          />
        </div>
      </div>

      {expanded && (
        <div className="mt-2 rounded-lg border border-brand-border bg-brand-background p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
            Datos especializados — {sportLabels[card.sport] ?? card.sport}
          </p>
          {dataEntries.length === 0 ? (
            <p className="text-xs text-brand-primary/70">Sin datos registrados.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              {dataEntries.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-xs">
                  <span className="text-brand-primary/70">{labelField(k)}</span>
                  <span className="text-right font-medium text-brand-primary">{v == null ? "—" : labelFieldValue(k, v)}</span>
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-background p-3">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge variant="info">{eventTypeLabels[event.type] ?? event.type}</Badge>
          <Badge variant="neutral" className={SPORT_BADGE_CLASS[event.sport]}>
            {sportLabels[event.sport] ?? event.sport}
          </Badge>
          <Badge variant={isOpen ? "success" : "neutral"}>
            {isOpen ? "Abierto" : "Cerrado"}
          </Badge>
        </div>
        <p className="font-display font-semibold text-brand-primary">{event.title}</p>
        <p className="text-sm text-brand-primary/70">Coach: {coachName}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/dashboard/events/${event.id}`} className={buttonClassNames("secondary", "", "sm")}>
          Ver
        </Link>
        <Link
          href={`/dashboard/events/${event.id}/edit`}
          title="Editar"
          aria-label="Editar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-primary/70 transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
        >
          <Icon name="edit" size={16} />
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
          icon="delete"
          confirmText={`¿Eliminar "${event.title}"? Esta acción es irreversible.`}
        />
      </div>
    </div>
  );
}

export function CoachProfileRow({ coach }: { coach: CoachProfile }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-brand-border bg-brand-background p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar photoKey={coach.photoUrl} name={coach.displayName} size={40} />
          <div>
          <p className="font-display font-semibold text-brand-primary">{coach.displayName}</p>
          <p className="text-sm text-brand-primary/70">{coach.user.email}</p>
          {coach.academicUnit && (
            <p className="text-sm text-brand-primary/70">{coach.academicUnit}</p>
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
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Ocultar" : "Ver detalle"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-2 rounded-lg border border-brand-border bg-brand-background p-3 space-y-2 text-sm">
          {coach.phone && (
            <p>
              <span className="text-brand-primary/70">Teléfono:</span> {coach.phone}
            </p>
          )}
          {coach.sports.length > 0 && (
            <p>
              <span className="text-brand-primary/70">Deportes:</span>{" "}
              {coach.sports.map((s) => sportLabels[s] ?? s).join(", ")}
            </p>
          )}
          {coach.bio && (
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-brand-primary/70">Biografía</p>
              <p className="text-brand-primary/70 whitespace-pre-line">{coach.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

