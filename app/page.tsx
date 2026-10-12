import { Suspense } from "react";
import { EventsExplorer } from "@/components/EventsExplorer";
import { EventGridSkeleton } from "@/components/ui";

export default function HomePage() {
  // useSearchParams() inside EventsExplorer needs a Suspense boundary.
  return (
    <Suspense fallback={<EventGridSkeleton />}>
      <EventsExplorer />
    </Suspense>
  );
}
