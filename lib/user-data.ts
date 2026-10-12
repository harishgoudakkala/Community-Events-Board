import { getDb } from "./db";
import { DEFAULT_THEME } from "./constants";

// ---- Accounts ----

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
}

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;
}

export function insertUser(email: string, passwordHash: string): { id: number; email: string } {
  const info = getDb()
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
    .run(email, passwordHash);
  return { id: Number(info.lastInsertRowid), email };
}

// ---- Favourite categories ----

export function getFavourites(userId: number): string[] {
  const rows = getDb()
    .prepare("SELECT category FROM favourite_categories WHERE user_id = ? ORDER BY category")
    .all(userId) as { category: string }[];
  return rows.map((r) => r.category);
}

/** Replaces the whole set in one transaction. */
export function setFavourites(userId: number, categories: string[]): string[] {
  const db = getDb();
  const replace = db.transaction((cats: string[]) => {
    db.prepare("DELETE FROM favourite_categories WHERE user_id = ?").run(userId);
    const insert = db.prepare("INSERT INTO favourite_categories (user_id, category) VALUES (?, ?)");
    for (const c of cats) insert.run(userId, c);
  });
  replace(categories);
  return getFavourites(userId);
}

// ---- Reminders ----

export function addReminder(userId: number, eventId: number): void {
  getDb()
    .prepare("INSERT OR IGNORE INTO reminders (user_id, event_id) VALUES (?, ?)")
    .run(userId, eventId);
}

export function removeReminder(userId: number, eventId: number): void {
  getDb().prepare("DELETE FROM reminders WHERE user_id = ? AND event_id = ?").run(userId, eventId);
}

// ---- Card designs ----

export interface CardDesign {
  theme: string;
  stickers: string[];
}

export function getCardDesign(userId: number, eventId: number): CardDesign {
  const row = getDb()
    .prepare("SELECT theme, stickers FROM card_designs WHERE user_id = ? AND event_id = ?")
    .get(userId, eventId) as { theme: string; stickers: string } | undefined;
  if (!row) return { theme: DEFAULT_THEME, stickers: [] };
  return { theme: row.theme, stickers: JSON.parse(row.stickers) as string[] };
}

export function saveCardDesign(userId: number, eventId: number, design: CardDesign): CardDesign {
  getDb()
    .prepare(
      `INSERT INTO card_designs (user_id, event_id, theme, stickers, updated_at)
       VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       ON CONFLICT (user_id, event_id)
       DO UPDATE SET theme = excluded.theme, stickers = excluded.stickers, updated_at = excluded.updated_at`
    )
    .run(userId, eventId, design.theme, JSON.stringify(design.stickers));
  return design;
}
