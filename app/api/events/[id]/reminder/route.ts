import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { getActiveEvent } from "@/lib/events";
import { ApiError, json, parseId, run } from "@/lib/http";
import { addReminder, removeReminder } from "@/lib/user-data";

// PUT = "remind me", DELETE = "stop reminding me". Both are idempotent.

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const user = await requireUser(req);
    const id = parseId((await ctx.params).id);
    if (!(await getActiveEvent(id))) throw new ApiError(404, "This event was not found or is no longer available.");
    await addReminder(user.id, id);
    return json({ reminded: true });
  });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return run(async () => {
    const user = await requireUser(req);
    const id = parseId((await ctx.params).id);
    await removeReminder(user.id, id);
    return json({ reminded: false });
  });
}
