import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";
import { SCHEMA_STATEMENTS } from "../db/schema.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required. Copy .env.example to .env.local and add your Neon URL.");

const sql = neon(process.env.DATABASE_URL);
for (const statement of SCHEMA_STATEMENTS) await sql.query(statement);
console.log("Neon schema is ready.");
