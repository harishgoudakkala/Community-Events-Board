import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { json, run } from "@/lib/http";
import { getFavourites } from "@/lib/user-data";

export async function GET(req: NextRequest) {
  return run(async () => {
    const user = await requireUser(req);
    return json({ user, hasFavourites: getFavourites(user.id).length > 0 });
  });
}
