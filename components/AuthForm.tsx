"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiClientError, api } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";
import { btnPrimary, FieldError, inputCls, Spinner } from "./ui";

// Only allow same-site relative paths, so ?next= cannot be used to bounce people to another site.
function safeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isSignup = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await api<{ hasFavourites: boolean }>(`/api/auth/${mode}`, {
        method: "POST",
        body: { email, password },
      });
      await refresh();
      toast(isSignup ? "Welcome! Your account is ready." : "Welcome back!");

      const next = safeNext(searchParams.get("next"));
      if (isSignup || !data.hasFavourites) {
        // First visit: pick favourite categories, then come back to where they were going.
        router.replace(next ? `/favourites?next=${encodeURIComponent(next)}` : "/favourites");
      } else {
        router.replace(next ?? "/feed");
      }
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

  const other = isSignup ? "/login" : "/signup";
  const nextParam = searchParams.get("next");
  const otherHref = nextParam ? `${other}?next=${encodeURIComponent(nextParam)}` : other;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {isSignup
            ? "Save reminders, pick your favourite categories and design event cards."
            : "Log in to see your feed and reminders."}
        </p>

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
              type="email"
              autoComplete="email"
              required
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
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            {isSignup && !fieldErrors.password && (
              <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
            )}
            <FieldError message={fieldErrors.password} />
          </div>

          <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
            {busy && <Spinner className="h-4 w-4" />}
            {isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <Link href={otherHref} className="font-semibold text-indigo-600 hover:underline">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
