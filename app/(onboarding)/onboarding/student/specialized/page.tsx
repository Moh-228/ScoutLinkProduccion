"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";

const SPORT_OPTIONS = [
  { label: "Selecciona un deporte", value: "" },
  { label: "Fútbol", value: "soccer" },
  { label: "Básquetbol", value: "basketball" },
  { label: "Voleibol", value: "volleyball" },
  { label: "Tocho Bandera", value: "flag_football" },
];

const VALID_SPORTS = new Set(SPORT_OPTIONS.map((o) => o.value).filter(Boolean));
const SPORT_LABELS: Record<string, string> = Object.fromEntries(
  SPORT_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]),
);

const TA_CLASS =
  "w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-primary shadow-sm outline-none transition-colors placeholder:text-brand-primary/40 focus:border-interaction focus:ring-2 focus:ring-interaction/40";

// ─── helpers ──────────────────────────────────────────────────────────────────

type Defaults = Record<string, unknown>;

function dv(defaults: Defaults, key: string): string {
  const v = defaults[key];
  return v == null ? "" : String(v);
}

function dc(defaults: Defaults, key: string): boolean {
  return Boolean(defaults[key]);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-brand-border pt-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-primary/70">
        {children}
      </h3>
    </div>
  );
}

function CB({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-brand-primary">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-brand-border accent-interaction"
      />
      {label}
    </label>
  );
}

function TextArea({
  name,
  label,
  placeholder,
  rows = 2,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-primary">
      <span>{label}</span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={TA_CLASS}
      />
    </label>
  );
}

// ─── conduct section (shared) ─────────────────────────────────────────────────

function ConductSection({ defaults }: { defaults: Defaults }) {
  return (
    <>
      <SectionTitle>Conducta y disponibilidad</SectionTitle>
      <TextArea
        name="teamworkPressure"
        label="Trabajo en equipo / bajo presión"
        placeholder="Como te desempenas en situaciones de presion..."
        defaultValue={dv(defaults, "teamworkPressure")}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-primary">Disponibilidad</p>
        <CB name="availabilityTraining" label="Entrenamientos regulares" defaultChecked={dc(defaults, "availabilityTraining")} />
        <CB name="availabilityMatches" label="Partidos / encuentros" defaultChecked={dc(defaults, "availabilityMatches")} />
        <CB name="availabilityTournaments" label="Torneos / competencias" defaultChecked={dc(defaults, "availabilityTournaments")} />
      </div>
      <TextArea
        name="expectations"
        label="Expectativas"
        placeholder="Que esperas lograr en esta temporada..."
        defaultValue={dv(defaults, "expectations")}
      />
    </>
  );
}

// ─── soccer ───────────────────────────────────────────────────────────────────

const SOCCER_POS = [
  { label: "Posición", value: "" },
  { label: "Portero (POR)", value: "POR" },
  { label: "Defensa (DEF)", value: "DEF" },
  { label: "Mediocampista (MED)", value: "MED" },
  { label: "Delantero (DEL)", value: "DEL" },
];

const FOOT_OPTIONS = [
  { label: "Pierna dominante", value: "" },
  { label: "Derecha", value: "der" },
  { label: "Izquierda", value: "izq" },
  { label: "Ambas", value: "ambas" },
];

const LEVEL_OPTIONS = [
  { label: "Nivel de experiencia", value: "" },
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Experimentado", value: "experienced" },
];

