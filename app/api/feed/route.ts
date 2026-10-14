import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { queryUpcomingEvents } from "@/lib/events";
import { json, parse, run } from "@/lib/http";
import { getFavourites } from "@/lib/user-data";
import { pageQuerySchema } from "@/lib/validation";

// "My Feed": upcoming, active events in the user's favourite categories, nearest first.
export async function GET(req: NextRequest) {
  return run(async () => {
    const user = await requireUser(req);
    const { page, pageSize } = parse(pageQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
    const categories = await getFavourites(user.id);

    // No favourites yet: say so instead of silently returning everything.
    if (categories.length === 0) {
      return json({ items: [], page, pageSize, total: 0, totalPages: 1, categories });
    }

    const result = await queryUpcomingEvents({ categories, page, pageSize, userId: user.id });
    return json({ ...result, categories });
  });
}
