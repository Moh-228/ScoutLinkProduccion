"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Badge, type BadgeVariant } from "@/components/Badge";
import { Icon, type IconName } from "@/components/Icon";

export type ApplicationStatus = "postulado" | "preseleccionado" | "aceptado" | "rechazado";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; variant: BadgeVariant; icon: IconName; description: string }
> = {
  postulado: {
    label: "Postulado",
    variant: "info",
    icon: "event_check",
    description:
      "El estudiante ha enviado su postulación a la convocatoria y está pendiente de que el equipo responsable la revise.",
  },
  preseleccionado: {
    label: "Preseleccionado",
    variant: "warning",
    icon: "hourglass_check",
    description:
      "El estudiante ha sido seleccionado para avanzar a una etapa posterior del proceso de reclutamiento.",
  },
  aceptado: {
    label: "Invitado",
    variant: "success",
    icon: "person_check",
    description:
      "El estudiante ha recibido una invitación para participar en el proceso o actividad correspondiente.",
  },
  rechazado: {
    label: "Descartado",
    variant: "danger",
    icon: "person_cancel",
    description: "La postulación no fue seleccionada para continuar en el proceso actual.",
  },
};

const TOOLTIP_WIDTH = 240;
const VIEWPORT_MARGIN = 8;

type Position = { left: number; top: number; placement: "top" | "bottom" };

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
  /**
   * Set when the badge sits inside a link/row that is itself interactive: the
   * badge then isn't a focusable control (no nested interactive elements) and
   * the explanation shows on mouse hover only. Elsewhere it's a button that also
   * works with keyboard focus and tap.
   */
  inLink?: boolean;
};

export function ApplicationStatusBadge({ status, inLink = false }: ApplicationStatusBadgeProps) {
  const { label, variant, icon, description } = STATUS_CONFIG[status];
  const descriptionId = useId();
  const triggerRef = useRef<HTMLSpanElement & HTMLButtonElement>(null);
  const [position, setPosition] = useState<Position | null>(null);

  function show() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const half = TOOLTIP_WIDTH / 2;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, half + VIEWPORT_MARGIN),
      window.innerWidth - half - VIEWPORT_MARGIN,
    );
    // Prefer below; flip above when there isn't room (~100px for 3 lines).
    const fitsBelow = rect.bottom + 100 < window.innerHeight;
    setPosition(
      fitsBelow
        ? { left, top: rect.bottom + VIEWPORT_MARGIN, placement: "bottom" }
        : { left, top: rect.top - VIEWPORT_MARGIN, placement: "top" },
    );
  }

  const hide = () => setPosition(null);

  // Hover only for a real mouse: touch screens emit emulated enter/leave events
  // around a tap, which would close the tooltip the tap just opened.
  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") show();
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") hide();
  };

  // A fixed tooltip would drift on scroll/resize, so it simply closes; Escape closes it too.
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPosition(null);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [position]);

  const badge = (
    <Badge variant={variant} className="w-40 justify-center gap-1.5">
      <Icon name={icon} size={16} />
      {label}
    </Badge>
  );

  // Rendered in a portal with fixed positioning so no card/table overflow can clip it.
  const tooltip =
    position &&
    createPortal(
      <span
        aria-hidden="true"
        style={{
          left: position.left,
          top: position.top,
          width: TOOLTIP_WIDTH,
          transform: position.placement === "top" ? "translate(-50%, -100%)" : "translateX(-50%)",
        }}
        className="pointer-events-none fixed z-50 rounded-lg bg-brand-primary px-3 py-2 text-left text-xs font-medium leading-relaxed text-white shadow-lg shadow-brand-primary/20"
      >
        {description}
      </span>,
      document.body,
    );

  if (inLink) {
    return (
      <span ref={triggerRef} className="inline-flex" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
        {badge}
        {tooltip}
      </span>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={descriptionId}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={show}
        onBlur={hide}
        // Tap/click opens (a toggle would immediately close what the emulated hover just
        // opened on touch screens); tapping elsewhere blurs the button and closes it.
        onClick={show}
        className="inline-flex cursor-help rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction focus-visible:ring-offset-2"
      >
        {badge}
      </button>
      <span id={descriptionId} className="sr-only">
        {description}
      </span>
      {tooltip}
    </>
  );
}
