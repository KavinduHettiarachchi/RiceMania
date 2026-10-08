"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import FoodImage from "@/app/components/FoodImage";
import { api } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/format";
import type { Order } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCart } from "@/app/providers/CartProvider";
import { useToast } from "@/app/providers/ToastProvider";

export default function CheckoutClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, loading: cartLoading, clearLocal } = useCart();
  const toast = useToast();

  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/checkout");
  }, [user, authLoading, router]);

  const placeOrder = async () => {
    setPlacing(true);

    try {
      const { order } = await api<{ order: Order }>("/orders", {
        method: "POST",
        auth: true,
      });

      clearLocal();
      toast("Order sent to the kitchen");
      router.push(`/orders?placed=${order._id}`);
    } catch (error) {
      toast((error as Error).message, "error");
      setPlacing(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <div className="h-8 w-48 rounded-full shimmer" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-64 rounded-3xl shimmer" />
          <div className="h-56 rounded-3xl shimmer" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center sm:py-32">
        <div className="grid size-20 place-items-center rounded-full bg-carrot-50 text-carrot-400">
          <svg viewBox="0 0 24 24" className="size-9" aria-hidden>
            <path
              d="M3 5h2.3l1.9 10.3a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 9H6.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-7 font-display text-3xl font-normal tracking-[-0.02em] text-ink-900">
          Your order is empty
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          Add a dish or two from the menu and we&apos;ll get the pot on.
        </p>

        <Link
          href="/menu"
          className="mt-8 rounded-full bg-carrot-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="animate-rise">
        <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-carrot-600">
          <span className="h-px w-8 bg-carrot-400" />
          Almost there
        </p>
        <h1 className="mt-4 font-display text-[2.2rem] font-normal leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.8rem]">
          Check your order.
        </h1>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        {/* items */}
        <div className="animate-rise delay-1 overflow-hidden rounded-3xl border border-ink-900/[0.07] bg-white">
          <h2 className="border-b border-ink-100 px-6 py-4 text-sm font-semibold text-ink-900">
            {items.length} {items.length === 1 ? "dish" : "dishes"} from the
            kitchen
          </h2>

          <ul className="divide-y divide-ink-100">
            {items.map((item) => (
              <li key={item._id} className="flex gap-4 px-6 py-4">
                <FoodImage
                  src={item.food?.image}
                  name={item.food?.name ?? "Dish"}
                  sizes="72px"
                  className="size-[4.5rem] shrink-0 overflow-hidden rounded-2xl"
                />

                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-sm font-semibold text-ink-900">
                    {item.food?.name ?? "Unavailable dish"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatPrice(item.food?.price)} × {item.quantity}
                  </p>
                </div>

                <span className="self-center text-sm font-bold tabular-nums text-ink-900">
                  {formatPrice((item.food?.price ?? 0) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-ink-100 px-6 py-5">
            <label
              htmlFor="order-note"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
            >
              Note for the kitchen{" "}
              <span className="font-normal normal-case tracking-normal text-ink-300">
                (optional)
              </span>
            </label>
            <textarea
              id="order-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Less chilli, extra papadam, ring on arrival…"
              className="mt-2 w-full resize-none rounded-2xl border border-ink-200 px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
            />
          </div>
        </div>

        {/* summary */}
        <aside className="animate-rise delay-2 rounded-3xl border border-ink-900/[0.07] bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Order summary
          </h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-ink-500">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-500">
              <dt>Delivery</dt>
              <dd className="font-medium text-emerald-600">Free</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-4">
              <dt className="font-semibold text-ink-900">Total</dt>
              <dd className="font-display text-2xl font-bold tabular-nums text-ink-900">
                {formatPrice(subtotal)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-2xl bg-cream px-4 py-3.5">
            <p className="text-xs font-semibold text-ink-800">
              Cash on delivery
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">
              Pay the rider when your food arrives. Card payments are coming
              soon.
            </p>
          </div>

          <button
            type="button"
            onClick={placeOrder}
            disabled={placing}
            className="group relative mt-6 w-full overflow-hidden rounded-full bg-carrot-500 py-4 text-sm font-semibold text-white shadow-xl shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              {placing && (
                <svg viewBox="0 0 16 16" className="size-4 animate-spin" aria-hidden>
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.35"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 2a6 6 0 0 1 6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {placing ? "Sending to the kitchen" : "Place order"}
            </span>
          </button>

          <Link
            href="/menu"
            className="mt-3 block text-center text-xs font-medium text-ink-400 transition-colors hover:text-carrot-600"
          >
            Add something else
          </Link>
        </aside>
      </div>
    </div>
  );
}
