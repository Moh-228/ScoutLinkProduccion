export type ApplicationStatus = "postulado" | "preseleccionado" | "aceptado" | "rechazado";

export type MockApplication = {
  id: string;
  eventTitle: string;
  date: string;
  status: ApplicationStatus;
};

export const mockApplications: MockApplication[] = [
  {
    id: "app-001",
    eventTitle: "Tryout Regional de Fútbol Femenino",
    date: "2026-05-12",
    status: "preseleccionado",
  },
  {
    id: "app-002",
    eventTitle: "Scouting de Básquetbol U18",
    date: "2026-05-25",
    status: "postulado",
  },
  {
    id: "app-003",
    eventTitle: "Evaluación de Atletismo - Velocidad",
    date: "2026-06-03",
    status: "aceptado",
  },
  {
    id: "app-004",
    eventTitle: "Clinica de Voleibol Universitario",
    date: "2026-06-18",
    status: "rechazado",
  },
];
