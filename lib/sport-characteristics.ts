// Shared characteristics schema.
// Keys mirror student specialized card fields for future affinity/ranking matching.

export type CharSelect = {
  type: "select";
  key: string;
  label: string;
  options: { label: string; value: string }[];
};
export type CharSkills = {
  type: "skills";
  key: string;
  label: string;
  options: { value: string; label: string }[];
};
export type CharNumber = {
  type: "number";
  key: string;
  label: string;
  min?: number;
  max?: number;
  placeholder?: string;
};
export type CharField = CharSelect | CharSkills | CharNumber;

export const SPORT_CHARACTERISTICS: Record<string, CharField[]> = {
  soccer: [
    {
      type: "select",
      key: "primaryPosition",
      label: "Posición buscada",
      options: [
        { value: "", label: "Cualquier posición" },
        { value: "POR", label: "Portero (POR)" },
        { value: "DEF", label: "Defensa (DEF)" },
        { value: "MED", label: "Mediocampista (MED)" },
        { value: "DEL", label: "Delantero (DEL)" },
      ],
    },
    {
      type: "select",
      key: "dominantFoot",
      label: "Pie dominante",
      options: [
        { value: "", label: "Indiferente" },
        { value: "der", label: "Derecho" },
        { value: "izq", label: "Izquierdo" },
        { value: "ambas", label: "Ambos" },
      ],
    },
    {
      type: "number",
      key: "minYearsExp",
      label: "Experiencia mínima (años)",
      min: 0,
      max: 20,
      placeholder: "2",
    },
    {
      type: "skills",
      key: "skills",
      label: "Habilidades requeridas",
      options: [
        { value: "styleDefensive", label: "Juego defensivo" },
        { value: "styleOffensive", label: "Juego ofensivo" },
        { value: "styleShortPass", label: "Pase corto" },
        { value: "styleLongPass", label: "Pase largo" },
        { value: "style1v1", label: "Duelos 1 vs 1" },
        { value: "styleAerial", label: "Juego aéreo" },
        { value: "roleCaptain", label: "Capitán" },
        { value: "roleLeader", label: "Líder de grupo" },
        { value: "roleSetPiece", label: "ABP (balones parados)" },
      ],
    },
  ],
  basketball: [
    {
      type: "select",
      key: "primaryPosition",
      label: "Posición buscada",
      options: [
        { value: "", label: "Cualquier posición" },
        { value: "1", label: "Base (PG)" },
        { value: "2", label: "Escolta (SG)" },
        { value: "3", label: "Alero (SF)" },
        { value: "4", label: "Ala-Pívot (PF)" },
        { value: "5", label: "Pívot (C)" },
      ],
    },
    {
      type: "select",
      key: "dominantHand",
      label: "Mano dominante",
      options: [
        { value: "", label: "Indiferente" },
        { value: "der", label: "Derecha" },
        { value: "izq", label: "Izquierda" },
      ],
    },
    {
      type: "number",
      key: "minYearsExp",
      label: "Experiencia mínima (años)",
      min: 0,
      max: 20,
      placeholder: "2",
    },
    {
      type: "skills",
      key: "skills",
      label: "Habilidades requeridas",
      options: [
        { value: "styleCreator", label: "Creador de juego" },
        { value: "styleShooter", label: "Tirador" },
        { value: "styleDefender", label: "Defensor" },
        { value: "stylePost", label: "Juego de poste" },
        { value: "style3AndD", label: "3&D (tirador-defensor)" },
        { value: "offPressureHandling", label: "Manejo bajo presión" },
        { value: "offBothHandsDribble", label: "Drible con ambas manos" },
        { value: "offFinishBothHands", label: "Finalización con ambas manos" },
        { value: "offFinishContact", label: "Finalización con contacto" },
        { value: "offMidRange", label: "Tiro de media distancia" },
        { value: "offTripleCatchShoot", label: "Triple C&S (catch & shoot)" },
        { value: "offTripleDribble", label: "Triple desde drible" },
        { value: "offCuts", label: "Cortes sin balón" },
        { value: "offScreens", label: "Uso de bloqueos" },
        { value: "offSpacing", label: "Espaciado" },
      ],
    },
  ],
  volleyball: [
    {
      type: "select",
      key: "position",
      label: "Posición buscada",
      options: [
        { value: "", label: "Cualquier posición" },
        { value: "setter", label: "Colocador/a" },
        { value: "libero", label: "Líbero" },
        { value: "middle", label: "Central" },
        { value: "outside", label: "Punta (exterior)" },
        { value: "opposite", label: "Opuesto/a" },
      ],
    },
    {
      type: "number",
      key: "minYearsExp",
      label: "Experiencia mínima (años)",
      min: 0,
      max: 20,
      placeholder: "2",
    },
    {
      type: "skills",
      key: "skills",
      label: "Técnicas requeridas",
      options: [
        { value: "techReception", label: "Recepción" },
        { value: "techDig", label: "Defensa (dig)" },
        { value: "techReadingDefense", label: "Lectura defensiva" },
        { value: "techFloatServe", label: "Saque flotado" },
        { value: "techJumpServe", label: "Saque de salto" },
        { value: "techSetting", label: "Colocación" },
        { value: "techLineAttack", label: "Ataque en línea" },
        { value: "techDiagonalAttack", label: "Ataque en diagonal" },
        { value: "techTipAttack", label: "Ataque en punta (tip)" },
        { value: "techRollAttack", label: "Roll shot" },
        { value: "techBlockReading", label: "Bloqueo — lectura" },
        { value: "techBlockHands", label: "Bloqueo — manos" },
        { value: "techBlockMovement", label: "Bloqueo — desplazamiento" },
        { value: "techCoverageTransition", label: "Coberturas y transición" },
      ],
    },
  ],
  flag_football: [
    {
      type: "select",
      key: "primaryRole",
      label: "Rol buscado",
      options: [
        { value: "", label: "Cualquier rol" },
        { value: "QB", label: "QB (Mariscal de campo)" },
        { value: "REC", label: "Receptor" },
        { value: "RB", label: "Corredor (RB)" },
        { value: "RUSH", label: "Rusher" },
        { value: "DB", label: "Defensivo trasero (DB)" },
        { value: "S", label: "Safety" },
        { value: "LB", label: "Linebacker" },
      ],
    },
    {
      type: "select",
      key: "throwingHand",
      label: "Mano dominante (QB)",
      options: [
        { value: "", label: "Indiferente" },
        { value: "der", label: "Derecha" },
        { value: "izq", label: "Izquierda" },
      ],
    },
    {
      type: "number",
      key: "minYearsExp",
      label: "Experiencia mínima (años)",
      min: 0,
      max: 20,
      placeholder: "2",
    },
    {
      type: "skills",
      key: "skills",
      label: "Habilidades requeridas",
      options: [
        { value: "styleSpeed", label: "Velocidad" },
        { value: "styleRoutes", label: "Rutas / técnica" },
        { value: "stylePhysical", label: "Juego físico" },
        { value: "styleVision", label: "Visión de juego" },
        { value: "qbShortPass", label: "QB — Pase corto" },
        { value: "qbMediumPass", label: "QB — Pase medio" },
        { value: "qbLongPass", label: "QB — Pase largo" },
        { value: "qbPrecision", label: "QB — Precisión" },
        { value: "qbReadDefense", label: "QB — Lectura de defensa" },
        { value: "qbMechanics", label: "QB — Mecánica / velocidad de salida" },
        { value: "qbMobility", label: "QB — Movilidad" },
        { value: "recRoutes", label: "REC — Rutas" },
        { value: "recHands", label: "REC — Manos" },
        { value: "recTrafficCatch", label: "REC — Atrapar en tráfico" },
        { value: "recSeparation", label: "REC — Separación / COD" },
        { value: "rbVision", label: "RB — Visión de campo" },
        { value: "rbCuts", label: "RB — Cortes y elusividad" },
        { value: "rbExplosiveness", label: "RB — Explosividad" },
      ],
    },
  ],
};
