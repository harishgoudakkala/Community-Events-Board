"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_STYLES, DEFAULT_PAGE_SIZE, type Category } from "@/lib/constants";
import { useRequireAuth } from "./AuthProvider";
import { EventList } from "./EventList";
import { btnPrimary, btnSecondary, EmptyState, EventGridSkeleton, PageTitle } from "./ui";
import { useEventList } from "./useEventList";

export function FeedView() {
  const authStatus = useRequireAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const url = useMemo(
    () => (authStatus === "authed" ? `/api/feed?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}` : null),
    [authStatus, page]
  );
  const { state, reload } = useEventList(url);

  // Session expired between pages: go to login.
  useEffect(() => {
    if (state.status === "error" && state.httpStatus === 401) {
      router.replace("/login?next=/feed");
    }
  }, [state, router]);

  if (authStatus !== "authed") return <EventGridSkeleton />;

  const categories = state.status === "ready" ? ((state.data.categories ?? []) as Category[]) : [];

  return (
    <div>
      <PageTitle title="My Feed" subtitle="Upcoming events from the categories you picked." />

      {state.status === "ready" && categories.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700"
            >
              {CATEGORY_STYLES[c]?.emoji} {c}
            </span>
          ))}
          <Link href="/favourites" className="ml-1 text-sm font-semibold text-indigo-600 hover:underline">
            Edit
          </Link>
        </div>
      )}

      <EventList
        state={state}
        onRetry={reload}
        onPageChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        empty={
          categories.length === 0 ? (
            <EmptyState
              emoji="⭐"
              title="Your feed is waiting for you"
              message="Pick a few favourite categories and we will show the upcoming events you care about here."
              action={
                <Link href="/favourites" className={btnPrimary}>
                  Choose categories
                </Link>
              }
            />
          ) : (
            <EmptyState
              emoji="🎈"
              title="Nothing coming up in your categories"
              message={`No upcoming events in ${categories.join(", ")} right now. New ones are added often, so check back soon.`}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/" className={btnPrimary}>
                    Browse all events
                  </Link>
                  <Link href="/favourites" className={btnSecondary}>
                    Change categories
                  </Link>
                </div>
              }
            />
          )
        }
      />
    </div>
  );
}