function SoccerForm({ defaults }: { defaults: Defaults }) {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-prim-pos" name="primaryPosition" label="Posición principal" options={SOCCER_POS} defaultValue={dv(defaults, "primaryPosition")} />
        <Input id="sp-prim-sub" name="primarySubrole" label="Subrol prim." placeholder="Ej: Pivote, Extremo..." defaultValue={dv(defaults, "primarySubrole")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-sec-pos" name="secondaryPosition" label="Posición secundaria" options={SOCCER_POS} defaultValue={dv(defaults, "secondaryPosition")} />
        <Input id="sp-sec-sub" name="secondarySubrole" label="Subrol sec." placeholder="Ej: Pivote, Extremo..." defaultValue={dv(defaults, "secondarySubrole")} />
      </div>
      <Select id="sp-foot" name="dominantFoot" label="Pierna dominante" options={FOOT_OPTIONS} defaultValue={dv(defaults, "dominantFoot")} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-primary">Estilo de juego</p>
        <CB name="styleDefensive" label="Juego defensivo" defaultChecked={dc(defaults, "styleDefensive")} />
        <CB name="styleOffensive" label="Juego ofensivo" defaultChecked={dc(defaults, "styleOffensive")} />
        <CB name="styleShortPass" label="Pase corto" defaultChecked={dc(defaults, "styleShortPass")} />
        <CB name="styleLongPass" label="Pase largo" defaultChecked={dc(defaults, "styleLongPass")} />
        <CB name="style1v1" label="Duelos 1 vs 1" defaultChecked={dc(defaults, "style1v1")} />
        <CB name="styleAerial" label="Juego aéreo" defaultChecked={dc(defaults, "styleAerial")} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-primary">Rol en el equipo</p>
        <CB name="roleCaptain" label="Capitán" defaultChecked={dc(defaults, "roleCaptain")} />
        <CB name="roleLeader" label="Líder de grupo" defaultChecked={dc(defaults, "roleLeader")} />
        <CB name="roleSetPiece" label="Ejecutor de balones parados (ABP)" defaultChecked={dc(defaults, "roleSetPiece")} />
      </div>

      <SectionTitle>Experiencia</SectionTitle>
      <Input id="sp-soc-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" defaultValue={dv(defaults, "yearsExp")} />
      <Input id="sp-club" name="currentClubName" label="Club actual" placeholder="Nombre del club..." defaultValue={dv(defaults, "currentClubName")} />
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-club-city" name="currentClubCity" label="Ciudad" placeholder="Ciudad..." defaultValue={dv(defaults, "currentClubCity")} />
        <Input id="sp-club-coach" name="currentClubCoach" label="Entrenador" placeholder="Nombre..." defaultValue={dv(defaults, "currentClubCoach")} />
      </div>
      <TextArea
        name="previousClubs"
        label="Clubes anteriores"
        placeholder="Nombre, ciudad, entrenador (uno por línea)..."
        rows={3}
        defaultValue={dv(defaults, "previousClubs")}
      />
      <Select id="sp-soc-level" name="level" label="Nivel de experiencia" options={LEVEL_OPTIONS} defaultValue={dv(defaults, "level")} />
      <Input id="sp-cats" name="categories" label="Categorias / ligas" placeholder="Sub-20, liga municipal..." defaultValue={dv(defaults, "categories")} />
      <TextArea name="achievements" label="Logros" placeholder="Títulos, reconocimientos..." defaultValue={dv(defaults, "achievements")} />
      <TextArea name="scouting" label="Visorías" placeholder="Dónde y cuándo fuiste visto por cazatalentos..." defaultValue={dv(defaults, "scouting")} />
    </>
  );
}

// ─── basketball ───────────────────────────────────────────────────────────────

const BK_POS = [
  { label: "Posición", value: "" },
  { label: "Base (PG-1)", value: "1" },
  { label: "Escolta (SG-2)", value: "2" },
  { label: "Alero (SF-3)", value: "3" },
  { label: "Ala-Pivot (PF-4)", value: "4" },
  { label: "Pivot (C-5)", value: "5" },
];

const HAND_OPTIONS = [
  { label: "Mano dominante", value: "" },
  { label: "Derecha", value: "der" },
  { label: "Izquierda", value: "izq" },
  { label: "Ambas", value: "ambas" },
];

