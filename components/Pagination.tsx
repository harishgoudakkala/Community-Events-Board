"use client";

import { btnSecondary } from "./ui";

export function Pagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return <p className="mt-6 text-center text-sm text-slate-500">{total} event{total === 1 ? "" : "s"}</p>;
  }
  return (
    <nav className="mt-8 flex items-center justify-between gap-3" aria-label="Pagination">
      <button type="button" className={btnSecondary} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <p className="text-center text-sm text-slate-600">
        Page <span className="font-semibold">{page}</span> of {totalPages}
        <span className="hidden text-slate-400 sm:inline"> · {total} events</span>
      </p>
      <button
        type="button"
        className={btnSecondary}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}
