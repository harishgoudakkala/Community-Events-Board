"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBar } from "@/components/AdminBar";
import { CategoryBadge, EventImage } from "@/components/EventCard";
import { useToast } from "@/components/ToastProvider";
import { btnPrimary, btnSecondary, EmptyState, ErrorState } from "@/components/ui";
import { ApiClientError, api } from "@/lib/api-client";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventDto } from "@/lib/events";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: EventDto[] };

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<State>({ status: "loading" });
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setState({ status: "loading" });
    api<{ items: EventDto[] }>("/api/admin/events")
      .then((d) => setState({ status: "ready", items: d.items }))
      .catch((err) => {
        if (err instanceof ApiClientError && err.status === 401) router.replace("/admin/login");
        else setState({ status: "error", message: err.message });
      });
  }, [router]);

  useEffect(load, [load]);

  async function toggle(event: EventDto) {
    setBusyId(event.id);
    try {
      const { event: updated } = await api<{ event: EventDto }>(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        body: { isActive: !event.isActive },
      });
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, items: prev.items.map((e) => (e.id === updated.id ? updated : e)) }
          : prev
      );
      toast(updated.isActive ? "Event is now active." : "Event is now inactive.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update the event.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminBar current="list" />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-sm text-slate-600">
            Inactive events are hidden from visitors. Nothing is ever deleted.
          </p>
        </div>
        <Link href="/admin/events/new" className={btnPrimary}>
          + Add event
        </Link>
      </div>

      {state.status === "loading" && (
        <div className="space-y-3" role="status" aria-label="Loading events">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      )}

      {state.status === "error" && <ErrorState message={state.message} onRetry={load} />}

      {state.status === "ready" && state.items.length === 0 && (
        <EmptyState
          emoji="📅"
          title="No events yet"
          message="Add the first event and it will show up for visitors straight away."
          action={
            <Link href="/admin/events/new" className={btnPrimary}>
              Add event
            </Link>
          }
        />
      )}

      {state.status === "ready" && state.items.length > 0 && (
        <ul className="space-y-3">
          {state.items.map((e) => {
            const past = new Date(e.startsAt).getTime() < Date.now();
            return (
              <li
                key={e.id}
                className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center ${
                  e.isActive ? "" : "opacity-75"
                }`}
              >
                <EventImage src={e.imageUrl} alt="" className="h-32 w-full rounded-xl sm:h-20 sm:w-32 sm:shrink-0" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={e.category} />
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        e.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {e.isActive ? "Active" : "Inactive"}
                    </span>
                    {past && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Past
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-semibold text-slate-900">{e.title}</p>
                  <p className="text-sm text-slate-600">
                    {formatEventDate(e.startsAt)} · {e.city} · {formatPrice(e.price)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(e)}
                  disabled={busyId === e.id}
                  className={`${btnSecondary} sm:w-32`}
                >
                  {e.isActive ? "Make inactive" : "Make active"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
