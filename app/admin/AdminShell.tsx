"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Logo from "@/app/components/Logo";
import { initials } from "@/app/lib/format";
import { useAuth } from "@/app/providers/AuthProvider";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <path
        d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <>
        <rect
          x="4"
          y="3"
          width="12"
          height="14"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    href: "/admin/foods",
    label: "Menu items",
    icon: (
      <>
        <circle
          cx="10"
          cy="10"
          r="6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <ellipse
          cx="10"
          cy="9.5"
          rx="3.2"
          ry="2.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: (
      <>
        <rect
          x="3.5"
          y="3.5"
          width="5.5"
          height="5.5"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="3.5"
          width="5.5"
          height="5.5"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="3.5"
          y="11"
          width="5.5"
          height="5.5"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="11"
          width="5.5"
          height="5.5"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </>
    ),
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  // Client-side gate. The API enforces the real check on every request —
  // this only keeps non-admins from seeing an empty shell.
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }

    if (!isAdmin) router.replace("/");
  }, [user, isAdmin, loading, router]);

  // Close the mobile nav after a route change.
  useEffect(() => {
    const id = requestAnimationFrame(() => setNavOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 24 24" className="size-8 animate-spin text-carrot-500" aria-hidden>
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="2.5"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-sm text-ink-400">Checking your access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-cream">
      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-900/[0.07] bg-white transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-ink-100 px-5 py-5">
          <Logo href="/admin" />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-ink-900 text-white shadow-lg shadow-ink-900/15"
                    : "text-ink-600 hover:bg-carrot-50 hover:text-carrot-700"
                }`}
              >
                <svg viewBox="0 0 20 20" className="size-[1.15rem]" aria-hidden>
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-100 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <svg viewBox="0 0 20 20" className="size-[1.15rem]" aria-hidden>
              <path
                d="M11 5 6 10l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View the site
          </Link>

          <div className="mt-2 flex items-center gap-3 rounded-xl bg-cream px-3.5 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-carrot-500 text-xs font-bold text-white">
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">
                {user.name}
              </p>
              <p className="truncate text-[0.68rem] text-ink-400">Administrator</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              aria-label="Sign out"
              className="shrink-0 text-ink-300 transition-colors hover:text-rose-500"
            >
              <svg viewBox="0 0 20 20" className="size-[1.15rem]" aria-hidden>
                <path
                  d="M8 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H8M13 13.5 16.5 10 13 6.5M16 10H7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* scrim */}
      {navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          aria-hidden
          className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-900/[0.07] bg-cream/85 px-5 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            className="grid size-10 place-items-center rounded-xl border border-ink-900/10 bg-white text-ink-700"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path
                d="M2.5 4h11M2.5 8h11M2.5 12h11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className="font-display text-lg font-semibold text-ink-900">
            Admin
          </span>
        </header>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
