import { buildSeedEvents } from "./seed-data.mjs";

/** Inserts picture-backed sample events into a Neon/Postgres database. */
export async function insertSeedEvents(sql, now = new Date()) {
  const rows = buildSeedEvents(now);
  for (const row of rows) {
    await sql.query(
      `INSERT INTO events (title, category, city, starts_at, price, description, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [row.title, row.category, row.city, row.startsAt, row.price, row.description, row.imageUrl, row.isActive]
    );
  }
  return rows.length;
}