function BasketballForm({ defaults }: { defaults: Defaults }) {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-bk-prim" name="primaryPosition" label="Posición principal" options={BK_POS} defaultValue={dv(defaults, "primaryPosition")} />
        <Select id="sp-bk-sec" name="secondaryPosition" label="Posición secundaria" options={BK_POS} defaultValue={dv(defaults, "secondaryPosition")} />
      </div>
      <Select id="sp-bk-hand" name="dominantHand" label="Mano dominante" options={HAND_OPTIONS} defaultValue={dv(defaults, "dominantHand")} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-primary">Estilo de juego</p>
        <CB name="styleCreator" label="Creador de juego" defaultChecked={dc(defaults, "styleCreator")} />
        <CB name="styleShooter" label="Tirador" defaultChecked={dc(defaults, "styleShooter")} />
        <CB name="styleDefender" label="Defensor" defaultChecked={dc(defaults, "styleDefender")} />
        <CB name="stylePost" label="Juego de poste" defaultChecked={dc(defaults, "stylePost")} />
        <CB name="style3AndD" label="3&D (tirador-defensor)" defaultChecked={dc(defaults, "style3AndD")} />
      </div>

      <SectionTitle>Físico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-wingspan" name="wingspan" type="number" min={100} max={280} label="Envergadura (cm)" placeholder="190" defaultValue={dv(defaults, "wingspan")} />
        <Input id="sp-vjump" name="verticalJump" type="number" min={20} max={120} label="Salto vertical (cm)" placeholder="60" defaultValue={dv(defaults, "verticalJump")} />
      </div>

      <SectionTitle>Experiencia</SectionTitle>
      <Input id="sp-bk-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" defaultValue={dv(defaults, "yearsExp")} />
      <Select id="sp-bk-level" name="level" label="Nivel de experiencia" options={LEVEL_OPTIONS} defaultValue={dv(defaults, "level")} />
      <TextArea name="teamsLeagues" label="Equipos / ligas" placeholder="Equipo, liga, temporada (uno por línea)..." defaultValue={dv(defaults, "teamsLeagues")} />
      <TextArea name="achievements" label="Logros" placeholder="Títulos, reconocimientos..." defaultValue={dv(defaults, "achievements")} />

      <SectionTitle>Habilidades ofensivas</SectionTitle>
      <div className="space-y-2">
        <CB name="offPressureHandling" label="Manejo bajo presión" defaultChecked={dc(defaults, "offPressureHandling")} />
        <CB name="offBothHandsDribble" label="Drible con ambas manos" defaultChecked={dc(defaults, "offBothHandsDribble")} />
        <CB name="offFinishBothHands" label="Finalización con ambas manos" defaultChecked={dc(defaults, "offFinishBothHands")} />
        <CB name="offFinishContact" label="Finalización con contacto" defaultChecked={dc(defaults, "offFinishContact")} />
        <CB name="offMidRange" label="Tiro de media distancia" defaultChecked={dc(defaults, "offMidRange")} />
        <CB name="offTripleCatchShoot" label="Triple C&S (catch & shoot)" defaultChecked={dc(defaults, "offTripleCatchShoot")} />
        <CB name="offTripleDribble" label="Triple desde drible" defaultChecked={dc(defaults, "offTripleDribble")} />
        <CB name="offCuts" label="Cortes sin balon" defaultChecked={dc(defaults, "offCuts")} />
        <CB name="offScreens" label="Uso de bloqueos" defaultChecked={dc(defaults, "offScreens")} />
        <CB name="offSpacing" label="Espaciado (spacing)" defaultChecked={dc(defaults, "offSpacing")} />
      </div>
      <CB name="ftPct" label="Tiro libre > 60%" defaultChecked={dc(defaults, "ftPct")} />
    </>
  );
}

// ─── volleyball ───────────────────────────────────────────────────────────────

const VB_POS = [
  { label: "Posición", value: "" },
  { label: "Colocador/a", value: "setter" },
  { label: "Libero", value: "libero" },
  { label: "Central", value: "middle" },
  { label: "Punta (exterior)", value: "outside" },
  { label: "Opuesto/a", value: "opposite" },
];

