// PostgreSQL schema shared by the migrate and seed scripts.
export const CATEGORY_LIST = ["Music", "Workshop", "Food", "Sports", "Kids"];

const categoryCheck = CATEGORY_LIST.map((c) => `'${c}'`).join(", ");

export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (${categoryCheck})),
    city TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_active_start ON events (is_active, starts_at)`,
  `CREATE INDEX IF NOT EXISTS idx_events_filter ON events (is_active, category, city, starts_at)`,
  `CREATE TABLE IF NOT EXISTS favourite_categories (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (${categoryCheck})),
    PRIMARY KEY (user_id, category)
  )`,
  `CREATE TABLE IF NOT EXISTS reminders (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
  )`,
  `CREATE TABLE IF NOT EXISTS card_designs (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    theme TEXT NOT NULL,
    stickers JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
  )`,
];
