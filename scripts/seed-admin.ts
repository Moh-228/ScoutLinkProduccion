/**
 * Seed script: creates the admin user.
 * Run with: npx tsx scripts/seed-admin.ts
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

const EMAIL = process.env.ADMIN_EMAIL ?? "admin@scoutlink.mx";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@ScoutLink1";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
    if (existing) {
      console.log(`El usuario administrador ya existe: ${EMAIL}`);
      return;
    }

    const passwordHash = await hash(PASSWORD, 12);

    const admin = await prisma.user.create({
      data: {
        email: EMAIL,
        passwordHash,
        role: "admin",
        isActive: true,
        onboardingCompleted: true,
      },
      select: { id: true, email: true, role: true },
    });

    console.log("Administrador creado exitosamente:");
    console.log(`  ID:    ${admin.id}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Rol:   ${admin.role}`);
    console.log(`\nContraseña: ${PASSWORD}`);
    console.log("Cambia la contraseña después del primer inicio de sesión.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
