import { neon } from "@neondatabase/serverless";

/**
 * Creates the Neon HTTP query client on demand. Keeping this lazy means builds
 * and static tooling do not require a production connection string.
 */
export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local.");
  }
  return neon(connectionString);
}

/** Typed wrapper for Neon HTTP query results. */
export async function queryRows<T>(query: string, params: unknown[] = []): Promise<T[]> {
  return (await getSql().query(query, params)) as T[];
}
