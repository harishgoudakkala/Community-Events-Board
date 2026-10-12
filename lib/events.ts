import { getDb } from "./db";

// What the API returns for an event.
export interface EventDto {
  id: number;
  title: string;
  category: string;
  city: string;
  startsAt: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  reminded: boolean; // true if the logged-in user set a reminder; always false for guests
}

interface EventRow {
  id: number;
  title: string;
  category: string;
  city: string;
  starts_at: string;
  price: number;
  description: string;
  image_url: string;
  is_active: number;
  reminded: number;
}

function toDto(r: EventRow): EventDto {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    city: r.city,
    startsAt: r.starts_at,
    price: r.price,
    description: r.description,
    imageUrl: r.image_url,
    isActive: r.is_active === 1,
    reminded: r.reminded === 1,
  };
}

// `reminded` comes from a LEFT JOIN on the current user's reminders.
// User id 0 never exists (AUTOINCREMENT starts at 1), so guests simply never match.
const SELECT_EVENT = `
  SELECT e.id, e.title, e.category, e.city, e.starts_at, e.price, e.description,
         e.image_url, e.is_active,
         (r.user_id IS NOT NULL) AS reminded
  FROM events e
  LEFT JOIN reminders r ON r.event_id = e.id AND r.user_id = ?
`;

export interface EventsQuery {
  categories?: string[]; // match ANY of these (feed uses several, the filter uses one)
  city?: string;
  q?: string;
  page: number;
  pageSize: number;
  userId?: number | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Escape LIKE wildcards so a search for "50%" does not match everything. */
function likePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}

/**
 * Public listing: ACTIVE and UPCOMING events only, nearest date first.
 * Every filter is optional and they are all AND-ed in one WHERE clause,
 * so Music + Coimbatore + "night" returns only events matching all three.
 */
export function queryUpcomingEvents(query: EventsQuery): Paginated<EventDto> {
  const db = getDb();

  const where: string[] = ["e.is_active = 1", "e.starts_at >= ?"];
  const params: unknown[] = [new Date().toISOString()];

  if (query.categories && query.categories.length > 0) {
    where.push(`e.category IN (${query.categories.map(() => "?").join(", ")})`);
    params.push(...query.categories);
  }
  if (query.city) {
    where.push("e.city = ?"); // column is COLLATE NOCASE, so this is case-insensitive
    params.push(query.city);
  }
  if (query.q) {
    where.push("(e.title LIKE ? ESCAPE '\\' OR e.description LIKE ? ESCAPE '\\')");
    const pattern = likePattern(query.q);
    params.push(pattern, pattern);
  }

  const whereSql = where.join(" AND ");

  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM events e WHERE ${whereSql}`)
    .get(...params) as { total: number };

  const rows = db
    .prepare(`${SELECT_EVENT} WHERE ${whereSql} ORDER BY e.starts_at ASC, e.id ASC LIMIT ? OFFSET ?`)
    .all(query.userId ?? 0, ...params, query.pageSize, (query.page - 1) * query.pageSize) as EventRow[];

  return {
    items: rows.map(toDto),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

/** Single event for the public page. Inactive events are treated as not found. */
export function getActiveEvent(id: number, userId?: number | null): EventDto | null {
  const row = getDb()
    .prepare(`${SELECT_EVENT} WHERE e.id = ? AND e.is_active = 1`)
    .get(userId ?? 0, id) as EventRow | undefined;
  return row ? toDto(row) : null;
}

/** Cities that currently have at least one active, upcoming event (for the city filter). */
export function listCities(): string[] {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT city FROM events
       WHERE is_active = 1 AND starts_at >= ?
       ORDER BY city COLLATE NOCASE`
    )
    .all(new Date().toISOString()) as { city: string }[];
  return rows.map((r) => r.city);
}

// ---- Admin ----

/** Admin sees everything (active, inactive, past), newest date first. */
export function listAllEvents(): EventDto[] {
  const rows = getDb()
    .prepare(`${SELECT_EVENT} ORDER BY e.starts_at DESC, e.id DESC`)
    .all(0) as EventRow[];
  return rows.map(toDto);
}

export interface NewEvent {
  title: string;
  category: string;
  city: string;
  startsAt: string;
  price: number;
  description: string;
  imageUrl: string;
}

export function createEvent(input: NewEvent): EventDto {
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO events (title, category, city, starts_at, price, description, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
    )
    .run(
      input.title,
      input.category,
      input.city,
      input.startsAt,
      input.price,
      input.description,
      input.imageUrl
    );
  const row = db.prepare(`${SELECT_EVENT} WHERE e.id = ?`).get(0, info.lastInsertRowid) as EventRow;
  return toDto(row);
}

/** Events are never deleted, only switched on or off. Returns null if the id does not exist. */
export function setEventActive(id: number, isActive: boolean): EventDto | null {
  const db = getDb();
  const info = db.prepare("UPDATE events SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, id);
  if (info.changes === 0) return null;
  const row = db.prepare(`${SELECT_EVENT} WHERE e.id = ?`).get(0, id) as EventRow;
  return toDto(row);
}
