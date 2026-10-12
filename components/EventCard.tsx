"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_STYLES, type Category } from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventDto } from "@/lib/events";
import { RemindButton } from "./RemindButton";

export function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category as Category];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        style?.badge ?? "bg-slate-100 text-slate-700"
      }`}
    >
      <span aria-hidden="true">{style?.emoji}</span>
      {category}
    </span>
  );
}

export function EventImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-200 to-violet-300 text-4xl ${className}`}
        role="img"
        aria-label={alt}
      >
        🎟️
      </div>
    );
  }
  return (
    // Plain <img>: image URLs come from the admin and can be any host.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export function EventCard({ event }: { event: EventDto }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/events/${event.id}`} className="block overflow-hidden">
        <EventImage
          src={event.imageUrl}
          alt=""
          className="aspect-video w-full transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={event.category} />
          <span className="text-sm font-bold text-slate-900">{formatPrice(event.price)}</span>
        </div>

        <div>
          <h3 className="text-base font-semibold leading-snug text-slate-900">
            <Link href={`/events/${event.id}`} className="hover:text-indigo-700">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-slate-600">{formatEventDate(event.startsAt)}</p>
          <p className="text-sm text-slate-500">📍 {event.city}</p>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <RemindButton eventId={event.id} initialReminded={event.reminded} className="flex-1" />
          <Link
            href={`/events/${event.id}`}
            className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
