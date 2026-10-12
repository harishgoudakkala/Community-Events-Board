"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError, api } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";

/**
 * Optimistic toggle:
 *  1. the label changes the instant it is clicked,
 *  2. the server call runs in the background (the reminder is stored in the DB, so it survives a refresh),
 *  3. if the call fails, the label goes back and an error message is shown.
 */
export function RemindButton({
  eventId,
  initialReminded,
  className = "",
}: {
  eventId: number;
  initialReminded: boolean;
  className?: string;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [reminded, setReminded] = useState(initialReminded);
  const [pending, setPending] = useState(false);

  // If the list is re-fetched (filters, page change), trust the server value again.
  useEffect(() => setReminded(initialReminded), [initialReminded]);

  async function onClick() {
    if (status === "loading" || pending) return;
    if (status === "guest") {
      const here = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(here)}`);
      return;
    }

    const next = !reminded;
    setReminded(next); // 1. update the screen immediately
    setPending(true);
    try {
      await api(`/api/events/${eventId}/reminder`, { method: next ? "PUT" : "DELETE" });
    } catch (err) {
      setReminded(!next); // 3. roll back
      toast(
        err instanceof ApiClientError && err.status === 401
          ? "Your session has expired. Please log in again."
          : "Couldn't save your reminder. Please try again.",
        "error"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={reminded}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
        reminded
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } ${className}`}
    >
      <span aria-hidden="true">{reminded ? "✅" : "🔔"}</span>
      {reminded ? "Reminder set" : "Remind me"}
    </button>
  );
}
