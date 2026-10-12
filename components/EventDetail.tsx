"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiClientError, api } from "@/lib/api-client";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventDto } from "@/lib/events";
import { CardDesigner } from "./CardDesigner";
import { CategoryBadge, EventImage } from "./EventCard";
import { RemindButton } from "./RemindButton";
import { btnPrimary, EmptyState, ErrorState } from "./ui";

type State =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "error"; message: string }
  | { status: "ready"; event: EventDto };

export function EventDetail({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(() => {
    setState({ status: "loading" });
    api<{ event: EventDto }>(`/api/events/${id}`)
      .then((d) => setState({ status: "ready", event: d.event }))
      .catch((err) => {
        if (err instanceof ApiClientError && err.status === 404) setState({ status: "notfound" });
        else setState({ status: "error", message: err.message });
      });
  }, [id]);

  useEffect(load, [load]);

  if (state.status === "loading") {
    return (
      <div className="space-y-4" role="status" aria-label="Loading event">
        <div className="aspect-[21/9] animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-24 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }
  if (state.status === "notfound") {
    return (
      <EmptyState
        emoji="🫥"
        title="We couldn't find that event"
        message="It may have been removed or is no longer available."
        action={
          <Link href="/" className={btnPrimary}>
            Browse events
          </Link>
        }
      />
    );
  }
  if (state.status === "error") return <ErrorState message={state.message} onRetry={load} />;

  const { event } = state;
  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">
        ← All events
      </Link>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <EventImage src={event.imageUrl} alt={event.title} className="aspect-[16/9] w-full sm:aspect-[21/9]" />
        <div className="space-y-4 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryBadge category={event.category} />
            <span className="text-lg font-bold text-slate-900">{formatPrice(event.price)}</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{event.title}</h1>

          <div className="space-y-1 text-slate-600">
            <p>🗓️ {formatEventDate(event.startsAt)}</p>
            <p>📍 {event.city}</p>
          </div>

          <p className="max-w-3xl whitespace-pre-line leading-relaxed text-slate-700">{event.description}</p>

          <RemindButton eventId={event.id} initialReminded={event.reminded} className="w-full sm:w-auto" />
        </div>
      </article>

      <CardDesigner event={event} />
    </div>
  );
}
