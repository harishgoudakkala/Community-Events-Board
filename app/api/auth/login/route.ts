import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setAuthCookie, signUserToken } from "@/lib/auth";
import { USER_COOKIE, USER_TOKEN_TTL_SECONDS } from "@/lib/config";
import { ApiError, parse, readJson, run } from "@/lib/http";
import { findUserByEmail, getFavourites } from "@/lib/user-data";
import { loginSchema } from "@/lib/validation";

// Compared against when the email is unknown, so "no such user" and "wrong password"
// take about the same time and return the same message.
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("not-a-real-password", 12));

export async function POST(req: NextRequest) {
  return run(async () => {
    const { email, password } = parse(loginSchema, await readJson(req));

    const user = findUserByEmail(email);
    const ok = await bcrypt.compare(password, user?.password_hash ?? getDummyHash());
    if (!user || !ok) throw new ApiError(401, "Incorrect email or password.");

    const token = await signUserToken(user.id);
    const res = NextResponse.json({
      token, // for mobile / API clients; the web app uses the httpOnly cookie set below
      user: { id: user.id, email: user.email },
      hasFavourites: getFavourites(user.id).length > 0,
    });
    setAuthCookie(res, req, USER_COOKIE, token, USER_TOKEN_TTL_SECONDS);
    return res;
  });
}
