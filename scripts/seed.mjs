// Usage:
//   npm run seed            -> add sample events only if the events table is empty
//   npm run seed -- --reset -> delete the database file and start fresh with sample events
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA_SQL } from "../db/schema.mjs";
import { insertSeedEvents } from "../db/seed.mjs";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "events.db");
const reset = process.argv.includes("--reset");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

if (reset) {
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(dbPath + suffix, { force: true });
  }
  console.log("Removed existing database.");
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA_SQL);

const { count } = db.prepare("SELECT COUNT(*) AS count FROM events").get();
if (count > 0) {
  console.log(`Events table already has ${count} rows. Use "npm run seed -- --reset" to start over.`);
} else {
  const inserted = insertSeedEvents(db);
  console.log(`Inserted ${inserted} sample events into ${dbPath}`);
}
db.close();
