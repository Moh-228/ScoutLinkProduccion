/**
 * Seed script: creates one verified coach and one verified student for testing.
 * Run with: npx tsx scripts/seed-test-users.ts
 *
 * Optional env overrides: COACH_EMAIL, STUDENT_EMAIL, TEST_USER_PASSWORD.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

// Load .env manually so the script works outside Next.js
try {
  const envPath = resolve(process.cwd(), ".env");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // no .env file found — rely on environment
}

const PASSWORD = process.env.TEST_USER_PASSWORD ?? "Test@ScoutLink1";
const COACH_EMAIL = process.env.COACH_EMAIL ?? "entrenador.prueba@scoutlink.mx";
const STUDENT_EMAIL = process.env.STUDENT_EMAIL ?? "estudiante.prueba@scoutlink.mx";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await hash(PASSWORD, 12);

    const coachExists = await prisma.user.findUnique({ where: { email: COACH_EMAIL } });
    if (coachExists) {
      console.log(`Ya existe el entrenador: ${COACH_EMAIL}`);
    } else {
      const coach = await prisma.user.create({
        data: {
          email: COACH_EMAIL,
          passwordHash,
          role: "coach",
          isActive: true,
          onboardingCompleted: true,
          emailVerified: true,
          coachProfile: {
            create: { displayName: "Entrenador de Prueba" },
          },
        },
        select: { id: true, email: true, role: true },
      });
      console.log(`Entrenador creado: ${coach.email} (${coach.id})`);
    }

    const studentExists = await prisma.user.findUnique({ where: { email: STUDENT_EMAIL } });
    if (studentExists) {
      console.log(`Ya existe el estudiante: ${STUDENT_EMAIL}`);
    } else {
      const student = await prisma.user.create({
        data: {
          email: STUDENT_EMAIL,
          passwordHash,
          role: "student",
          isActive: true,
          onboardingCompleted: true,
          emailVerified: true,
          studentProfile: {
            create: { fullName: "Estudiante de Prueba" },
          },
        },
        select: { id: true, email: true, role: true },
      });
      console.log(`Estudiante creado: ${student.email} (${student.id})`);
    }

    console.log(`\nContraseña de ambos usuarios: ${PASSWORD}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
