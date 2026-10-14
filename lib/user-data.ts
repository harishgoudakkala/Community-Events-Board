import { DEFAULT_THEME } from "./constants";
import { getSql, queryRows } from "./db";

export interface UserRow { id: number; email: string; password_hash: string }

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const [row] = await queryRows<UserRow>("SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER($1)", [email]);
  return row ? { ...row, id: Number(row.id) } : undefined;
}

export async function insertUser(email: string, passwordHash: string): Promise<{ id: number; email: string }> {
  const [row] = await queryRows<{ id: number | string; email: string }>(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email", [email, passwordHash]
  );
  return { id: Number(row.id), email: row.email };
}

export async function getFavourites(userId: number): Promise<string[]> {
  const rows = await queryRows<{ category: string }>(
    "SELECT category FROM favourite_categories WHERE user_id = $1 ORDER BY category", [userId]
  );
  return rows.map((row) => row.category);
}

/** Replaces the whole set atomically in Neon. */
export async function setFavourites(userId: number, categories: string[]): Promise<string[]> {
  const sql = getSql();
  const queries = [sql`DELETE FROM favourite_categories WHERE user_id = ${userId}`];
  for (const category of categories) {
    queries.push(sql`INSERT INTO favourite_categories (user_id, category) VALUES (${userId}, ${category})`);
  }
  await sql.transaction(queries);
  return getFavourites(userId);
}

export async function addReminder(userId: number, eventId: number): Promise<void> {
  await getSql().query("INSERT INTO reminders (user_id, event_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, eventId]);
}

export async function removeReminder(userId: number, eventId: number): Promise<void> {
  await getSql().query("DELETE FROM reminders WHERE user_id = $1 AND event_id = $2", [userId, eventId]);
}

export interface CardDesign { theme: string; stickers: string[] }

export async function getCardDesign(userId: number, eventId: number): Promise<CardDesign> {
  const [row] = await queryRows<{ theme: string; stickers: string[] }>(
    "SELECT theme, stickers FROM card_designs WHERE user_id = $1 AND event_id = $2", [userId, eventId]
  );
  return row ? { theme: row.theme, stickers: row.stickers } : { theme: DEFAULT_THEME, stickers: [] };
}

export async function saveCardDesign(userId: number, eventId: number, design: CardDesign): Promise<CardDesign> {
  await getSql().query(
    `INSERT INTO card_designs (user_id, event_id, theme, stickers, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, NOW())
     ON CONFLICT (user_id, event_id)
     DO UPDATE SET theme = EXCLUDED.theme, stickers = EXCLUDED.stickers, updated_at = NOW()`,
    [userId, eventId, design.theme, JSON.stringify(design.stickers)]
  );
  return design;
}
