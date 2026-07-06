/**
 * Affinity Algorithm
 * Returns an integer 0-100 representing how compatible a student is with
 * a recruitment event based on the coach's requirements.
 *
 * Weight distribution (100 pts total):
 *   Position / Role  → 40 pts  (primary = 100 %, secondary/subrole = 50 %)
 *   Skills           → 35 pts
 *   Years experience → 15 pts
 *   Level            → 10 pts
 *
 * Hard filter: gender vs event category. Incompatible → 0.
 */

// ─── Input types ──────────────────────────────────────────────────────────────

export type AffinityStudentProfile = {
  gender?: string | null;
};

export type AffinityGeneralCard = {
  experienceLevel?: string | null;
};

// All fields from the specialized card's JSON data column.
export type AffinitySpecializedData = Record<string, unknown>;

/** Subset of the Event.requirements JSON that drives recruitment matching. */
export type AffinityEventRequirements = {
  category?: string;        // "V" | "F" | "Mixto"
  level?: string;           // "beginner" | "intermediate" | "experienced"
  sportsCharacteristics?: {
    primaryPosition?: string;   // soccer / basketball
    position?: string;          // volleyball
    primaryRole?: string;       // flag_football
    dominantFoot?: string;
    dominantHand?: string;
    throwingHand?: string;
    minYearsExp?: string | number;
    skills?: string[];          // array of required skill keys
  };
};

// ─── Weights ──────────────────────────────────────────────────────────────────

const W_POSITION = 40;
const W_SKILLS   = 35;
const W_YEARS    = 15;
const W_LEVEL    = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_ORDER: Record<string, number> = {
  beginner:     0,
  intermediate: 1,
  experienced:  2,
};

function genderCompatible(
  playerGender: string | null | undefined,
  category: string | undefined,
): boolean {
  if (!category || category === "Mixto") return true;
  if (!playerGender) return true; // no gender set → don't filter out
  if (category === "V") return playerGender === "male";
  if (category === "F") return playerGender === "female";
  return true;
}

function scorePosition(
  sport: string,
  sc: AffinityEventRequirements["sportsCharacteristics"],
  data: AffinitySpecializedData,
): number {
  if (!sc) return W_POSITION; // no requirement → full points

  let reqPos: string | undefined;
  let studentPrimary: unknown;
  let studentSecondary: unknown;
  let studentSubrole: unknown;

  if (sport === "soccer") {
    reqPos = sc.primaryPosition;
    studentPrimary   = data.primaryPosition;
    studentSecondary = data.secondaryPosition;
    studentSubrole   = data.primarySubrole;
  } else if (sport === "basketball") {
    reqPos = sc.primaryPosition;
    studentPrimary   = data.primaryPosition;
    studentSecondary = data.secondaryPosition;
  } else if (sport === "volleyball") {
    reqPos = sc.position;
    studentPrimary = data.position;
    // no secondary role in volleyball
  } else if (sport === "flag_football") {
    reqPos = sc.primaryRole;
    studentPrimary   = data.primaryRole;
    studentSecondary = data.secondaryRole;
  }

  if (!reqPos) return W_POSITION; // coach didn't specify → full

  if (String(studentPrimary ?? "") === reqPos) return W_POSITION;                    // 100 %
  if (String(studentSecondary ?? "") === reqPos) return Math.round(W_POSITION * 0.5); // 50 %
  if (String(studentSubrole ?? "").toLowerCase().includes(reqPos.toLowerCase()))
    return Math.round(W_POSITION * 0.5);

  return 0;
}

function scoreSkills(
  sc: AffinityEventRequirements["sportsCharacteristics"],
  data: AffinitySpecializedData,
): number {
  const reqSkills = sc?.skills;
  if (!reqSkills || reqSkills.length === 0) return W_SKILLS; // no requirement → full

  const matched = reqSkills.filter((k) => data[k] === true).length;
  return Math.round((matched / reqSkills.length) * W_SKILLS);
}

function scoreYears(
  sc: AffinityEventRequirements["sportsCharacteristics"],
  data: AffinitySpecializedData,
): number {
  const reqMin = sc?.minYearsExp;
  if (reqMin === undefined || reqMin === "" || reqMin === null) return W_YEARS;

  const min = Number(reqMin);
  const student = Number(data.yearsExp ?? 0);

  if (student >= min)       return W_YEARS;
  if (student >= min - 1)   return Math.round(W_YEARS * 0.5);
  return 0;
}

function scoreLevel(
  reqLevel: string | undefined,
  specializedLevel: unknown,
  generalLevel: string | null | undefined,
): number {
  if (!reqLevel) return W_LEVEL;

  const studentLvl = String(specializedLevel ?? generalLevel ?? "");
  if (!studentLvl) return Math.round(W_LEVEL * 0.5); // unknown → partial

  const reqIdx = LEVEL_ORDER[reqLevel] ?? -1;
  const stuIdx = LEVEL_ORDER[studentLvl] ?? -1;

  if (reqIdx === -1 || stuIdx === -1) return Math.round(W_LEVEL * 0.5);

  const diff = Math.abs(reqIdx - stuIdx);
  if (diff === 0) return W_LEVEL;
  if (diff === 1) return Math.round(W_LEVEL * 0.5);
  return 0;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeAffinity({
  sport,
  requirements,
  studentProfile,
  generalCard,
  specializedData,
}: {
  sport: string;
  requirements: AffinityEventRequirements;
  studentProfile: AffinityStudentProfile | null;
  generalCard: AffinityGeneralCard | null;
  specializedData: AffinitySpecializedData | null;
}): number {
  // Hard gender filter
  if (!genderCompatible(studentProfile?.gender, requirements.category)) return 0;

  // If there's no specialized card we can't score most things
  const data: AffinitySpecializedData = specializedData ?? {};
  const sc = requirements.sportsCharacteristics;

  const pts =
    scorePosition(sport, sc, data) +
    scoreSkills(sc, data)          +
    scoreYears(sc, data)           +
    scoreLevel(requirements.level, data.level, generalCard?.experienceLevel);

  return Math.min(100, Math.max(0, pts));
}
