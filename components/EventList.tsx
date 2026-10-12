"use client";

import type { ReactNode } from "react";
import { EventCard } from "./EventCard";
import { Pagination } from "./Pagination";
import { ErrorState, EventGridSkeleton } from "./ui";
import type { EventListState } from "./useEventList";

/** Loading, error, empty and results in one place, shared by the Events page and My Feed. */
export function EventList({
  state,
  onRetry,
  onPageChange,
  empty,
}: {
  state: EventListState;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  empty: ReactNode;
}) {
  if (state.status === "loading") return <EventGridSkeleton />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={onRetry} />;

  const { items, page, totalPages, total } = state.data;
  if (items.length === 0) return <>{empty}</>;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} onChange={onPageChange} />
    </>
  );
}
