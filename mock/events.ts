export type MockEvent = {
  id: string;
  title: string;
  sport: string;
  date: string;
  type: "Presencial" | "Virtual";
  location: string;
  description: string;
  requirements: string[];
};

export const mockEvents: MockEvent[] = [
  {
    id: "evt-001",
    title: "Tryout Regional de Fútbol Femenino",
    sport: "Fútbol",
    date: "2026-05-12",
    type: "Presencial",
    location: "Monterrey",
    description:
      "Jornada de evaluación para estudiantes atletas interesadas en becas deportivas universitarias de alto rendimiento.",
    requirements: ["Video destacado", "Promedio mínimo 8.0", "Carta de recomendación"],
  },
  {
    id: "evt-002",
    title: "Scouting de Básquetbol U18",
    sport: "Básquetbol",
    date: "2026-05-25",
    type: "Presencial",
    location: "Guadalajara",
    description:
      "Entrenadores universitarios observan talento juvenil en sesiones de juego y pruebas físicas estructuradas.",
    requirements: ["Prueba medica vigente", "Estadisticas de temporada"],
  },
  {
    id: "evt-003",
    title: "Evaluación de Atletismo - Velocidad",
    sport: "Atletismo",
    date: "2026-06-03",
    type: "Virtual",
    location: "Online",
    description:
      "Revisión remota de tiempos oficiales y técnica con panel de coaches de universidades nacionales.",
    requirements: ["Resultados oficiales", "Video en pista", "Curriculum deportivo"],
  },
  {
    id: "evt-004",
    title: "Clinica de Voleibol Universitario",
    sport: "Voleibol",
    date: "2026-06-18",
    type: "Presencial",
    location: "Ciudad de Mexico",
    description:
      "Sesión técnica para jugadoras y jugadores con pruebas de fundamentos, toma de decisión y trabajo en equipo.",
    requirements: ["Constancia escolar", "Disponibilidad de viaje"],
  },
];