const HAND_OPTS = [
  { label: "Mano dom.", value: "" },
  { label: "Derecha", value: "der" },
  { label: "Izquierda", value: "izq" },
];

function VolleyballForm({ defaults }: { defaults: Defaults }) {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <Select id="sp-vb-pos" name="position" label="Posición" options={VB_POS} defaultValue={dv(defaults, "position")} />
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-vb-hand-atk" name="dominantHandAttack" label="Mano dom. (ataque)" options={HAND_OPTS} defaultValue={dv(defaults, "dominantHandAttack")} />
        <Select id="sp-vb-hand-srv" name="dominantHandServe" label="Mano dom. (saque)" options={HAND_OPTS} defaultValue={dv(defaults, "dominantHandServe")} />
      </div>
      <Input id="sp-vb-role" name="role" label="Rol en el equipo" placeholder="Titular, suplente, capitán..." defaultValue={dv(defaults, "role")} />

      <SectionTitle>Físico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-vb-wingspan" name="wingspan" type="number" min={100} max={280} label="Envergadura (cm)" placeholder="185" defaultValue={dv(defaults, "wingspan")} />
        <Input id="sp-vb-jump" name="jump" type="number" min={20} max={120} label="Salto (cm)" placeholder="60" defaultValue={dv(defaults, "jump")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-vb-atk-reach" name="attackReach" type="number" min={150} max={380} label="Alcance ataque (cm)" placeholder="310" defaultValue={dv(defaults, "attackReach")} />
        <Input id="sp-vb-blk-reach" name="blockReach" type="number" min={150} max={380} label="Alcance bloqueo (cm)" placeholder="305" defaultValue={dv(defaults, "blockReach")} />
      </div>

      <SectionTitle>Experiencia</SectionTitle>
      <Input id="sp-vb-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" defaultValue={dv(defaults, "yearsExp")} />
      <Select id="sp-vb-level" name="level" label="Nivel de experiencia" options={LEVEL_OPTIONS} defaultValue={dv(defaults, "level")} />
      <TextArea name="teamsLeagues" label="Equipos" placeholder="Equipo, temporada (uno por línea)..." defaultValue={dv(defaults, "teamsLeagues")} />
      <TextArea name="achievements" label="Torneos y logros" placeholder="Campeonatos, reconocimientos..." defaultValue={dv(defaults, "achievements")} />

      <SectionTitle>Técnica</SectionTitle>
      <div className="space-y-2">
        <CB name="techReception" label="Recepción" defaultChecked={dc(defaults, "techReception")} />
        <CB name="techDig" label="Defensa (dig)" defaultChecked={dc(defaults, "techDig")} />
        <CB name="techReadingDefense" label="Lectura defensiva" defaultChecked={dc(defaults, "techReadingDefense")} />
        <CB name="techFloatServe" label="Saque flotado" defaultChecked={dc(defaults, "techFloatServe")} />
        <CB name="techJumpServe" label="Saque de salto" defaultChecked={dc(defaults, "techJumpServe")} />
        <CB name="techSetting" label="Colocación" defaultChecked={dc(defaults, "techSetting")} />
        <CB name="techLineAttack" label="Ataque en linea" defaultChecked={dc(defaults, "techLineAttack")} />
        <CB name="techDiagonalAttack" label="Ataque en diagonal" defaultChecked={dc(defaults, "techDiagonalAttack")} />
        <CB name="techTipAttack" label="Ataque en punta (tip)" defaultChecked={dc(defaults, "techTipAttack")} />
        <CB name="techRollAttack" label="Roll shot" defaultChecked={dc(defaults, "techRollAttack")} />
        <CB name="techBlockReading" label="Bloqueo — lectura" defaultChecked={dc(defaults, "techBlockReading")} />
        <CB name="techBlockHands" label="Bloqueo — manos" defaultChecked={dc(defaults, "techBlockHands")} />
        <CB name="techBlockMovement" label="Bloqueo — desplazamiento" defaultChecked={dc(defaults, "techBlockMovement")} />
        <CB name="techCoverageTransition" label="Coberturas y transición" defaultChecked={dc(defaults, "techCoverageTransition")} />
      </div>
    </>
  );
}

