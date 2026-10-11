import type { NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { queryUpcomingEvents } from "@/lib/events";
import { json, parse, run } from "@/lib/http";
import { eventsQuerySchema } from "@/lib/validation";

// GET /api/events?category=Music&city=Coimbatore&q=night&page=1&pageSize=6
export async function GET(req: NextRequest) {
  return run(async () => {
    const params = parse(eventsQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
    const user = await getUser(req);

    const result = queryUpcomingEvents({
      categories: params.category ? [params.category] : undefined,
      city: params.city,
      q: params.q,
      page: params.page,
      pageSize: params.pageSize,
      userId: user?.id,
    });
    return json(result);
  });
}
