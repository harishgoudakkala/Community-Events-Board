import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE, JWT_SECRET } from "@/lib/config";

// Runs on the server before any /admin page or /api/admin route is reached.
// (Edge runtime: it must not import the database or bcrypt, only verify the JWT.)

const secret = new TextEncoder().encode(JWT_SECRET);

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

async function isAdmin(req: NextRequest): Promise<boolean> {
  const header = req.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  if (await isAdmin(req)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
