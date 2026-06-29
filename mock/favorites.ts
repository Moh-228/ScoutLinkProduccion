export type FavoriteItem = {
  id: string;
  type: "evento" | "jugador";
  title: string;
  sport: "Básquetbol" | "Fútbol Soccer" | "Tocho Bandera" | "Voleibol";
  school: string;
  summary: string;
  href: string;
};

export const mockFavorites: FavoriteItem[] = [
  {
    id: "fav-evt-001",
    type: "evento",
    title: "Tryout de Fútbol Soccer - ESCOM",
    sport: "Fútbol Soccer",
    school: "ESCOM",
    summary: "Evento de reclutamiento abierto para categoria universitaria.",
    href: "/dashboard/events/evt-001",
  },
  {
    id: "fav-evt-002",
    type: "evento",
    title: "Entrenamiento Intensivo de Voleibol",
    sport: "Voleibol",
    school: "ESIA",
    summary: "Sesión de fundamentos y evaluación de técnica por posiciones.",
    href: "/dashboard/events/evt-004",
  },
  {
    id: "fav-ath-001",
    type: "jugador",
    title: "Andrea Ruiz - Armadora",
    sport: "Básquetbol",
    school: "UPIITA",
    summary: "Ficha pública con experiencia en ligas escolares y selectivas.",
    href: "/dashboard/fichas",
  },
];
