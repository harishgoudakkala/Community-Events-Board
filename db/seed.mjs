import { buildSeedEvents } from "./seed-data.mjs";

/** Inserts the 15 sample events. Caller decides when (empty table, or after reset). */
export function insertSeedEvents(db, now = new Date()) {
  const insert = db.prepare(
    `INSERT INTO events (title, category, city, starts_at, price, description, image_url, is_active)
     VALUES (@title, @category, @city, @startsAt, @price, @description, @imageUrl, @isActive)`
  );
  const run = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  const rows = buildSeedEvents(now);
  run(rows);
  return rows.length;
}
