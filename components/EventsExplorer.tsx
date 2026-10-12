"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { CATEGORIES, CATEGORY_STYLES, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { EventList } from "./EventList";
import { btnSecondary, EmptyState, inputCls } from "./ui";
import { useEventList } from "./useEventList";

/**
 * The home page. Filter state lives in the URL (?category=Music&city=Coimbatore&q=night&page=2),
 * so it survives a refresh, works with the back button and can be shared as a link.
 */
export function EventsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const city = searchParams.get("city") ?? "";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  function setParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in patch)) next.delete("page"); // any filter change goes back to page 1
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Search box: type freely, update the URL (and the results) 350ms after the last keystroke.
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  useEffect(() => {
    if (text.trim() === q) return;
    const timer = setTimeout(() => setParams({ q: text.trim() || undefined }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // City options come from the API (cities that currently have upcoming events).
  const [cities, setCities] = useState<string[]>([]);
  useEffect(() => {
    api<{ cities: string[] }>("/api/cities")
      .then((d) => setCities(d.cities))
      .catch(() => setCities([])); // the filter just stays empty; the list itself still works
  }, []);

  const listUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (city) p.set("city", city);
    if (q) p.set("q", q);
    p.set("page", String(page));
    p.set("pageSize", String(DEFAULT_PAGE_SIZE));
    return `/api/events?${p.toString()}`;
  }, [category, city, q, page]);

  const { state, reload } = useEventList(listUrl);
  const hasFilters = Boolean(category || city || q);

  return (
    <div>
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-10 sm:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What&apos;s happening near you?</h1>
        <p className="mt-2 max-w-xl text-sm text-indigo-100 sm:text-base">
          Music nights, workshops, food fairs and more. Pick a category, a city, or just search.
        </p>
      </section>

      <section aria-label="Filters" className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <div>
            <label htmlFor="search" className="sr-only">
              Search events
            </label>
            <input
              id="search"
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search by title or description…"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="city" className="sr-only">
              City
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setParams({ city: e.target.value || undefined })}
              className={inputCls}
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {/* keep a city from the URL selectable even if it has no upcoming events right now */}
              {city && !cities.includes(city) && <option value={city}>{city}</option>}
            </select>
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Category">
          <CategoryChip active={category === ""} onClick={() => setParams({ category: undefined })}>
            All
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c} active={category === c} onClick={() => setParams({ category: c })}>
              <span aria-hidden="true">{CATEGORY_STYLES[c].emoji}</span> {c}
            </CategoryChip>
          ))}
        </div>
      </section>

      <EventList
        state={state}
        onRetry={reload}
        onPageChange={(p) => {
          setParams({ page: p > 1 ? String(p) : undefined });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        empty={
          <EmptyState
            emoji="🔍"
            title={hasFilters ? "No events match your filters" : "No upcoming events yet"}
            message={
              hasFilters
                ? "Try a different category or city, or search for something else."
                : "New events are added all the time. Check back soon!"
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setText("");
                    router.replace(pathname, { scroll: false });
                  }}
                >
                  Clear all filters
                </button>
              ) : undefined
            }
          />
        }
      />
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
