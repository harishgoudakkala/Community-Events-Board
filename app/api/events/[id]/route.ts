import type { NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { getActiveEvent } from "@/lib/events";
import { ApiError, json, parseId, run } from "@/lib/http";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const id = parseId((await ctx.params).id);
    const user = await getUser(req);
    const event = getActiveEvent(id, user?.id);
    if (!event) throw new ApiError(404, "This event was not found or is no longer available.");
    return json({ event });
  });
}
