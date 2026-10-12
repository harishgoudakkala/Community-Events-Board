"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiClientError, api } from "@/lib/api-client";
import { btnPrimary, FieldError, inputCls, Spinner } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      await api("/api/admin/login", { method: "POST", body: { email, password } });
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.fields ? null : err.message);
        setFieldErrors(err.fields ?? {});
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          Admin
        </span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Admin login</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to add and manage events.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <FieldError message={fieldErrors.email} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            <FieldError message={fieldErrors.password} />
          </div>
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
            {busy && <Spinner className="h-4 w-4" />}
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
