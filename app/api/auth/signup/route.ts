import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setAuthCookie, signUserToken } from "@/lib/auth";
import { USER_COOKIE, USER_TOKEN_TTL_SECONDS } from "@/lib/config";
import { ApiError, parse, readJson, run } from "@/lib/http";
import { findUserByEmail, insertUser } from "@/lib/user-data";
import { signupSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  return run(async () => {
    const { email, password } = parse(signupSchema, await readJson(req));

    if (await findUserByEmail(email)) {
      throw new ApiError(409, "An account with this email already exists.", {
        email: "This email is already registered.",
      });
    }

    // bcrypt adds a random salt and stores it inside the hash string.
    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await insertUser(email, passwordHash);
    } catch (err) {
      // Two signups racing for the same email: the UNIQUE constraint is the real guard.
      if ((err as { code?: string }).code === "23505") {
        throw new ApiError(409, "An account with this email already exists.", {
          email: "This email is already registered.",
        });
      }
      throw err;
    }

    const token = await signUserToken(user.id);
    const res = NextResponse.json({ token, user, hasFavourites: false }, { status: 201 });
    setAuthCookie(res, req, USER_COOKIE, token, USER_TOKEN_TTL_SECONDS);
    return res;
  });
}
