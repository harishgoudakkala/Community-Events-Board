"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { btnSecondary } from "./ui";

export function AdminBar({ current }: { current: "list" | "new" }) {
  const router = useRouter();

  async function logout() {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  }

  const tab = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1">
        <span className="mr-2 rounded-md bg-amber-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          Admin
        </span>
        <Link href="/admin" className={tab(current === "list")}>
          Events
        </Link>
        <Link href="/admin/events/new" className={tab(current === "new")}>
          Add event
        </Link>
      </div>
      <button type="button" onClick={logout} className={btnSecondary}>
        Log out
      </button>
    </div>
  );
}
