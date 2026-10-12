"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import {
  CATEGORY_STYLES,
  DEFAULT_THEME,
  MAX_STICKERS,
  STICKERS,
  THEMES,
  type Category,
  type StickerKey,
  type ThemeKey,
} from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/format";
import type { EventDto } from "@/lib/events";
import { useAuth } from "./AuthProvider";
import { Spinner } from "./ui";

interface Design {
  theme: ThemeKey;
  stickers: StickerKey[];
}

// A placed sticker. `uid` keeps React's identity stable, `leaving` plays the exit animation.
interface Item {
  uid: number;
  key: StickerKey;
  leaving?: boolean;
}

// Where the 1st, 2nd and 3rd sticker sit on the card (percent of card size).
// Percentages (not top/bottom/left/right mixes) so a sticker can glide between slots.
const SLOTS = [
  { left: 76, top: 5, rotate: 12 },
  { left: 5, top: 62, rotate: -12 },
  { left: 74, top: 62, rotate: 6 },
];

const stickerEmoji = (key: StickerKey) => STICKERS.find((s) => s.key === key)!.emoji;
const stickerLabel = (key: StickerKey) => STICKERS.find((s) => s.key === key)!.label;

type SaveState = "idle" | "saving" | "saved" | "error";

export function CardDesigner({ event }: { event: EventDto }) {
  const { status } = useAuth();
  const endpoint = `/api/events/${event.id}/card`;

  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const uidCounter = useRef(1);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDesign = useRef<Design | null>(null); // a change that has not reached the server yet

  // Load the saved design (only logged-in users have one).
  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    api<{ design: Design }>(endpoint)
      .then(({ design }) => {
        if (cancelled) return;
        setTheme(design.theme);
        setItems(design.stickers.map((key) => ({ uid: uidCounter.current++, key })));
      })
      .catch(() => {
        /* no saved design or a hiccup: start from the default card */
      })
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [status, endpoint]);

  async function sendSave(design: Design, keepalive = false) {
    try {
      await api(endpoint, { method: "PUT", body: design, keepalive });
      if (pendingDesign.current === design) {
        pendingDesign.current = null;
        setSaveState("saved");
      }
    } catch {
      setSaveState("error");
    }
  }

  // Debounced: a quick series of taps becomes one request.
  function scheduleSave(design: Design) {
    if (status !== "authed") return;
    pendingDesign.current = design;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => sendSave(design), 500);
  }

  // Leaving the page within the debounce window: still send the last change.
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (pendingDesign.current) {
        api(endpoint, { method: "PUT", body: pendingDesign.current, keepalive: true }).catch(() => {});
      }
    },
    [endpoint]
  );

  const visible = items.filter((i) => !i.leaving);

  function toDesign(nextTheme: ThemeKey, nextItems: Item[]): Design {
    return { theme: nextTheme, stickers: nextItems.filter((i) => !i.leaving).map((i) => i.key) };
  }

  function chooseTheme(next: ThemeKey) {
    if (!loaded || next === theme) return;
    setTheme(next);
    scheduleSave(toDesign(next, items));
  }

  function addSticker(key: StickerKey) {
    if (!loaded || visible.length >= MAX_STICKERS) return;
    const next = [...items, { uid: uidCounter.current++, key }];
    setItems(next);
    scheduleSave(toDesign(theme, next));
  }

  function removeSticker(uid: number) {
    if (!loaded) return;
    const next = items.map((i) => (i.uid === uid ? { ...i, leaving: true } : i));
    setItems(next);
    scheduleSave(toDesign(theme, next));
    // Let the shrink animation finish, then drop it from the list.
    setTimeout(() => setItems((prev) => prev.filter((i) => i.uid !== uid)), 250);
  }

  const full = visible.length >= MAX_STICKERS;
  const categoryEmoji = CATEGORY_STYLES[event.category as Category]?.emoji ?? "🎟️";

  return (
    <section aria-labelledby="designer-heading" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 id="designer-heading" className="text-xl font-bold text-slate-900">
        Design your card
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Make a card for this event. Pick a background and add up to {MAX_STICKERS} stickers.
      </p>

      {status === "guest" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Link
            href={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`}
            className="font-semibold underline"
          >
            Log in
          </Link>{" "}
          to save your design. You can still play with it here.
        </p>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-start">
        {/* ---- Live preview ---- */}
        <div className="relative mx-auto aspect-[4/3] w-full max-w-md select-none overflow-hidden rounded-3xl shadow-xl">
          {/* All backgrounds are stacked and cross-faded: gradients cannot be transitioned directly. */}
          {THEMES.map((t) => (
            <div
              key={t.key}
              aria-hidden="true"
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${t.gradient} ${
                theme === t.key ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="relative flex h-full flex-col justify-between p-5 text-white">
            <span className="w-fit rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur">
              {categoryEmoji} {event.category}
            </span>
            <div className="drop-shadow">
              <h3 className="text-xl font-extrabold leading-tight sm:text-2xl">{event.title}</h3>
              <p className="mt-1 text-sm font-medium">{formatEventDate(event.startsAt)}</p>
              <p className="text-sm">
                📍 {event.city} · <span className="font-bold">{formatPrice(event.price)}</span>
              </p>
            </div>
          </div>

          {items.map((item, index) => {
            const slot = SLOTS[index % SLOTS.length];
            return (
              <button
                key={item.uid}
                type="button"
                onClick={() => removeSticker(item.uid)}
                disabled={item.leaving}
                aria-label={`Remove ${stickerLabel(item.key)} sticker`}
                title="Tap to remove"
                className="absolute z-10 transition-all duration-500 ease-out"
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  transform: `rotate(${slot.rotate}deg) scale(${item.leaving ? 0 : 1})`,
                  opacity: item.leaving ? 0 : 1,
                }}
              >
                {/* inner span runs the "pop" entrance, outer button handles position and exit */}
                <span className="relative inline-block animate-pop text-4xl drop-shadow-md sm:text-5xl">
                  {stickerEmoji(item.key)}
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow"
                  >
                    ×
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ---- Controls ---- */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Background</h3>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Background theme">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="radio"
                  aria-checked={theme === t.key}
                  onClick={() => chooseTheme(t.key)}
                  className={`rounded-xl border-2 p-1.5 text-xs font-semibold transition ${
                    theme === t.key ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-600"
                  }`}
                >
                  <span className={`mb-1 block h-10 rounded-lg ${t.gradient}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-900">
              Stickers
              <span className="text-xs font-medium text-slate-500">
                {visible.length} / {MAX_STICKERS}
              </span>
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {STICKERS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => addSticker(s.key)}
                  aria-disabled={full}
                  aria-label={`Add ${s.label} sticker`}
                  className={`aspect-square rounded-xl border border-slate-200 bg-slate-50 text-2xl transition ${
                    full ? "cursor-not-allowed opacity-40" : "hover:scale-110 hover:bg-white hover:shadow"
                  }`}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {full
                ? `That's the maximum of ${MAX_STICKERS}. Tap a sticker on the card to remove it.`
                : "Tap a sticker to add it. Tap one on the card to remove it."}
            </p>
          </div>

          <SaveStatus
            state={status === "authed" && loaded ? saveState : "idle"}
            onRetry={() => pendingDesign.current && scheduleSave(pendingDesign.current)}
          />
        </div>
      </div>

      {!loaded && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500" role="status">
          <Spinner className="h-4 w-4" /> Loading your saved design…
        </div>
      )}
    </section>
  );
}

function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === "idle") return null;
  if (state === "error") {
    return (
      <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
        Couldn&apos;t save your design.{" "}
        <button type="button" onClick={onRetry} className="font-semibold underline">
          Try again
        </button>
      </p>
    );
  }
  return (
    <p role="status" className="text-sm text-slate-500">
      {state === "saving" ? "Saving…" : "✓ Saved"}
    </p>
  );
}
