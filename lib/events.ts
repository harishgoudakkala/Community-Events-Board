import { queryRows } from "./db";

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
  reminded: boolean;
}

interface EventRow {
  id: number | string;
  title: string;
  category: string;
  city: string;
  starts_at: string;
  price: number;
  description: string;
  image_url: string;
  is_active: boolean;
  reminded: boolean;
}

function toDto(row: EventRow): EventDto {
  return {
    id: Number(row.id),
    title: row.title,
    category: row.category,
    city: row.city,
    startsAt: new Date(row.starts_at).toISOString(),
    price: Number(row.price),
    description: row.description,
    imageUrl: row.image_url,
    isActive: Boolean(row.is_active),
    reminded: Boolean(row.reminded),
  };
}

const SELECT_EVENT = `
  SELECT e.id, e.title, e.category, e.city, e.starts_at, e.price, e.description,
         e.image_url, e.is_active,
         (r.user_id IS NOT NULL) AS reminded
  FROM events e
  LEFT JOIN reminders r ON r.event_id = e.id AND r.user_id = $1
`;

export interface EventsQuery {
  categories?: string[];
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
  return `%${text.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

/** Public listing: active and upcoming events, nearest first. */
export async function queryUpcomingEvents(query: EventsQuery): Promise<Paginated<EventDto>> {
  const where = ["e.is_active = TRUE", "e.starts_at >= NOW()"];
  const params: unknown[] = [query.userId ?? 0];
  let placeholder = 2;

  if (query.categories?.length) {
    const values = query.categories.map(() => `$${placeholder++}`);
    where.push(`e.category IN (${values.join(", ")})`);
    params.push(...query.categories);
  }
  if (query.city) {
    where.push(`LOWER(e.city) = LOWER($${placeholder++})`);
    params.push(query.city);
  }
  if (query.q) {
    where.push(`(e.title ILIKE $${placeholder} ESCAPE '\\' OR e.description ILIKE $${placeholder + 1} ESCAPE '\\')`);
    const pattern = likePattern(query.q);
    params.push(pattern, pattern);
    placeholder += 2;
  }

  const whereSql = where.join(" AND ");
  // The event SELECT reserves $1 for the reminder join. The count query has no
  // join, so its filter parameters must start at $1 instead of $2.
  const countWhereSql = whereSql.replace(/\$(\d+)/g, (_match, index) => `$${Number(index) - 1}`);
  const [{ total }] = await queryRows<{ total: number | string }>(
    `SELECT COUNT(*)::int AS total FROM events e WHERE ${countWhereSql}`,
    params.slice(1)
  );
  const limit = placeholder++;
  const offset = placeholder;
  const rows = await queryRows<EventRow>(
    `${SELECT_EVENT} WHERE ${whereSql} ORDER BY e.starts_at ASC, e.id ASC LIMIT $${limit} OFFSET $${offset}`,
    [...params, query.pageSize, (query.page - 1) * query.pageSize]
  );

  const itemCount = Number(total);
  return { items: rows.map(toDto), page: query.page, pageSize: query.pageSize, total: itemCount, totalPages: Math.max(1, Math.ceil(itemCount / query.pageSize)) };
}

export async function getActiveEvent(id: number, userId?: number | null): Promise<EventDto | null> {
  const [row] = await queryRows<EventRow>(
    `${SELECT_EVENT} WHERE e.id = $2 AND e.is_active = TRUE`,
    [userId ?? 0, id]
  );
  return row ? toDto(row) : null;
}

export async function listCities(): Promise<string[]> {
  const rows = await queryRows<{ city: string }>(
    "SELECT DISTINCT city FROM events WHERE is_active = TRUE AND starts_at >= NOW() ORDER BY city"
  );
  return rows.map((row) => row.city);
}

/** Admin sees all events, including inactive and past ones. */
export async function listAllEvents(): Promise<EventDto[]> {
  const rows = await queryRows<EventRow>(`${SELECT_EVENT} ORDER BY e.starts_at DESC, e.id DESC`, [0]);
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

export async function createEvent(input: NewEvent): Promise<EventDto> {
  const [row] = await queryRows<EventRow>(
    `INSERT INTO events (title, category, city, starts_at, price, description, image_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
     RETURNING id, title, category, city, starts_at, price, description, image_url, is_active, FALSE AS reminded`,
    [input.title, input.category, input.city, input.startsAt, input.price, input.description, input.imageUrl]
  );
  return toDto(row);
}

/** Events are never deleted, only switched on or off. */
export async function setEventActive(id: number, isActive: boolean): Promise<EventDto | null> {
  const [row] = await queryRows<EventRow>(
    `UPDATE events SET is_active = $2 WHERE id = $1
     RETURNING id, title, category, city, starts_at, price, description, image_url, is_active, FALSE AS reminded`,
    [id, isActive]
  );
  return row ? toDto(row) : null;
}
