"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { CATEGORIES, CATEGORY_STYLES, type Category } from "@/lib/constants";
import { useRequireAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";
import { btnPrimary, ErrorState, PageTitle, Spinner } from "./ui";

export function FavouritesPicker() {
  const authStatus = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [selected, setSelected] = useState<Category[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (authStatus !== "authed") return;
    setLoadState("loading");
    api<{ categories: Category[] }>("/api/favourites")
      .then((d) => {
        setSelected(d.categories);
        setLoadState("ready");
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoadState("error");
      });
  }, [authStatus, nonce]);

  function toggle(c: Category) {
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function save() {
    setSaving(true);
    try {
      await api("/api/favourites", { method: "PUT", body: { categories: selected } });
      toast("Favourites saved.");
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/feed");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't save your favourites.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (authStatus !== "authed" || loadState === "loading") {
    return (
      <div className="flex justify-center py-20 text-indigo-600" role="status" aria-label="Loading">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (loadState === "error") {
    return <ErrorState message={loadError} onRetry={() => setNonce((n) => n + 1)} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle
        title="What are you into?"
        subtitle="Pick the categories you like. Your feed will only show upcoming events from these."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => {
          const on = selected.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              aria-pressed={on}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-6 text-sm font-semibold transition ${
                on
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="text-4xl" aria-hidden="true">
                {CATEGORY_STYLES[c].emoji}
              </span>
              {c}
              <span className="text-xs font-medium text-indigo-600" aria-hidden="true">
                {on ? "✓ Selected" : " "}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving || selected.length === 0} className={btnPrimary}>
          {saving && <Spinner className="h-4 w-4" />}
          Save and see my feed
        </button>
        {selected.length === 0 && <p className="text-sm text-slate-500">Pick at least one.</p>}
      </div>
    </div>
  );
}
