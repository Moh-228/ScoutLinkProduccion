import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Icon, type IconName } from "@/components/Icon";
import { prisma } from "@/lib/prisma";

const ACTION_CONFIG: Record<string, { label: string; icon: IconName }> = {
  role_change: { label: "Cambio de rol", icon: "person_edit" },
  user_status_change: { label: "Activación/desactivación de cuenta", icon: "person" },
  verification_review: { label: "Revisión de verificación", icon: "verified" },
  comment_removed: { label: "Comentario eliminado", icon: "delete" },
  report_resolved: { label: "Reporte resuelto", icon: "event_check" },
  report_dismissed: { label: "Reporte descartado", icon: "close_small" },
  event_reopened: { label: "Convocatoria reabierta", icon: "calendar" },
  event_closed: { label: "Convocatoria cerrada", icon: "calendar" },
  application_status_change: { label: "Cambio de estado de postulación", icon: "person_check" },
  profile_photo_removed: { label: "Foto de perfil eliminada", icon: "delete" },
};

function fmt(d: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
}

function describeMetadata(action: string, metadata: Record<string, unknown>): string | null {
  switch (action) {
    case "role_change":
      return `${metadata.email ?? "Usuario"}: ${metadata.fromRole ?? "?"} → ${metadata.toRole ?? "?"}`;
    case "user_status_change":
      return `${metadata.email ?? "Usuario"}: ${metadata.isActive ? "activada" : "desactivada"}`;
    case "verification_review":
      return `Deporte: ${metadata.sport ?? "?"} — Decisión: ${metadata.decision === "verify" ? "aprobado" : "rechazado"}`;
    case "comment_removed":
      return `Evento "${metadata.eventTitle ?? "?"}": "${metadata.content ?? ""}"`;
    case "report_resolved":
    case "report_dismissed":
      return null;
    case "event_reopened":
    case "event_closed":
      return `Convocatoria: ${metadata.title ?? "?"}`;
    case "application_status_change":
      return `Nuevo estado: ${metadata.newStatus ?? "?"}`;
    case "profile_photo_removed":
      return `${metadata.email ?? "Usuario"}`;
    default:
      return null;
  }
}

export default async function AdminHistoryPage() {
  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { admin: { select: { email: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial administrativo"
        description="Registro de cambios de rol, verificaciones, moderaciones y apertura/cierre de convocatorias."
      />

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Últimas acciones ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length === 0 ? (
            <EmptyState size="compact" icon="hourglass" title="Aún no se han registrado acciones administrativas." />
          ) : (
            logs.map((log) => {
              const config = ACTION_CONFIG[log.action] ?? { label: log.action, icon: "error" as IconName };
              const metadata = (log.metadata ?? {}) as Record<string, unknown>;
              const details = describeMetadata(log.action, metadata);
              return (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border border-brand-border bg-brand-background p-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-primary/70 ring-1 ring-brand-border">
                    <Icon name={config.icon} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-sm font-semibold text-brand-primary">{config.label}</p>
                      <Badge variant="neutral" className="text-[10px]">{fmt(log.createdAt)}</Badge>
                    </div>
                    <p className="text-xs text-brand-primary/70">Por {log.admin.email}</p>
                    {details && <p className="mt-1 text-sm text-brand-primary/80">{details}</p>}
                    {log.reason && (
                      <p className="mt-1 text-sm text-brand-primary/70">
                        <span className="font-semibold">Motivo:</span> {log.reason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
