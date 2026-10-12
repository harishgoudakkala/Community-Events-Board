"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { status, user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
          <span aria-hidden="true">🎟️</span>
          <span>Events Board</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
          <NavLink href="/">Events</NavLink>
          <NavLink href="/feed">My Feed</NavLink>
          {status === "authed" && user ? (
            <>
              <span className="hidden max-w-[10rem] truncate px-2 text-xs text-slate-500 md:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Log out
              </button>
            </>
          ) : status === "guest" ? (
            <>
              <NavLink href="/login">Log in</NavLink>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
