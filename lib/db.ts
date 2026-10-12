import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA_SQL } from "../db/schema.mjs";
import { insertSeedEvents } from "../db/seed.mjs";

// One connection per server process. Kept on globalThis so dev hot-reload
// does not open a new connection on every file change.
const globalForDb = globalThis as unknown as { __eventsDb?: Database.Database };

/** Lazy on purpose: nothing touches the disk until the first API call. */
export function getDb(): Database.Database {
  if (globalForDb.__eventsDb) return globalForDb.__eventsDb;

  const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "events.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);

  // First run: load the sample events so the app is usable immediately.
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM events").get() as { count: number };
  if (count === 0) {
    insertSeedEvents(db);
  }

  globalForDb.__eventsDb = db;
  return db;
}
