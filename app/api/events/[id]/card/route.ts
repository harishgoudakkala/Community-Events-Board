import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { getActiveEvent } from "@/lib/events";
import { ApiError, json, parse, parseId, readJson, run } from "@/lib/http";
import { getCardDesign, saveCardDesign } from "@/lib/user-data";
import { cardDesignSchema } from "@/lib/validation";

// One saved design per (user, event).

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const user = await requireUser(req);
    const id = parseId((await ctx.params).id);
    if (!getActiveEvent(id)) throw new ApiError(404, "This event was not found or is no longer available.");
    return json({ design: getCardDesign(user.id, id) });
  });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const user = await requireUser(req);
    const id = parseId((await ctx.params).id);
    if (!getActiveEvent(id)) throw new ApiError(404, "This event was not found or is no longer available.");
    const design = parse(cardDesignSchema, await readJson(req));
    return json({ design: saveCardDesign(user.id, id, design) });
  });
}
