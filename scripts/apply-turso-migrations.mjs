/**
 * Aplica prisma/migrations/*.sql a Turso (Prisma Migrate no aplica solo contra Turso).
 * Uso: desde la raíz del repo, con TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env:
 *   node scripts/apply-turso-migrations.mjs
 */
import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(root, ".env") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url?.length || !authToken?.length) {
  console.error(
    "Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en .env (raíz del proyecto).",
  );
  process.exit(1);
}

const migrationsDir = join(root, "prisma", "migrations");
const dirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const client = createClient({ url, authToken });

try {
  for (const dir of dirs) {
    const file = join(migrationsDir, dir, "migration.sql");
    const sql = readFileSync(file, "utf8");
    console.log(`Aplicando ${dir}...`);
    await client.executeMultiple(sql);
    console.log(`  OK`);
  }
  console.log("Migraciones aplicadas en Turso.");
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  client.close();
}
