// Single source of truth for the database schema.
// Used by lib/db.ts (app) and scripts/seed.mjs (reset + seed).

export const CATEGORY_LIST = ["Music", "Workshop", "Food", "Sports", "Kids"];

const categoryCheck = CATEGORY_LIST.map((c) => `'${c}'`).join(", ");

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN (${categoryCheck})),
  city        TEXT NOT NULL COLLATE NOCASE,
  starts_at   TEXT NOT NULL,                 -- ISO 8601 UTC, e.g. 2026-10-18T13:00:00.000Z
  price       INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),  -- whole rupees, 0 = free
  description TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- "Active + upcoming, nearest first" with no other filter.
CREATE INDEX IF NOT EXISTS idx_events_active_start
  ON events (is_active, starts_at);

-- Same listing narrowed by category and/or city (equality columns first, date last).
CREATE INDEX IF NOT EXISTS idx_events_filter
  ON events (is_active, category, city, starts_at);

CREATE TABLE IF NOT EXISTS favourite_categories (
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (${categoryCheck})),
  PRIMARY KEY (user_id, category)
);

CREATE TABLE IF NOT EXISTS reminders (
  user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS card_designs (
  user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  theme      TEXT NOT NULL,
  stickers   TEXT NOT NULL DEFAULT '[]',     -- JSON array of sticker keys, max 3
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, event_id)
);
`;
