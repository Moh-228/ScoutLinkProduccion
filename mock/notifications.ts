export type NotificationType = "evento" | "postulacion" | "contacto";

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  date: string;
  unread: boolean;
};

export const mockNotifications: AppNotification[] = [
  {
    id: "nt-001",
    title: "Nuevo torneo publicado",
    description: "Se publicó el Torneo Inter-ES de Básquetbol 2026.",
    type: "evento",
    date: "2026-04-14",
    unread: true,
  },
  {
    id: "nt-002",
    title: "Actualización de postulación",
    description: "Tu estatus pasó a preseleccionado en Tryout Regional de Fútbol.",
    type: "postulacion",
    date: "2026-04-13",
    unread: true,
  },
  {
    id: "nt-003",
    title: "Coach desea contactarte",
    description: "Se habilito contacto por correo para evento de reclutamiento.",
    type: "contacto",
    date: "2026-04-11",
    unread: false,
  },
];
