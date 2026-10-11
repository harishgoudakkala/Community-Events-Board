import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { ADMIN_COOKIE } from "@/lib/config";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res, ADMIN_COOKIE);
  return res;
}
