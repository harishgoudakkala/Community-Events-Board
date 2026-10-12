import { SignJWT, jwtVerify } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_TOKEN_TTL_SECONDS,
  JWT_SECRET,
  USER_COOKIE,
  USER_TOKEN_TTL_SECONDS,
} from "./config";
import { getDb } from "./db";
import { ApiError } from "./http";

const secret = new TextEncoder().encode(JWT_SECRET);

export type Role = "user" | "admin";

export async function signToken(sub: string, role: Role, expiresInSeconds: number) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secret);
}

export const signUserToken = (userId: number) => signToken(String(userId), "user", USER_TOKEN_TTL_SECONDS);
export const signAdminToken = () => signToken("admin", "admin", ADMIN_TOKEN_TTL_SECONDS);

/** Reads the token from "Authorization: Bearer ..." (mobile/API clients) or the cookie (web). */
function readToken(req: NextRequest, cookieName: string): string | null {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return req.cookies.get(cookieName)?.value ?? null;
}

async function verify(token: string | null, role: Role): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload.role === role && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null; // expired, tampered, wrong secret...
  }
}

export interface AuthUser {
  id: number;
  email: string;
}

/** Returns the logged-in visitor, or null. Never throws. */
export async function getUser(req: NextRequest): Promise<AuthUser | null> {
  const sub = await verify(readToken(req, USER_COOKIE), "user");
  if (!sub) return null;
  const row = getDb().prepare("SELECT id, email FROM users WHERE id = ?").get(Number(sub)) as
    | AuthUser
    | undefined;
  return row ?? null;
}

export async function requireUser(req: NextRequest): Promise<AuthUser> {
  const user = await getUser(req);
  if (!user) throw new ApiError(401, "Please log in to continue.");
  return user;
}

/** Admin APIs call this even though middleware already checks: defence in depth. */
export async function requireAdmin(req: NextRequest): Promise<void> {
  const sub = await verify(readToken(req, ADMIN_COOKIE), "admin");
  if (!sub) throw new ApiError(401, "Admin login required.");
}

function isHttps(req: NextRequest): boolean {
  return req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
}

export function setAuthCookie(
  res: NextResponse,
  req: NextRequest,
  name: string,
  token: string,
  maxAgeSeconds: number
) {
  res.cookies.set({
    name,
    value: token,
    httpOnly: true, // not readable from JavaScript, so XSS cannot steal it
    sameSite: "lax", // not sent on cross-site POSTs, which blocks basic CSRF
    secure: isHttps(req),
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearAuthCookie(res: NextResponse, name: string) {
  res.cookies.set({ name, value: "", path: "/", maxAge: 0 });
}
