// Usage:
//   npm run db:seed            -> insert picture-backed sample events when empty
//   npm run db:seed -- --reset -> remove database rows, then seed fresh data
import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";
import { SCHEMA_STATEMENTS } from "../db/schema.mjs";
import { insertSeedEvents } from "../db/seed.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required. Copy .env.example to .env.local and add your Neon URL.");

const sql = neon(process.env.DATABASE_URL);
const reset = process.argv.includes("--reset");

for (const statement of SCHEMA_STATEMENTS) await sql.query(statement);

if (reset) {
  await sql.query("TRUNCATE TABLE card_designs, reminders, favourite_categories, events, users RESTART IDENTITY CASCADE");
  console.log("Removed existing database rows.");
}

const [{ count }] = await sql.query("SELECT COUNT(*)::int AS count FROM events");
if (Number(count) > 0) {
  console.log(`Events table already has ${count} rows. Use \"npm run db:seed -- --reset\" to start over.`);
} else {
  const inserted = await insertSeedEvents(sql);
  console.log(`Inserted ${inserted} sample events into Neon.`);
}
