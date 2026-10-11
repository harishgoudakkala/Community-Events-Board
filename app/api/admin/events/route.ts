import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createEvent, listAllEvents } from "@/lib/events";
import { json, parse, readJson, run } from "@/lib/http";
import { createEventSchema } from "@/lib/validation";

// Admin list: every event, including inactive and past ones.
export async function GET(req: NextRequest) {
  return run(async () => {
    await requireAdmin(req);
    return json({ items: listAllEvents() });
  });
}

export async function POST(req: NextRequest) {
  return run(async () => {
    await requireAdmin(req);
    const input = parse(createEventSchema, await readJson(req));
    return json({ event: createEvent(input) }, 201);
  });
}
