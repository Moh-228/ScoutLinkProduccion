// Spanish labels for all specialized-card field keys
export const FIELD_LABELS: Record<string, string> = {
  // ── shared / conduct ──────────────────────────────────────────────────────
  teamworkPressure: "Trabajo en equipo / bajo presión",
  availabilityTraining: "Disponible: entrenamientos",
  availabilityMatches: "Disponible: partidos",
  availabilityTournaments: "Disponible: torneos / competencias",
  expectations: "Expectativas",

  // ── soccer ────────────────────────────────────────────────────────────────
  primaryPosition: "Posición principal",
  primarySubrole: "Subrol principal",
  secondaryPosition: "Posición secundaria",
  secondarySubrole: "Subrol secundario",
  dominantFoot: "Pierna dominante",
  styleDefensive: "Estilo: juego defensivo",
  styleOffensive: "Estilo: juego ofensivo",
  styleShortPass: "Estilo: pase corto",
  styleLongPass: "Estilo: pase largo",
  style1v1: "Estilo: duelos 1 vs 1",
  styleAerial: "Estilo: juego aéreo",
  roleCaptain: "Rol: capitán",
  roleLeader: "Rol: líder de grupo",
  roleSetPiece: "Rol: ejecutor de balones parados (ABP)",
  yearsExp: "Años de experiencia",
  currentClubName: "Club actual",
  currentClubCity: "Ciudad del club",
  currentClubCoach: "Entrenador del club",
  previousClubs: "Clubes anteriores",
  categories: "Categorías / ligas",
  achievements: "Logros",
  scouting: "Visorías",

  // ── basketball ────────────────────────────────────────────────────────────
  dominantHand: "Mano dominante",
  bothHands: "Ambas manos",
  styleCreator: "Estilo: creador de juego",
  styleShooter: "Estilo: tirador",
  styleDefender: "Estilo: defensor",
  stylePost: "Estilo: juego de poste",
  style3AndD: "Estilo: 3&D (tirador-defensor)",
  wingspan: "Envergadura (cm)",
  verticalJump: "Salto vertical (cm)",
  level: "Nivel",
  teamsLeagues: "Equipos / ligas",
  offPressureHandling: "Of: manejo bajo presión",
  offBothHandsDribble: "Of: drible con ambas manos",
  offFinishBothHands: "Of: finalización con ambas manos",
  offFinishContact: "Of: finalización con contacto",
  ftPct: "% tiro libre (aprox.)",
  offMidRange: "Of: tiro de media distancia",
  offTripleCatchShoot: "Of: triple C&S (catch & shoot)",
  offTripleDribble: "Of: triple desde drible",
  offCuts: "Of: cortes sin balón",
  offScreens: "Of: uso de bloqueos",
  offSpacing: "Of: espaciado (spacing)",

  // ── volleyball ────────────────────────────────────────────────────────────
  position: "Posición",
  dominantHandAttack: "Mano dominante (ataque)",
  dominantHandServe: "Mano dominante (saque)",
  role: "Rol en el equipo",
  jump: "Salto (cm)",
  attackReach: "Alcance de ataque (cm)",
  blockReach: "Alcance de bloqueo (cm)",
  techReception: "Téc: recepción",
  techDig: "Téc: defensa (dig)",
  techReadingDefense: "Téc: lectura defensiva",
  techFloatServe: "Téc: saque flotado",
  techJumpServe: "Téc: saque de salto",
  techSetting: "Téc: colocación",
  techLineAttack: "Téc: ataque en línea",
  techDiagonalAttack: "Téc: ataque en diagonal",
  techTipAttack: "Téc: ataque en punta (tip)",
  techRollAttack: "Téc: roll shot",
  techBlockReading: "Téc: bloqueo — lectura",
  techBlockHands: "Téc: bloqueo — manos",
  techBlockMovement: "Téc: bloqueo — desplazamiento",
  techCoverageTransition: "Téc: coberturas y transición",

  // ── flag football ─────────────────────────────────────────────────────────
  primaryRole: "Rol principal",
  throwingHand: "Mano dominante (lanzamiento)",
  styleSpeed: "Estilo: velocidad",
  styleRoutes: "Estilo: rutas / técnica",
  stylePhysical: "Estilo: juego físico",
  styleVision: "Estilo: visión de juego",
  format: "Modalidad principal",
  tackleExp: "Exp. en tackle / otros deportes",
  qbShortPass: "QB: pase corto",
  qbMediumPass: "QB: pase medio",
  qbLongPass: "QB: pase largo",
  qbPrecision: "QB: precisión",
  qbReadDefense: "QB: lectura de defensa",
  qbMechanics: "QB: mecánica / velocidad de salida",
  qbMobility: "QB: movilidad (scramble)",
  recRoutes: "REC: rutas",
  recHands: "REC: manos",
  recTrafficCatch: "REC: atrapar en tráfico",
  recOneHand: "REC: atrapar con una mano",
  recSeparation: "REC: separación / COD",
  recZoneReading: "REC: lectura vs zona",
  rbVision: "RB: visión de campo",
  rbCuts: "RB: cortes y elusividad",
  rbFlagSecurity: "RB: seguridad de bandera",
  rbPatience: "RB: paciencia",
  rbExplosiveness: "RB: explosividad",
};

// Spanish translations for stored enum/select values
export const VALUE_LABELS: Record<string, string> = {
  // foot / hand
  der: "Derecha",
  izq: "Izquierda",
  ambas: "Ambas",
  // soccer positions
  POR: "Portero (POR)",
  DEF: "Defensa (DEF)",
  MED: "Mediocampista (MED)",
  DEL: "Delantero (DEL)",
  // basketball positions
  "1": "1 – Base (PG)",
  "2": "2 – Escolta (SG)",
  "3": "3 – Alero (SF)",
  "4": "4 – Ala-Pívot (PF)",
  "5": "5 – Pívot (C)",
  // basketball / volleyball level
  recreational: "Recreativo",
  competitive: "Competitivo",
  selection: "Selección",
  // volleyball positions
  setter: "Colocador/a",
  libero: "Líbero",
  middle: "Central",
  outside: "Punta (exterior)",
  opposite: "Opuesto/a",
  // flag football format
  "5v5": "5 vs 5",
  "7v7": "7 vs 7",
  mixed: "Mixto",
  // flag football roles
  QB: "QB (Mariscal de campo)",
  REC: "REC (Receptor)",
  RB: "RB (Corredor)",
  RUSH: "RUSH (Rusher)",
  DB: "DB (Defensivo trasero)",
  S: "S (Safety)",
  LB: "LB (Linebacker)",
};

export function labelField(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

export function labelValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Sí" : "No";
  const str = String(value);
  return VALUE_LABELS[str] ?? str;
}
