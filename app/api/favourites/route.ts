import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { json, parse, readJson, run } from "@/lib/http";
import { getFavourites, setFavourites } from "@/lib/user-data";
import { favouritesSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  return run(async () => {
    const user = await requireUser(req);
    return json({ categories: getFavourites(user.id) });
  });
}

// Replaces the whole list: { "categories": ["Music", "Food"] }
export async function PUT(req: NextRequest) {
  return run(async () => {
    const user = await requireUser(req);
    const { categories } = parse(favouritesSchema, await readJson(req));
    return json({ categories: setFavourites(user.id, categories) });
  });
}
