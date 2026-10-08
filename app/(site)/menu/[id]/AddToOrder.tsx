"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatPrice } from "@/app/lib/format";
import type { Food } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCart } from "@/app/providers/CartProvider";
import { useToast } from "@/app/providers/ToastProvider";

export default function AddToOrder({ food }: { food: Food }) {
  const { user, isAdmin } = useAuth();
  const { add, openCart } = useCart();
  const toast = useToast();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const soldOut = !food.available;
  // No inventory to draw down — cap the stepper so a slip of the finger
  // can't send a 200-plate order to the kitchen.
  const max = 20;

  // Admins manage the menu rather than order from it.
  if (isAdmin) {
    return (
      <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50 px-5 py-4">
        <p className="text-sm text-ink-600">
          You&apos;re signed in as an admin.{" "}
          <button
            type="button"
            onClick={() => router.push(`/admin/foods?edit=${food._id}`)}
            className="font-semibold text-carrot-600 underline-offset-2 hover:underline"
          >
            Edit this dish
          </button>
        </p>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!user) {
      toast("Sign in to start your order", "info");
      router.push(`/login?next=/menu/${food._id}`);
      return;
    }

    setAdding(true);
    try {
      await add(food._id, quantity);
      toast(
        `${quantity} × ${food.name} added to your order`
      );
      openCart();
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mt-8">
      {!soldOut && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 rounded-full border border-ink-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="grid size-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-30"
            >
              <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden>
                <path
                  d="M3 7h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <span className="w-9 text-center font-display text-lg font-bold tabular-nums text-ink-900">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              disabled={quantity >= max}
              aria-label="Increase quantity"
              className="grid size-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-30"
            >
              <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden>
                <path
                  d="M7 3v8M3 7h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <span className="text-sm text-ink-400">
            Cooked fresh to order
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut || adding}
        className="group relative mt-5 w-full overflow-hidden rounded-full bg-ink-900 py-4 text-sm font-semibold text-white shadow-xl shadow-ink-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto sm:px-12"
      >
        <span className="relative z-10 flex items-center justify-center gap-2.5">
          {adding && (
            <svg viewBox="0 0 16 16" className="size-4 animate-spin" aria-hidden>
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.3"
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
          {soldOut
            ? "Off the menu today"
            : adding
              ? "Adding"
              : `Add to order · ${formatPrice(food.price * quantity)}`}
        </span>
        <span className="absolute inset-0 origin-left scale-x-0 bg-carrot-500 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-disabled:scale-x-0" />
      </button>
    </div>
  );
}
