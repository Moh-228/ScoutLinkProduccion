"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";

const SPORT_OPTIONS = [
  { label: "Selecciona un deporte", value: "" },
  { label: "Fútbol", value: "soccer" },
  { label: "Básquetbol", value: "basketball" },
  { label: "Voleibol", value: "volleyball" },
  { label: "Flag Football (Tocho)", value: "flag_football" },
];

const TA_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-600";

// ─── helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50">
        {children}
      </h3>
    </div>
  );
}

function CB({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-white/90">
      <input type="checkbox" name={name} className="h-4 w-4 rounded border-slate-300" />
      {label}
    </label>
  );
}

function TextArea({
  name,
  label,
  placeholder,
  rows = 2,
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
      <span>{label}</span>
      <textarea name={name} rows={rows} placeholder={placeholder} className={TA_CLASS} />
    </label>
  );
}

// ─── conduct section (shared) ─────────────────────────────────────────────────

function ConductSection() {
  return (
    <>
      <SectionTitle>Conducta y disponibilidad</SectionTitle>
      <TextArea
        name="teamworkPressure"
        label="Trabajo en equipo / bajo presión"
        placeholder="Como te desempenas en situaciones de presion..."
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Disponibilidad</p>
        <CB name="availabilityTraining" label="Entrenamientos regulares" />
        <CB name="availabilityMatches" label="Partidos / encuentros" />
        <CB name="availabilityTournaments" label="Torneos / competencias" />
      </div>
      <TextArea
        name="expectations"
        label="Expectativas"
        placeholder="Que esperas lograr en esta temporada..."
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

function SoccerForm() {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-prim-pos" name="primaryPosition" label="Posición principal" options={SOCCER_POS} />
        <Input id="sp-prim-sub" name="primarySubrole" label="Subrol prim." placeholder="Ej: Pivote, Extremo..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-sec-pos" name="secondaryPosition" label="Posición secundaria" options={SOCCER_POS} />
        <Input id="sp-sec-sub" name="secondarySubrole" label="Subrol sec." placeholder="Ej: Pivote, Extremo..." />
      </div>
      <Select id="sp-foot" name="dominantFoot" label="Pierna dominante" options={FOOT_OPTIONS} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Estilo de juego</p>
        <CB name="styleDefensive" label="Juego defensivo" />
        <CB name="styleOffensive" label="Juego ofensivo" />
        <CB name="styleShortPass" label="Pase corto" />
        <CB name="styleLongPass" label="Pase largo" />
        <CB name="style1v1" label="Duelos 1 vs 1" />
        <CB name="styleAerial" label="Juego aéreo" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Rol en el equipo</p>
        <CB name="roleCaptain" label="Capitán" />
        <CB name="roleLeader" label="Líder de grupo" />
        <CB name="roleSetPiece" label="Ejecutor de balones parados (ABP)" />
      </div>

      <SectionTitle>Experiencia</SectionTitle>
      <Input id="sp-soc-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" />
      <Input id="sp-club" name="currentClubName" label="Club actual" placeholder="Nombre del club..." />
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-club-city" name="currentClubCity" label="Ciudad" placeholder="Ciudad..." />
        <Input id="sp-club-coach" name="currentClubCoach" label="Entrenador" placeholder="Nombre..." />
      </div>
      <TextArea
        name="previousClubs"
        label="Clubes anteriores"
        placeholder="Nombre, ciudad, entrenador (uno por línea)..."
        rows={3}
      />
      <Input id="sp-cats" name="categories" label="Categorias / ligas" placeholder="Sub-20, liga municipal..." />
      <TextArea name="achievements" label="Logros" placeholder="Títulos, reconocimientos..." />
      <TextArea name="scouting" label="Visorías" placeholder="Dónde y cuándo fuiste visto por cazatalentos..." />
    </>
  );
}

// ─── basketball ───────────────────────────────────────────────────────────────

const BK_POS = [
  { label: "Posición", value: "" },
  { label: "1 – Base (PG)", value: "1" },
  { label: "2 – Escolta (SG)", value: "2" },
  { label: "3 – Alero (SF)", value: "3" },
  { label: "4 – Ala-Pivot (PF)", value: "4" },
  { label: "5 – Pivot (C)", value: "5" },
];

const HAND_OPTIONS = [
  { label: "Mano dominante", value: "" },
  { label: "Derecha", value: "der" },
  { label: "Izquierda", value: "izq" },
];

const BK_LEVEL = [
  { label: "Nivel", value: "" },
  { label: "Recreativo", value: "recreational" },
  { label: "Competitivo", value: "competitive" },
  { label: "Selección", value: "selection" },
];

function BasketballForm() {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-bk-prim" name="primaryPosition" label="Posición principal" options={BK_POS} />
        <Select id="sp-bk-sec" name="secondaryPosition" label="Posición secundaria" options={BK_POS} />
      </div>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Select id="sp-bk-hand" name="dominantHand" label="Mano dominante" options={HAND_OPTIONS} />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-white/90">
          <input type="checkbox" name="bothHands" className="h-4 w-4 rounded border-slate-300" />
          Ambas manos
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Estilo de juego</p>
        <CB name="styleCreator" label="Creador de juego" />
        <CB name="styleShooter" label="Tirador" />
        <CB name="styleDefender" label="Defensor" />
        <CB name="stylePost" label="Juego de poste" />
        <CB name="style3AndD" label="3&D (tirador-defensor)" />
      </div>

      <SectionTitle>Físico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-wingspan" name="wingspan" type="number" min={100} max={280} label="Envergadura (cm)" placeholder="190" />
        <Input id="sp-vjump" name="verticalJump" type="number" min={20} max={120} label="Salto vertical (cm)" placeholder="60" />
      </div>

      <SectionTitle>Experiencia</SectionTitle>
      <Input id="sp-bk-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" />
      <Select id="sp-bk-level" name="level" label="Nivel" options={BK_LEVEL} />
      <TextArea name="teamsLeagues" label="Equipos / ligas" placeholder="Equipo, liga, temporada (uno por línea)..." />
      <TextArea name="achievements" label="Logros" placeholder="Títulos, reconocimientos..." />

      <SectionTitle>Habilidades ofensivas</SectionTitle>
      <div className="space-y-2">
        <CB name="offPressureHandling" label="Manejo bajo presión" />
        <CB name="offBothHandsDribble" label="Drible con ambas manos" />
        <CB name="offFinishBothHands" label="Finalización con ambas manos" />
        <CB name="offFinishContact" label="Finalización con contacto" />
        <CB name="offMidRange" label="Tiro de media distancia" />
        <CB name="offTripleCatchShoot" label="Triple C&S (catch & shoot)" />
        <CB name="offTripleDribble" label="Triple desde drible" />
        <CB name="offCuts" label="Cortes sin balon" />
        <CB name="offScreens" label="Uso de bloqueos" />
        <CB name="offSpacing" label="Espaciado (spacing)" />
      </div>
      <Input id="sp-ft-pct" name="ftPct" label="% tiro libre (aprox.)" placeholder="75" />
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

const VB_LEVEL = [
  { label: "Nivel", value: "" },
  { label: "Recreativo", value: "recreational" },
  { label: "Competitivo", value: "competitive" },
  { label: "Selección", value: "selection" },
];

const HAND_OPTS = [
  { label: "Mano dom.", value: "" },
  { label: "Derecha", value: "der" },
  { label: "Izquierda", value: "izq" },
];

function VolleyballForm() {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <Select id="sp-vb-pos" name="position" label="Posición" options={VB_POS} />
      <div className="grid grid-cols-2 gap-3">
        <Select id="sp-vb-hand-atk" name="dominantHandAttack" label="Mano dom. (ataque)" options={HAND_OPTS} />
        <Select id="sp-vb-hand-srv" name="dominantHandServe" label="Mano dom. (saque)" options={HAND_OPTS} />
      </div>
      <Input id="sp-vb-role" name="role" label="Rol en el equipo" placeholder="Titular, suplente, capitán..." />

      <SectionTitle>Físico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-vb-wingspan" name="wingspan" type="number" min={100} max={280} label="Envergadura (cm)" placeholder="185" />
        <Input id="sp-vb-jump" name="jump" type="number" min={20} max={120} label="Salto (cm)" placeholder="60" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input id="sp-vb-atk-reach" name="attackReach" type="number" min={150} max={380} label="Alcance ataque (cm)" placeholder="310" />
        <Input id="sp-vb-blk-reach" name="blockReach" type="number" min={150} max={380} label="Alcance bloqueo (cm)" placeholder="305" />
      </div>

      <SectionTitle>Experiencia</SectionTitle>
      <Input id="sp-vb-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" />
      <Select id="sp-vb-level" name="level" label="Nivel" options={VB_LEVEL} />
      <TextArea name="teamsLeagues" label="Equipos" placeholder="Equipo, temporada (uno por línea)..." />
      <TextArea name="achievements" label="Torneos y logros" placeholder="Campeonatos, reconocimientos..." />

      <SectionTitle>Técnica</SectionTitle>
      <div className="space-y-2">
        <CB name="techReception" label="Recepción" />
        <CB name="techDig" label="Defensa (dig)" />
        <CB name="techReadingDefense" label="Lectura defensiva" />
        <CB name="techFloatServe" label="Saque flotado" />
        <CB name="techJumpServe" label="Saque de salto" />
        <CB name="techSetting" label="Colocación" />
        <CB name="techLineAttack" label="Ataque en linea" />
        <CB name="techDiagonalAttack" label="Ataque en diagonal" />
        <CB name="techTipAttack" label="Ataque en punta (tip)" />
        <CB name="techRollAttack" label="Roll shot" />
        <CB name="techBlockReading" label="Bloqueo — lectura" />
        <CB name="techBlockHands" label="Bloqueo — manos" />
        <CB name="techBlockMovement" label="Bloqueo — desplazamiento" />
        <CB name="techCoverageTransition" label="Coberturas y transición" />
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

function FlagFootballForm() {
  return (
    <>
      <SectionTitle>Perfil técnico</SectionTitle>
      <Select id="sp-ff-role" name="primaryRole" label="Rol principal" options={FF_ROLE} />
      <Select id="sp-ff-hand" name="throwingHand" label="Mano dominante (si lanza)" options={THROW_HAND} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Estilo de juego</p>
        <CB name="styleSpeed" label="Velocidad" />
        <CB name="styleRoutes" label="Rutas / técnica" />
        <CB name="stylePhysical" label="Juego físico" />
        <CB name="styleVision" label="Visión de juego" />
      </div>

      <SectionTitle>Formato y experiencia</SectionTitle>
      <Select id="sp-ff-format" name="format" label="Modalidad principal" options={FF_FORMAT} />
      <Input id="sp-ff-years" name="yearsExp" type="number" min={0} max={30} label="Años de experiencia" placeholder="3" />
      <TextArea name="teamsLeagues" label="Ligas y equipos" placeholder="Liga, equipo, temporada (uno por línea)..." />
      <TextArea name="achievements" label="Logros y nivel" placeholder="Campeonatos, MVP, selección..." />
      <Input id="sp-ff-tackle" name="tackleExp" label="Exp. en tackle u otros deportes" placeholder="Americano, rugby, etc." />

      <SectionTitle>Habilidades — QB</SectionTitle>
      <div className="space-y-2">
        <CB name="qbShortPass" label="Pase corto" />
        <CB name="qbMediumPass" label="Pase medio" />
        <CB name="qbLongPass" label="Pase largo" />
        <CB name="qbPrecision" label="Precisión" />
        <CB name="qbReadDefense" label="Lectura de defensa" />
        <CB name="qbMechanics" label="Mecánica / velocidad de salida" />
        <CB name="qbMobility" label="Movilidad (scramble / throw on run)" />
      </div>

      <SectionTitle>Habilidades — Receptor</SectionTitle>
      <div className="space-y-2">
        <CB name="recRoutes" label="Rutas" />
        <CB name="recHands" label="Manos (general)" />
        <CB name="recTrafficCatch" label="Atrapar en trafico" />
        <CB name="recOneHand" label="Atrapar con una mano" />
        <CB name="recSeparation" label="Separación / COD" />
        <CB name="recZoneReading" label="Lectura vs zona" />
      </div>

      <SectionTitle>Habilidades — Corredor</SectionTitle>
      <div className="space-y-2">
        <CB name="rbVision" label="Vision de campo" />
        <CB name="rbCuts" label="Cortes y elusividad" />
        <CB name="rbFlagSecurity" label="Seguridad de bandera (ball security)" />
        <CB name="rbPatience" label="Paciencia" />
        <CB name="rbExplosiveness" label="Explosividad" />
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
      bothHands: bool("bothHands"),
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
      ftPct: str("ftPct"),
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
      throwingHand: str("throwingHand"),
      styleSpeed: bool("styleSpeed"),
      styleRoutes: bool("styleRoutes"),
      stylePhysical: bool("stylePhysical"),
      styleVision: bool("styleVision"),
      format: str("format"),
      yearsExp: str("yearsExp"),
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
  const router = useRouter();
  const [sport, setSport] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      router.push("/dashboard");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSkip() {
    await completeOnboarding();
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          Paso 3 de 3 — Opcional
        </div>
        <CardTitle>Ficha deportiva especializada</CardTitle>
        <p className="text-sm text-white/70">
          Detalla tu experiencia en un deporte específico. Puedes agregar más fichas desde tu perfil.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Select
            id="ob-sp-sport"
            name="sport"
            label="Deporte"
            options={SPORT_OPTIONS}
            onChange={(e) => setSport(e.target.value)}
          />

          {sport === "soccer" && <SoccerForm />}
          {sport === "basketball" && <BasketballForm />}
          {sport === "volleyball" && <VolleyballForm />}
          {sport === "flag_football" && <FlagFootballForm />}
          {sport !== "" && <ConductSection />}

          {error ? (
            <p
              className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar y finalizar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Saltar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
