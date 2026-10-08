"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatPrice } from "@/app/lib/format";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCart } from "@/app/providers/CartProvider";
import { useToast } from "@/app/providers/ToastProvider";
import FoodImage from "./FoodImage";

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, updateQuantity, remove } =
    useCart();
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Cooked to order, so the only ceiling is a sanity cap on a slip of the finger.
  const MAX_PER_ITEM = 20;

  const change = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    if (quantity > MAX_PER_ITEM) {
      toast(`That's the most we'll cook in one go — call us for a big order`, "info");
      return;
    }

    setBusyId(itemId);
    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const drop = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await remove(itemId);
      toast("Removed from your order");
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const checkout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* scrim */}
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-[70] bg-ink-950/40 backdrop-blur-[2px] transition-opacity duration-400 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label="Your order"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-[min(100vw,27rem)] flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Your order
            </h2>
            <p className="mt-0.5 text-xs text-ink-400">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid size-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path
                d="m4 4 8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {!user ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-carrot-50 text-carrot-500">
              <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
                <path
                  d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v9H5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-ink-500">
              Sign in to start an order and keep your cart between visits.
            </p>
            <Link
              href="/login"
              onClick={closeCart}
              className="rounded-full bg-carrot-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-carrot-600"
            >
              Sign in
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-ink-50 text-ink-300">
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
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">
                Nothing here yet
              </p>
              <p className="mt-1 text-sm text-ink-400">
                Pick something warm from the menu.
              </p>
            </div>
            <Link
              href="/menu"
              onClick={closeCart}
              className="rounded-full bg-carrot-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-carrot-600"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => {
                const food = item.food;
                const busy = busyId === item._id;

                return (
                  <li
                    key={item._id}
                    className={`group flex gap-3 rounded-2xl border border-ink-100 p-3 transition-opacity ${busy ? "opacity-50" : ""}`}
                  >
                    <FoodImage
                      src={food?.image}
                      name={food?.name ?? "Dish"}
                      sizes="80px"
                      className="size-20 shrink-0 overflow-hidden rounded-xl"
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {food?.name ?? "Unavailable dish"}
                        </p>
                        <button
                          type="button"
                          onClick={() => drop(item._id)}
                          disabled={busy}
                          aria-label="Remove item"
                          className="shrink-0 text-ink-300 transition-colors hover:text-rose-500"
                        >
                          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                            <path
                              d="m4 4 8 8M12 4l-8 8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>

                      <p className="mt-0.5 text-xs text-ink-400">
                        {formatPrice(food?.price)} each
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-full border border-ink-200 p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              change(item._id, item.quantity - 1)
                            }
                            disabled={busy || item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="grid size-7 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-30"
                          >
                            <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                              <path
                                d="M2.5 6h7"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>

                          <span className="w-6 text-center text-sm font-semibold tabular-nums text-ink-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              change(item._id, item.quantity + 1)
                            }
                            disabled={busy}
                            aria-label="Increase quantity"
                            className="grid size-7 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-30"
                          >
                            <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                              <path
                                d="M6 2.5v7M2.5 6h7"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>

                        <span className="text-sm font-bold text-ink-900">
                          {formatPrice((food?.price ?? 0) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-ink-100 bg-cream/60 px-6 py-5">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-500">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-ink-500">
                  <dt>Delivery</dt>
                  <dd className="font-medium text-emerald-600">Free</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-ink-200 pt-3 text-base">
                  <dt className="font-semibold text-ink-900">Total</dt>
                  <dd className="font-display text-xl font-bold tabular-nums text-ink-900">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={checkout}
                className="mt-5 w-full rounded-full bg-carrot-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600 hover:shadow-xl"
              >
                Checkout · {formatPrice(subtotal)}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
