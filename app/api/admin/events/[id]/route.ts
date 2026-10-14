import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { setEventActive } from "@/lib/events";
import { ApiError, json, parse, parseId, readJson, run } from "@/lib/http";
import { setActiveSchema } from "@/lib/validation";

// PATCH { "isActive": false } hides an event; there is deliberately no DELETE.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return run(async () => {
    await requireAdmin(req);
    const id = parseId((await ctx.params).id);
    const { isActive } = parse(setActiveSchema, await readJson(req));
    const event = await setEventActive(id, isActive);
    if (!event) throw new ApiError(404, "Event not found.");
    return json({ event });
  });
}
