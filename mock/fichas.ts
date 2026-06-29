export type PlayerCard = {
  id: string;
  name: string;
  school: string;
  sport: "Básquetbol" | "Fútbol Soccer" | "Tocho Bandera" | "Voleibol";
  age: number;
  level: "Experimentado" | "No experimentado";
  position: string;
};

export const mockPlayerCards: PlayerCard[] = [
  {
    id: "pl-001",
    name: "Diana Herrera",
    school: "ESIME",
    sport: "Fútbol Soccer",
    age: 20,
    level: "Experimentado",
    position: "Mediocampista",
  },
  {
    id: "pl-002",
    name: "Carlos Neri",
    school: "ESCOM",
    sport: "Tocho Bandera",
    age: 21,
    level: "Experimentado",
    position: "Quarterback",
  },
  {
    id: "pl-003",
    name: "Regina Soto",
    school: "UPIBI",
    sport: "Voleibol",
    age: 19,
    level: "No experimentado",
    position: "Libero",
  },
  {
    id: "pl-004",
    name: "Luis Bernal",
    school: "ESFM",
    sport: "Básquetbol",
    age: 22,
    level: "Experimentado",
    position: "Alero",
  },
];
