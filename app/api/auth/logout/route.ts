import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { USER_COOKIE } from "@/lib/config";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res, USER_COOKIE);
  return res;
}