// ─── flag football ────────────────────────────────────────────────────────────

const FF_ROLE = [
  { label: "Rol principal", value: "" },
  { label: "QB (Mariscal de campo)", value: "QB" },
  { label: "REC (Receptor)", value: "REC" },
  { label: "RB (Corredor)", value: "RB" },
  { label: "RUSH (Rusher)", value: "RUSH" },
  { label: "DB (Defensivo trasero)", value: "DB" },
  { label: "S (Safety)", value: "S" },
  { label: "LB (Linebacker)", value: "LB" },
];

const FF_FORMAT = [
  { label: "Formato", value: "" },
  { label: "5 vs 5", value: "5v5" },
  { label: "7 vs 7", value: "7v7" },
  { label: "Mixto", value: "mixed" },
];

const THROW_HAND = [
  { label: "Mano (si aplica)", value: "" },
  { label: "Derecha", value: "der" },
  { label: "Izquierda", value: "izq" },
];

function FlagFootballForm({ defaults }: { defaults: Defaults }) {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <Select id="sp-ff-role" name="primaryRole" label="Rol principal" options={FF_ROLE} defaultValue={dv(defaults, "primaryRole")} />
      <Select
        id="sp-ff-sec-role"
        name="secondaryRole"
        label="Rol secundario (opcional)"
        options={[{ label: "Ninguno", value: "" }, ...FF_ROLE.slice(1)]}
        defaultValue={dv(defaults, "secondaryRole")}
      />
      <Select id="sp-ff-hand" name="throwingHand" label="Mano dominante (si lanza)" options={THROW_HAND} defaultValue={dv(defaults, "throwingHand")} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-primary">Estilo de juego</p>
        <CB name="styleSpeed" label="Velocidad" defaultChecked={dc(defaults, "styleSpeed")} />
        <CB name="styleRoutes" label="Rutas / técnica" defaultChecked={dc(defaults, "styleRoutes")} />
        <CB name="stylePhysical" label="Juego físico" defaultChecked={dc(defaults, "stylePhysical")} />
        <CB name="styleVision" label="Visión de juego" defaultChecked={dc(defaults, "styleVision")} />
      </div>

      <SectionTitle>Formato y experiencia</SectionTitle>
      <Select id="sp-ff-format" name="format" label="Modalidad principal" options={FF_FORMAT} defaultValue={dv(defaults, "format")} />
      <Input id="sp-ff-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" defaultValue={dv(defaults, "yearsExp")} />
      <Select id="sp-ff-level" name="level" label="Nivel de experiencia" options={LEVEL_OPTIONS} defaultValue={dv(defaults, "level")} />
      <TextArea name="teamsLeagues" label="Ligas y equipos" placeholder="Liga, equipo, temporada (uno por línea)..." defaultValue={dv(defaults, "teamsLeagues")} />
      <TextArea name="achievements" label="Logros y nivel" placeholder="Campeonatos, MVP, selección..." defaultValue={dv(defaults, "achievements")} />
      <Input id="sp-ff-tackle" name="tackleExp" label="Exp. en tackle u otros deportes" placeholder="Americano, rugby, etc." defaultValue={dv(defaults, "tackleExp")} />

      <SectionTitle>Habilidades — QB</SectionTitle>
      <div className="space-y-2">
        <CB name="qbShortPass" label="Pase corto" defaultChecked={dc(defaults, "qbShortPass")} />
        <CB name="qbMediumPass" label="Pase medio" defaultChecked={dc(defaults, "qbMediumPass")} />
        <CB name="qbLongPass" label="Pase largo" defaultChecked={dc(defaults, "qbLongPass")} />
        <CB name="qbPrecision" label="Precisión" defaultChecked={dc(defaults, "qbPrecision")} />
        <CB name="qbReadDefense" label="Lectura de defensa" defaultChecked={dc(defaults, "qbReadDefense")} />
        <CB name="qbMechanics" label="Mecánica / velocidad de salida" defaultChecked={dc(defaults, "qbMechanics")} />
        <CB name="qbMobility" label="Movilidad (scramble / throw on run)" defaultChecked={dc(defaults, "qbMobility")} />
      </div>

      <SectionTitle>Habilidades — Receptor</SectionTitle>
      <div className="space-y-2">
        <CB name="recRoutes" label="Rutas" defaultChecked={dc(defaults, "recRoutes")} />
        <CB name="recHands" label="Manos (general)" defaultChecked={dc(defaults, "recHands")} />
        <CB name="recTrafficCatch" label="Atrapar en trafico" defaultChecked={dc(defaults, "recTrafficCatch")} />
        <CB name="recOneHand" label="Atrapar con una mano" defaultChecked={dc(defaults, "recOneHand")} />
        <CB name="recSeparation" label="Separación / COD" defaultChecked={dc(defaults, "recSeparation")} />
        <CB name="recZoneReading" label="Lectura vs zona" defaultChecked={dc(defaults, "recZoneReading")} />
      </div>

      <SectionTitle>Habilidades — Corredor</SectionTitle>
      <div className="space-y-2">
        <CB name="rbVision" label="Vision de campo" defaultChecked={dc(defaults, "rbVision")} />
        <CB name="rbCuts" label="Cortes y elusividad" defaultChecked={dc(defaults, "rbCuts")} />
        <CB name="rbFlagSecurity" label="Seguridad de bandera (ball security)" defaultChecked={dc(defaults, "rbFlagSecurity")} />
        <CB name="rbPatience" label="Paciencia" defaultChecked={dc(defaults, "rbPatience")} />
        <CB name="rbExplosiveness" label="Explosividad" defaultChecked={dc(defaults, "rbExplosiveness")} />
      </div>
    </>
  );
}

