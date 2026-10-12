"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminBar } from "@/components/AdminBar";
import { useToast } from "@/components/ToastProvider";
import { btnPrimary, btnSecondary, FieldError, inputCls, Spinner } from "@/components/ui";
import { ApiClientError, api } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/constants";
import { istLocalToIsoWithOffset } from "@/lib/format";

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    category: "",
    city: "",
    startsAt: "", // datetime-local value, entered as India time
    price: "0",
    description: "",
    imageUrl: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      await api("/api/admin/events", {
        method: "POST",
        body: {
          ...form,
          price: Number(form.price),
          startsAt: form.startsAt ? istLocalToIsoWithOffset(form.startsAt) : "",
        },
      });
      toast("Event added.");
      router.push("/admin");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          router.replace("/admin/login");
          return;
        }
        setError(err.message);
        setFieldErrors(err.fields ?? {});
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminBar current="new" />

      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Add an event</h1>
        <p className="mt-1 text-sm text-slate-600">New events are active as soon as you save them.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {error && (
            <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <Field label="Title" id="title" error={fieldErrors.title}>
            <input id="title" value={form.title} onChange={set("title")} className={inputCls} maxLength={120} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" id="category" error={fieldErrors.category}>
              <select id="category" value={form.category} onChange={set("category")} className={inputCls}>
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City" id="city" error={fieldErrors.city}>
              <input id="city" value={form.city} onChange={set("city")} className={inputCls} maxLength={60} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date and time (India time)" id="startsAt" error={fieldErrors.startsAt}>
              <input
                id="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={set("startsAt")}
                className={inputCls}
              />
            </Field>
            <Field label="Price (₹, 0 for free)" id="price" error={fieldErrors.price}>
              <input
                id="price"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.price}
                onChange={set("price")}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description" id="description" error={fieldErrors.description}>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={set("description")}
              className={inputCls}
              maxLength={2000}
            />
          </Field>

          <Field label="Image URL" id="imageUrl" error={fieldErrors.imageUrl}>
            <input
              id="imageUrl"
              type="url"
              placeholder="https://…"
              value={form.imageUrl}
              onChange={set("imageUrl")}
              className={inputCls}
            />
          </Field>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy && <Spinner className="h-4 w-4" />}
              Save event
            </button>
            <button type="button" className={btnSecondary} onClick={() => router.push("/admin")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
