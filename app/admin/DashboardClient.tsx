"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/app/lib/api";
import { formatPrice, formatRelative, shortId } from "@/app/lib/format";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  type Category,
  type Food,
  type Order,
} from "@/app/lib/types";

/**
 * Sparkline of the last 14 days of revenue, drawn from the order list.
 * `asOf` is stamped when the data loads — reading the clock during render
 * would make the chart non-deterministic across re-renders.
 */
function RevenueTrend({ orders, asOf }: { orders: Order[]; asOf: number }) {
  const points = useMemo(() => {
    const days: number[] = Array.from({ length: 14 }, () => 0);

    for (const order of orders) {
      if (order.status === "cancelled" || !order.createdAt) continue;

      const age = Math.floor(
        (asOf - new Date(order.createdAt).getTime()) / 86_400_000
      );
      if (age >= 0 && age < 14) days[13 - age] += order.total;
    }

    return days;
  }, [orders, asOf]);

  const max = Math.max(...points, 1);
  const width = 100;
  const height = 34;

  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-10 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f96a15" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f96a15" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L${width} ${height} L0 ${height} Z`}
        fill="url(#trend-fill)"
      />
      <path
        d={path}
        fill="none"
        stroke="#f96a15"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function DashboardClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asOf, setAsOf] = useState(0);

  const load = useCallback(async () => {
    try {
      const [ordersRes, foodsRes, categoriesRes] = await Promise.all([
        api<{ orders: Order[] }>("/admin/orders", { auth: true }),
        api<{ foods: Food[] }>("/foods"),
        api<{ categories: Category[] }>("/categories"),
      ]);

      setOrders(ordersRes.orders);
      setFoods(foodsRes.foods);
      setCategories(categoriesRes.categories);
      setAsOf(Date.now());
      setError(null);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(load, 30000);
    // Fetching and polling the API is an external-system subscription;
    // state is set from the async result, not synchronously during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => window.clearInterval(timer);
  }, [load]);

  const stats = useMemo(() => {
    const settled = orders.filter((order) => order.status !== "cancelled");
    const revenue = settled.reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter((order) => order.status === "pending").length;
    const active = orders.filter((order) =>
      ["approved", "preparing", "ready"].includes(order.status)
    ).length;
    const serving = foods.filter((food) => food.available).length;
    const offToday = foods.filter((food) => !food.available).length;

    return { revenue, pending, active, serving, offToday, total: orders.length };
  }, [orders, foods]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-full shimmer" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl shimmer" />
          ))}
        </div>
        <div className="h-80 rounded-3xl shimmer" />
      </div>
    );
  }

  const CARDS = [
    {
      label: "Revenue",
      value: formatPrice(stats.revenue),
      note: `${stats.total} orders all time`,
      accent: "text-carrot-600",
    },
    {
      label: "Awaiting approval",
      value: String(stats.pending),
      note: stats.pending > 0 ? "Needs your attention" : "All caught up",
      accent: stats.pending > 0 ? "text-amber-600" : "text-emerald-600",
      href: "/admin/orders?status=pending",
    },
    {
      label: "In the kitchen",
      value: String(stats.active),
      note: "Approved, preparing or ready",
      accent: "text-sky-600",
      href: "/admin/orders",
    },
    {
      label: "Menu items",
      value: String(foods.length),
      note: `${categories.length} categories`,
      accent: "text-ink-900",
      href: "/admin/foods",
    },
  ];

  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[2rem] font-normal leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.4rem]">
            Kitchen overview
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            Live figures — refreshed every 30 seconds.
          </p>
        </div>

        <Link
          href="/admin/foods?new=1"
          className="inline-flex items-center gap-2 rounded-full bg-carrot-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path
              d="M8 3.5v9M3.5 8h9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Add a dish
        </Link>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card, index) => {
          const body = (
            <div
              className="animate-rise h-full rounded-3xl border border-ink-900/[0.07] bg-white p-6 transition-all duration-400 hover:-translate-y-1 hover:border-carrot-200 hover:shadow-xl hover:shadow-ink-900/[0.06]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
                {card.label}
              </p>
              <p
                className={`mt-3 font-display text-[1.9rem] font-bold leading-none ${card.accent}`}
              >
                {card.value}
              </p>
              <p className="mt-2.5 text-xs text-ink-400">{card.note}</p>
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href} className="block">
              {body}
            </Link>
          ) : (
            <div key={card.label}>{body}</div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* recent orders */}
        <section className="animate-rise delay-2 overflow-hidden rounded-3xl border border-ink-900/[0.07] bg-white">
          <header className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Latest orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-carrot-600 transition-colors hover:text-carrot-700"
            >
              See all
            </Link>
          </header>

          {recent.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-ink-400">
              No orders yet. They&apos;ll appear here the moment one lands.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recent.map((order) => {
                const customer =
                  order.user && typeof order.user === "object"
                    ? order.user.name
                    : "Customer";

                return (
                  <li key={order._id}>
                    <Link
                      href="/admin/orders"
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-cream/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                          {shortId(order._id)}
                          <span className="truncate font-normal text-ink-400">
                            · {customer}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-ink-400">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "dish" : "dishes"} ·{" "}
                          {formatRelative(order.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ring-1 ring-inset ${STATUS_STYLE[order.status]}`}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>

                      <span className="w-24 shrink-0 text-right text-sm font-bold tabular-nums text-ink-900">
                        {formatPrice(order.total)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          {/* trend */}
          <section className="animate-rise delay-3 rounded-3xl border border-ink-900/[0.07] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Last 14 days
            </h2>
            <p className="mt-1 text-xs text-ink-400">Revenue by day</p>
            <div className="mt-5">
              <RevenueTrend orders={orders} asOf={asOf} />
            </div>
          </section>

          {/* what's on today */}
          <section className="animate-rise delay-4 rounded-3xl border border-ink-900/[0.07] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              On the menu today
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
                <span className="text-sm text-emerald-800">Serving</span>
                <span className="font-display text-lg font-bold text-emerald-700">
                  {stats.serving}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-ink-100 px-4 py-3">
                <span className="text-sm text-ink-700">Off today</span>
                <span className="font-display text-lg font-bold text-ink-600">
                  {stats.offToday}
                </span>
              </li>
            </ul>

            <Link
              href="/admin/foods"
              className="mt-4 block rounded-2xl bg-ink-900 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-carrot-500"
            >
              Manage the menu
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
