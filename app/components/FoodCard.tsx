"use client";

import Link from "next/link";
import { useState } from "react";

import { formatPrice } from "@/app/lib/format";
import { categoryName, type Food } from "@/app/lib/types";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCart } from "@/app/providers/CartProvider";
import { useToast } from "@/app/providers/ToastProvider";
import FoodImage from "./FoodImage";

interface FoodCardProps {
  food: Food;
  priority?: boolean;
}

export default function FoodCard({ food, priority = false }: FoodCardProps) {
  const { user, isAdmin } = useAuth();
  const { add, openCart } = useCart();
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  const soldOut = !food.available;

  const handleAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast("Sign in to start your order", "info");
      return;
    }

    setAdding(true);
    try {
      await add(food._id, 1);
      toast(`${food.name} added to your order`);
      openCart();
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/menu/${food._id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-ink-900/[0.06] bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-carrot-200 hover:shadow-2xl hover:shadow-ink-900/[0.08]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-carrot-50">
        <FoodImage
          src={food.image}
          name={food.name}
          priority={priority}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
          className="size-full"
        />

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-ink-600 backdrop-blur-sm">
          {categoryName(food.category)}
        </span>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ink-900">
              Off the menu today
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover:text-carrot-600">
          {food.name}
        </h3>

        {food.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-400">
            {food.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-display text-xl font-bold text-ink-900">
            {formatPrice(food.price)}
          </span>

          {!isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut || adding}
              aria-label={`Add ${food.name} to order`}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-900 text-white transition-all duration-300 hover:scale-110 hover:bg-carrot-500 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:hover:scale-100"
            >
              {adding ? (
                <svg viewBox="0 0 16 16" className="size-4 animate-spin" aria-hidden>
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.25"
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
              ) : (
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                  <path
                    d="M8 3.5v9M3.5 8h9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
