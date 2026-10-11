import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { setAuthCookie, signAdminToken } from "@/lib/auth";
import { ADMIN_COOKIE, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_TOKEN_TTL_SECONDS } from "@/lib/config";
import { ApiError, parse, readJson, run } from "@/lib/http";
import { adminLoginSchema } from "@/lib/validation";

// Hash both sides first so the comparison is constant-time and length-safe.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(req: NextRequest) {
  return run(async () => {
    const { email, password } = parse(adminLoginSchema, await readJson(req));

    const emailOk = safeEqual(email, ADMIN_EMAIL);
    const passwordOk = safeEqual(password, ADMIN_PASSWORD);
    if (!emailOk || !passwordOk) throw new ApiError(401, "Incorrect admin email or password.");

    const token = await signAdminToken();
    const res = NextResponse.json({ token, admin: { email: ADMIN_EMAIL } });
    setAuthCookie(res, req, ADMIN_COOKIE, token, ADMIN_TOKEN_TTL_SECONDS);
    return res;
  });
}
