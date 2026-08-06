import { Badge, type BadgeVariant } from "@/components/Badge";
import { Icon, type IconName } from "@/components/Icon";

export type ApplicationStatus = "postulado" | "preseleccionado" | "aceptado" | "rechazado";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: BadgeVariant; icon: IconName }> = {
  postulado: { label: "Postulado", variant: "info", icon: "event_check" },
  preseleccionado: { label: "Preseleccionado", variant: "warning", icon: "hourglass_check" },
  aceptado: { label: "Aceptado", variant: "success", icon: "person_check" },
  rechazado: { label: "Rechazado", variant: "danger", icon: "person_cancel" },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, variant, icon } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} className="w-40 justify-center gap-1.5">
      <Icon name={icon} size={16} />
      {label}
    </Badge>
  );
}
