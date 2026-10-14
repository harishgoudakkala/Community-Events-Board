import { listCities } from "@/lib/events";
import { json, run } from "@/lib/http";

// Cities that have at least one active, upcoming event. Feeds the city filter.
export async function GET() {
  return run(async () => json({ cities: await listCities() }));
}
