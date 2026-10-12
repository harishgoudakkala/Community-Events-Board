// Runtime config. Safe to import from middleware (no Node-only modules here).

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "[config] JWT_SECRET is not set. Using an insecure development secret. Set JWT_SECRET before deploying."
  );
}

export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-me";

// One hard-coded admin (override with env vars).
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@events.local").toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@12345";

export const USER_COOKIE = "user_token";
export const ADMIN_COOKIE = "admin_token";

export const USER_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8 hours
