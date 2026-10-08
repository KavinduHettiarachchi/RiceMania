"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { useCart } from "@/app/providers/CartProvider";
import { initials } from "@/app/lib/format";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout, loading } = useAuth();
  const { count, openCart } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    // Catch a restored scroll position on mount without a sync setState.
    const initial = requestAnimationFrame(onScroll);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMobileOpen(false);
      setMenuOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-ink-900/[0.06] bg-cream/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />

        {/* desktop links */}
        <ul className="hidden items-center gap-9 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-active={active}
                  className={`link-underline text-sm font-medium transition-colors ${
                    active
                      ? "text-carrot-600"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin panel entry — only for admins, exactly as requested */}
          {isAdmin && (
            <Link
              href="/admin"
              className="group hidden items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-ink-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-800 hover:shadow-xl sm:inline-flex"
            >
              <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                <path
                  d="M2.5 3.5h11M2.5 8h11M2.5 12.5h6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Admin Panel
            </Link>
          )}

          {/* cart — customers only */}
          {!isAdmin && (
            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
              className="relative grid size-11 place-items-center rounded-full border border-ink-900/10 bg-white text-ink-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-carrot-300 hover:text-carrot-600 hover:shadow-md"
            >
              <svg viewBox="0 0 20 20" className="size-[1.15rem]" aria-hidden>
                <path
                  d="M2.5 3h1.9l1.6 8.6a1.6 1.6 0 0 0 1.6 1.3h6.3a1.6 1.6 0 0 0 1.6-1.2l1.2-5.2H5.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="16.5" r="1.3" fill="currentColor" />
                <circle cx="14.5" cy="16.5" r="1.3" fill="currentColor" />
              </svg>

              {count > 0 && (
                <span
                  key={count}
                  className="animate-bounce-in absolute -right-0.5 -top-0.5 grid min-w-[1.3rem] place-items-center rounded-full bg-carrot-500 px-1 text-[0.65rem] font-bold text-white ring-2 ring-cream"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          )}

          {/* account */}
          {loading ? (
            <div className="size-11 rounded-full bg-ink-100" />
          ) : user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-carrot-300 hover:shadow-md"
              >
                <span className="grid size-8 place-items-center rounded-full bg-carrot-500 text-xs font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-24 truncate text-sm font-medium text-ink-800 sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <svg
                  viewBox="0 0 12 12"
                  className={`size-3 text-ink-400 transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path
                    d="m3 4.5 3 3 3-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="animate-scale-in absolute right-0 top-full mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-ink-900/[0.07] bg-white p-1.5 shadow-2xl shadow-ink-900/10"
                >
                  <div className="border-b border-ink-100 px-3 pb-2.5 pt-2">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-ink-400">{user.email}</p>
                  </div>

                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-carrot-50 hover:text-carrot-700"
                    >
                      Admin dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/orders"
                      className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-carrot-50 hover:text-carrot-700"
                    >
                      My orders
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-carrot-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600 hover:shadow-xl hover:shadow-carrot-500/30"
            >
              Sign in
            </Link>
          )}

          {/* mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            className="grid size-11 place-items-center rounded-full border border-ink-900/10 bg-white text-ink-800 lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-[1.7px] w-full rounded bg-current transition-all duration-300 ${mobileOpen ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[1.7px] w-full rounded bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute left-0 h-[1.7px] w-full rounded bg-current transition-all duration-300 ${mobileOpen ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      <div
        className={`overflow-hidden border-t border-ink-900/[0.06] bg-cream/95 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="space-y-1 px-5 py-4">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-carrot-50 hover:text-carrot-700"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className="block rounded-xl bg-ink-900 px-3 py-3 text-sm font-semibold text-white"
              >
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
