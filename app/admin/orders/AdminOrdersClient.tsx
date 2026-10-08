"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/app/lib/api";
import { formatDate, formatPrice, initials, shortId } from "@/app/lib/format";
import {
  ORDER_STATUSES,
  STATUS_LABEL,
  STATUS_STYLE,
  type Order,
  type OrderStatus,
} from "@/app/lib/types";
import { useToast } from "@/app/providers/ToastProvider";

/** Mirrors VALID_TRANSITIONS in the status route — only legal moves are offered. */
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["approved", "cancelled"],
  approved: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

const ACTION_STYLE: Record<string, string> = {
  approved: "bg-sky-600 hover:bg-sky-700",
  preparing: "bg-carrot-500 hover:bg-carrot-600",
  ready: "bg-emerald-600 hover:bg-emerald-700",
  completed: "bg-ink-900 hover:bg-ink-800",
  cancelled: "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50",
};

export default function AdminOrdersClient() {
  const params = useSearchParams();
  const toast = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">(
    (params.get("status") as OrderStatus) ?? "all"
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { orders } = await api<{ orders: Order[] }>("/admin/orders", {
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
    const timer = window.setInterval(load, 25000);
    // Fetching from the API and polling it is exactly the external-system
    // subscription effects exist for; state is set from the async result.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => window.clearInterval(timer);
  }, [load]);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setBusyId(order._id);

    try {
      await api(`/admin/orders/${order._id}/status`, {
        method: "PUT",
        auth: true,
        body: { status },
      });

      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? { ...item, status } : item
        )
      );

      toast(`${shortId(order._id)} → ${STATUS_LABEL[status]}`);
    } catch (caught) {
      toast((caught as Error).message, "error");
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      map.set(order.status, (map.get(order.status) ?? 0) + 1);
    }
    return map;
  }, [orders]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? orders
        : orders.filter((order) => order.status === filter),
    [orders, filter]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 rounded-full shimmer" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-3xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header className="animate-rise">
        <h1 className="font-display text-[2rem] font-normal leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.4rem]">
          Orders
        </h1>
        <p className="mt-1.5 text-sm text-ink-400">
          Move each order along as the kitchen works through it.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* filters */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(["all", ...ORDER_STATUSES] as const).map((status) => {
          const selected = filter === status;
          const count =
            status === "all" ? orders.length : (counts.get(status) ?? 0);

          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                selected
                  ? "bg-ink-900 text-white shadow-lg shadow-ink-900/15"
                  : "border border-ink-900/10 bg-white text-ink-600 hover:border-carrot-300 hover:text-carrot-600"
              }`}
            >
              {status === "all" ? "All" : STATUS_LABEL[status]}
              <span
                className={`rounded-full px-1.5 text-[0.65rem] font-bold tabular-nums ${
                  selected ? "bg-white/20" : "bg-ink-100 text-ink-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* list */}
      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white px-8 py-20 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">
            Nothing here
          </p>
          <p className="mt-1.5 text-sm text-ink-400">
            {filter === "all"
              ? "No orders have come through yet."
              : `No ${STATUS_LABEL[filter as OrderStatus].toLowerCase()} orders right now.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((order, index) => {
            const customer =
              order.user && typeof order.user === "object" ? order.user : null;
            const busy = busyId === order._id;
            const open = expanded === order._id;
            const moves = NEXT_STATUS[order.status];

            return (
              <li
                key={order._id}
                className={`animate-rise overflow-hidden rounded-3xl border border-ink-900/[0.07] bg-white transition-opacity ${busy ? "opacity-60" : ""}`}
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-carrot-500 text-xs font-bold text-white">
                    {initials(customer?.name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink-900">
                      {shortId(order._id)}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider ring-1 ring-inset ${STATUS_STYLE[order.status]}`}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-400">
                      {customer?.name ?? "Customer"}
                      {customer?.email ? ` · ${customer.email}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-300">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-xl font-bold tabular-nums text-ink-900">
                      {formatPrice(order.total)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : order._id)}
                      className="mt-0.5 text-xs font-medium text-carrot-600 transition-colors hover:text-carrot-700"
                    >
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "dish" : "dishes"}
                      {open ? " ▴" : " ▾"}
                    </button>
                  </div>

                  {/* actions */}
                  {moves.length > 0 && (
                    <div className="flex w-full flex-wrap gap-2 border-t border-ink-100 pt-4 sm:w-auto sm:border-0 sm:pt-0">
                      {moves.map((next) => (
                        <button
                          key={next}
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus(order, next)}
                          className={`rounded-full px-4 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${ACTION_STYLE[next]}`}
                        >
                          {next === "cancelled"
                            ? "Cancel"
                            : `Mark ${STATUS_LABEL[next].toLowerCase()}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* items */}
                {open && (
                  <div className="animate-fade border-t border-ink-100 bg-cream/50 px-5 py-4 sm:px-6">
                    <ul className="space-y-2">
                      {order.items.map((item, itemIndex) => (
                        <li
                          key={`${order._id}-${itemIndex}`}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-white text-[0.65rem] font-bold text-carrot-600">
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
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