// ─── collect sport-specific data from FormData ────────────────────────────────

function collectSportData(sport: string, fd: FormData): Record<string, unknown> {
  const bool = (n: string) => fd.get(n) === "on";
  const str = (n: string) => String(fd.get(n) ?? "");

  if (sport === "soccer") {
    return {
      primaryPosition: str("primaryPosition"),
      primarySubrole: str("primarySubrole"),
      secondaryPosition: str("secondaryPosition"),
      secondarySubrole: str("secondarySubrole"),
      dominantFoot: str("dominantFoot"),
      styleDefensive: bool("styleDefensive"),
      styleOffensive: bool("styleOffensive"),
      styleShortPass: bool("styleShortPass"),
      styleLongPass: bool("styleLongPass"),
      style1v1: bool("style1v1"),
      styleAerial: bool("styleAerial"),
      roleCaptain: bool("roleCaptain"),
      roleLeader: bool("roleLeader"),
      roleSetPiece: bool("roleSetPiece"),
      yearsExp: str("yearsExp"),
      level: str("level"),
      currentClubName: str("currentClubName"),
      currentClubCity: str("currentClubCity"),
      currentClubCoach: str("currentClubCoach"),
      previousClubs: str("previousClubs"),
      categories: str("categories"),
      achievements: str("achievements"),
      scouting: str("scouting"),
      teamworkPressure: str("teamworkPressure"),
      availabilityTraining: bool("availabilityTraining"),
      availabilityMatches: bool("availabilityMatches"),
      availabilityTournaments: bool("availabilityTournaments"),
      expectations: str("expectations"),
    };
  }

  if (sport === "basketball") {
    return {
      primaryPosition: str("primaryPosition"),
      secondaryPosition: str("secondaryPosition"),
      dominantHand: str("dominantHand"),
      styleCreator: bool("styleCreator"),
      styleShooter: bool("styleShooter"),
      styleDefender: bool("styleDefender"),
      stylePost: bool("stylePost"),
      style3AndD: bool("style3AndD"),
      wingspan: str("wingspan"),
      verticalJump: str("verticalJump"),
      yearsExp: str("yearsExp"),
      level: str("level"),
      teamsLeagues: str("teamsLeagues"),
      achievements: str("achievements"),
      offPressureHandling: bool("offPressureHandling"),
      offBothHandsDribble: bool("offBothHandsDribble"),
      offFinishBothHands: bool("offFinishBothHands"),
      offFinishContact: bool("offFinishContact"),
      ftPct: bool("ftPct"),
      offMidRange: bool("offMidRange"),
      offTripleCatchShoot: bool("offTripleCatchShoot"),
      offTripleDribble: bool("offTripleDribble"),
      offCuts: bool("offCuts"),
      offScreens: bool("offScreens"),
      offSpacing: bool("offSpacing"),
      teamworkPressure: str("teamworkPressure"),
      availabilityTraining: bool("availabilityTraining"),
      availabilityMatches: bool("availabilityMatches"),
      availabilityTournaments: bool("availabilityTournaments"),
      expectations: str("expectations"),
    };
  }

  if (sport === "volleyball") {
    return {
      position: str("position"),
      dominantHandAttack: str("dominantHandAttack"),
      dominantHandServe: str("dominantHandServe"),
      role: str("role"),
      wingspan: str("wingspan"),
      jump: str("jump"),
      attackReach: str("attackReach"),
      blockReach: str("blockReach"),
      yearsExp: str("yearsExp"),
      level: str("level"),
      teamsLeagues: str("teamsLeagues"),
      achievements: str("achievements"),
      techReception: bool("techReception"),
      techDig: bool("techDig"),
      techReadingDefense: bool("techReadingDefense"),
      techFloatServe: bool("techFloatServe"),
      techJumpServe: bool("techJumpServe"),
      techSetting: bool("techSetting"),
      techLineAttack: bool("techLineAttack"),
      techDiagonalAttack: bool("techDiagonalAttack"),
      techTipAttack: bool("techTipAttack"),
      techRollAttack: bool("techRollAttack"),
      techBlockReading: bool("techBlockReading"),
      techBlockHands: bool("techBlockHands"),
      techBlockMovement: bool("techBlockMovement"),
      techCoverageTransition: bool("techCoverageTransition"),
      teamworkPressure: str("teamworkPressure"),
      availabilityTraining: bool("availabilityTraining"),
      availabilityMatches: bool("availabilityMatches"),
      availabilityTournaments: bool("availabilityTournaments"),
      expectations: str("expectations"),
    };
  }

  if (sport === "flag_football") {
    return {
      primaryRole: str("primaryRole"),
      secondaryRole: str("secondaryRole"),
      throwingHand: str("throwingHand"),
      styleSpeed: bool("styleSpeed"),
      styleRoutes: bool("styleRoutes"),
      stylePhysical: bool("stylePhysical"),
      styleVision: bool("styleVision"),
      format: str("format"),
      yearsExp: str("yearsExp"),
      level: str("level"),
      teamsLeagues: str("teamsLeagues"),
      achievements: str("achievements"),
      tackleExp: str("tackleExp"),
      qbShortPass: bool("qbShortPass"),
      qbMediumPass: bool("qbMediumPass"),
      qbLongPass: bool("qbLongPass"),
      qbPrecision: bool("qbPrecision"),
      qbReadDefense: bool("qbReadDefense"),
      qbMechanics: bool("qbMechanics"),
      qbMobility: bool("qbMobility"),
      recRoutes: bool("recRoutes"),
      recHands: bool("recHands"),
      recTrafficCatch: bool("recTrafficCatch"),
      recOneHand: bool("recOneHand"),
      recSeparation: bool("recSeparation"),
      recZoneReading: bool("recZoneReading"),
      rbVision: bool("rbVision"),
      rbCuts: bool("rbCuts"),
      rbFlagSecurity: bool("rbFlagSecurity"),
      rbPatience: bool("rbPatience"),
      rbExplosiveness: bool("rbExplosiveness"),
      teamworkPressure: str("teamworkPressure"),
      availabilityTraining: bool("availabilityTraining"),
      availabilityMatches: bool("availabilityMatches"),
      availabilityTournaments: bool("availabilityTournaments"),
      expectations: str("expectations"),
    };
  }

  return {};
}

