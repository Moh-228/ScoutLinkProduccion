import Link from "next/link";
import { type ReactNode } from "react";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { SPORT_BADGE_CLASS, SPORT_CTA_CLASS, SPORT_DOT_CLASS } from "@/lib/sport-colors";

const SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

const DAY_LABELS: Record<string, string> = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié",
  jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

export type EventCardData = {
  id: string;
  sport: string;
  type: string;
  status: string;
  title: string;
  requirements: unknown;
  startAt: Date | null;
  locationText: string | null;
  shortDescription: string | null;
  coach: { coachProfile: { displayName: string } | null };
};

type EventCardProps = {
  event: EventCardData;
  /** Context-specific action next to "Ver detalles" (e.g. the page's FavoriteButton). */
  action?: ReactNode;
};

/**
 * Event summary card shared by the dashboard, the events list and favorites.
 * Purely presentational: each page keeps its own data and decides the `action`.
 */
export function EventCard({ event, action }: EventCardProps) {
  const req = (event.requirements ?? {}) as Record<string, unknown>;
  const scheduleDays = Array.isArray(req.scheduleDays) ? (req.scheduleDays as string[]) : [];
  const isTraining = event.type === "training";

  return (
    <Card className="relative overflow-hidden pt-6">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${SPORT_DOT_CLASS[event.sport] ?? "bg-brand-border"}`} />
      <CardHeader>
        <div className="mb-1 flex items-center justify-between gap-1.5">
          <Badge variant="neutral" className={SPORT_BADGE_CLASS[event.sport]}>
            {SPORT_LABELS[event.sport] ?? event.sport}
          </Badge>
          {event.type === "tournament" ? (
            <Badge variant="info">Torneo</Badge>
          ) : (
            <Badge variant={event.status === "open" ? "success" : "danger"}>
              {event.status === "open" ? "Abierto" : "Cerrado"}
            </Badge>
          )}
        </div>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.coach.coachProfile?.displayName ?? "—"}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {(isTraining ? scheduleDays.length > 0 : !!event.startAt) || event.locationText ? (
          <div className="space-y-1.5 text-sm text-brand-primary/70">
            {isTraining ? (
              scheduleDays.length > 0 && (
                <p className="flex items-center gap-2">
                  <Icon name="calendar" size={16} className="shrink-0 text-brand-primary/40" />
                  {scheduleDays.map((d) => DAY_LABELS[d] ?? d).join(" • ")}
                </p>
              )
            ) : (
              event.startAt && (
                <p className="flex items-center gap-2">
                  <Icon name="calendar" size={16} className="shrink-0 text-brand-primary/40" />
                  {new Date(event.startAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )
            )}
            {event.locationText && (
              <p className="flex items-center gap-2">
                <Icon name="location_on" size={16} className="shrink-0 text-brand-primary/40" />
                {event.locationText}
              </p>
            )}
          </div>
        ) : null}
        {event.shortDescription && <p className="line-clamp-2 text-sm text-brand-primary/70">{event.shortDescription}</p>}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            href={`/dashboard/events/${event.id}`}
            className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction focus-visible:ring-offset-2 ${SPORT_CTA_CLASS[event.sport] ?? "bg-brand-primary text-white hover:bg-brand-primary/90"}`}
          >
            Ver detalles
          </Link>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}
