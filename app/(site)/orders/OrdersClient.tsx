"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import DishArt from "@/app/components/DishArt";
import { api } from "@/app/lib/api";
import { formatDate, formatPrice, shortId } from "@/app/lib/format";
import {
  STATUS_FLOW,
  STATUS_LABEL,
  STATUS_STYLE,
  type Order,
} from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";

/** Horizontal progress rail: pending → approved → preparing → ready → completed. */
function StatusRail({ status }: { status: Order["status"] }) {
  if (status === "cancelled") {
    return (
      <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-rose-50 px-4 py-3">
        <svg viewBox="0 0 16 16" className="size-4 text-rose-500" aria-hidden>
          <circle
            cx="8"
            cy="8"
            r="6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="m5.6 5.6 4.8 4.8M10.4 5.6l-4.8 4.8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-sm text-rose-700">
          This order was cancelled. Nothing was charged.
        </p>
      </div>
    );
  }

  const current = STATUS_FLOW.indexOf(status);

  return (
    <ol className="mt-6 flex items-center">
      {STATUS_FLOW.map((step, index) => {
        const done = index <= current;
        const active = index === current;

        return (
          <li
            key={step}
            className={`flex items-center ${index < STATUS_FLOW.length - 1 ? "flex-1" : ""}`}
          >
            <div className="flex flex-col items-center gap-2">
              <span
                className={`relative grid size-7 place-items-center rounded-full text-[0.6rem] font-bold transition-colors duration-500 ${
                  done
                    ? "bg-carrot-500 text-white"
                    : "bg-ink-100 text-ink-400"
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-carrot-500"
                    style={{
                      animation: "rm-pulse-ring 1.8s ease-out infinite",
                    }}
                  />
                )}
                <span className="relative">
                  {done && !active ? (
                    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                      <path
                        d="m3 6.2 2 2 4-4.2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
              </span>

              <span
                className={`hidden text-[0.65rem] font-medium sm:block ${
                  done ? "text-ink-700" : "text-ink-300"
                }`}
              >
                {STATUS_LABEL[step]}
              </span>
            </div>

            {index < STATUS_FLOW.length - 1 && (
              <span
                className={`mx-1.5 -mt-6 h-0.5 flex-1 rounded-full transition-colors duration-700 sm:mx-2 ${
                  index < current ? "bg-carrot-500" : "bg-ink-100"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrdersClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const justPlaced = params.get("placed");

  const load = useCallback(async () => {
    try {
      const { orders } = await api<{ orders: Order[] }>("/orders", {
        auth: true,
      });
      setOrders(orders);
      setError(null);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?next=/orders");
      return;
    }

    // Loading from the API; state is set from the async result.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [user, authLoading, router, load]);

  // Poll while anything is still moving through the kitchen.
  useEffect(() => {
    const live = orders.some(
      (order) => !["completed", "cancelled"].includes(order.status)
    );
    if (!live) return;

    const timer = window.setInterval(load, 20000);
    return () => window.clearInterval(timer);
  }, [orders, load]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="h-10 w-56 rounded-full shimmer" />
        <div className="mt-10 space-y-5">
          {[0, 1].map((i) => (
            <div key={i} className="h-52 rounded-3xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="animate-rise">
        <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-carrot-600">
          <span className="h-px w-8 bg-carrot-400" />
          Your kitchen history
        </p>
        <h1 className="mt-4 font-display text-[2.2rem] font-normal leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.8rem]">
          My orders.
        </h1>
      </header>

      {error && (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="animate-rise delay-1 mt-10 rounded-3xl border border-dashed border-ink-200 bg-white px-8 py-20 text-center">
          <DishArt name="no orders yet" className="mx-auto size-28 rounded-full" />
          <h2 className="mt-6 font-display text-xl font-semibold text-ink-900">
            No orders yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">
            When you order, you&apos;ll be able to follow it here from the pot to
            your door.
          </p>
          <Link
            href="/menu"
            className="mt-7 inline-block rounded-full bg-carrot-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600"
          >
            Order something
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-5">
          {orders.map((order, index) => {
            const isNew = order._id === justPlaced;

            return (
              <li
                key={order._id}
                className={`animate-rise rounded-3xl border bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-ink-900/[0.05] ${
                  isNew
                    ? "border-carrot-300 ring-4 ring-carrot-500/10"
                    : "border-ink-900/[0.07]"
                }`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {isNew && (
                  <p className="mb-4 flex items-center gap-2 rounded-xl bg-carrot-50 px-3.5 py-2.5 text-xs font-semibold text-carrot-700">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-carrot-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-carrot-500" />
                    </span>
                    Order received — the kitchen has it now.
                  </p>
                )}

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-ink-900">
                      {shortId(order._id)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${STATUS_STYLE[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                <StatusRail status={order.status} />

                <ul className="mt-6 space-y-2 border-t border-ink-100 pt-5">
                  {order.items.map((item, itemIndex) => (
                    <li
                      key={`${order._id}-${itemIndex}`}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-carrot-50 text-[0.65rem] font-bold text-carrot-600">
                          {item.quantity}
                        </span>
                        <span className="truncate text-ink-700">
                          {item.name}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-ink-500">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-baseline justify-between border-t border-ink-100 pt-4">
                  <span className="text-sm font-semibold text-ink-900">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold tabular-nums text-ink-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