// ─── page ─────────────────────────────────────────────────────────────────────

async function completeOnboarding() {
  await fetch("/api/onboarding/complete", { method: "POST" });
}

export default function StudentSpecializedPage() {
  return (
    <Suspense fallback={<Card><CardContent><p className="text-sm text-brand-primary/50">Cargando...</p></CardContent></Card>}>
      <StudentSpecializedForm />
    </Suspense>
  );
}

function StudentSpecializedForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lockedSport = searchParams.get("sport");
  const isEditMode = Boolean(lockedSport && VALID_SPORTS.has(lockedSport));

  const [sport, setSport] = useState(isEditMode ? (lockedSport as string) : "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCards, setExistingCards] = useState<Record<string, Defaults>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((result) => {
        if (result.ok && Array.isArray(result.data?.specializedCards)) {
          const map: Record<string, Defaults> = {};
          for (const card of result.data.specializedCards as { sport: string; data: unknown }[]) {
            map[card.sport] = (card.data ?? {}) as Defaults;
          }
          setExistingCards(map);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const defaults = existingCards[sport] ?? {};
  const isEditing = Boolean(existingCards[sport]);
  // Remounts each sport form once existing data has finished loading, so
  // uncontrolled fields' defaultValue reflects the fetched data even if the
  // user picks a sport before the fetch resolves.
  const formKey = `${sport}-${loaded}-form`;
  const conductKey = `${sport}-${loaded}-conduct`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const fd = new FormData(event.currentTarget);
    const selectedSport = String(fd.get("sport") ?? "");

    if (!selectedSport) {
      setError("Selecciona un deporte para tu ficha especializada.");
      return;
    }

    setIsSubmitting(true);

    const body = {
      sport: selectedSport,
      data: collectSportData(selectedSport, fd),
    };

    try {
      const res = await fetch("/api/onboarding/student/specialized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        const fieldErrors = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";
        setError(fieldErrors || result.message || "No se pudo guardar la ficha.");
        return;
      }

      await completeOnboarding();
      router.push("/dashboard/profile");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    await completeOnboarding();
    router.push("/dashboard/profile");
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
          Paso 3 de 3 — Opcional
        </div>
        <CardTitle>Ficha deportiva especializada</CardTitle>
        <CardDescription>
          Detalla tu experiencia en un deporte específico. Puedes agregar más fichas desde tu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Select
            id="ob-sp-sport"
            name="sport"
            label="Deporte"
            options={SPORT_OPTIONS}
            value={sport}
            disabled={isEditMode}
            onChange={(e) => setSport(e.target.value)}
          />
          {isEditMode && <input type="hidden" name="sport" value={sport} />}
          {isEditMode ? (
            <p className="text-xs text-interaction">
              Editando ficha especializada de {SPORT_LABELS[sport] ?? sport}.
            </p>
          ) : (
            isEditing && (
              <p className="text-xs text-interaction">
                Ya tienes una ficha para este deporte. Se cargaron tus datos guardados; al guardar se actualizará.
              </p>
            )
          )}

          {sport === "soccer" && <SoccerForm key={formKey} defaults={defaults} />}
          {sport === "basketball" && <BasketballForm key={formKey} defaults={defaults} />}
          {sport === "volleyball" && <VolleyballForm key={formKey} defaults={defaults} />}
          {sport === "flag_football" && <FlagFootballForm key={formKey} defaults={defaults} />}
          {sport !== "" && <ConductSection key={conductKey} defaults={defaults} />}

          {error ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditMode || isEditing ? "Guardar cambios" : "Guardar y finalizar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
