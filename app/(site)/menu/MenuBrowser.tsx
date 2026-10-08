"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import DishArt from "@/app/components/DishArt";
import FoodCard from "@/app/components/FoodCard";
import Reveal from "@/app/components/Reveal";
import { categoryId, type Category, type Food } from "@/app/lib/types";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "A–Z" },
];

function Browser({
  foods,
  categories,
}: {
  foods: Food[];
  categories: Category[];
}) {
  const params = useSearchParams();
  const [active, setActive] = useState<string>(params.get("category") ?? "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [availableOnly, setAvailableOnly] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = foods.filter((food) => {
      if (active !== "all" && categoryId(food.category) !== active) return false;
      if (availableOnly && !food.available) return false;

      if (needle) {
        const haystack = `${food.name} ${food.description}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }

      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Dishes on the menu today first — matches the kitchen's own order.
        sorted.sort((a, b) => {
          const aOff = a.available ? 0 : 1;
          const bOff = b.available ? 0 : 1;
          return aOff - bOff;
        });
    }

    return sorted;
  }, [foods, active, query, sort, availableOnly]);

  const tabs = [{ _id: "all", name: "Everything" }, ...categories];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      {/* controls */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* category tabs */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const selected = active === tab._id;
            return (
              <button
                key={tab._id}
                type="button"
                onClick={() => setActive(tab._id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  selected
                    ? "bg-ink-900 text-white shadow-lg shadow-ink-900/15"
                    : "border border-ink-900/10 bg-white text-ink-600 hover:border-carrot-300 hover:text-carrot-600"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-300"
              aria-hidden
            >
              <circle
                cx="7"
                cy="7"
                r="4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m10.5 10.5 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dishes"
              aria-label="Search dishes"
              className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10 sm:w-56"
            />
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sort dishes"
            className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none transition-colors focus:border-carrot-400"
          >
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="flex shrink-0 cursor-pointer items-center gap-2.5 text-sm text-ink-600">
            <span className="relative inline-flex">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => setAvailableOnly(event.target.checked)}
                className="peer sr-only"
              />
              <span className="block h-6 w-10 rounded-full bg-ink-200 transition-colors duration-300 peer-checked:bg-carrot-500" />
              <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-4" />
            </span>
            On the menu today
          </label>
        </div>
      </div>

      {/* count */}
      <p className="mt-6 text-sm text-ink-400">
        {visible.length} {visible.length === 1 ? "dish" : "dishes"}
        {active !== "all" &&
          ` in ${categories.find((c) => c._id === active)?.name ?? ""}`}
      </p>

      {/* grid */}
      {visible.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((food, index) => (
            <Reveal as="li" key={food._id} delay={(index % 4) * 80}>
              <FoodCard food={food} priority={index < 4} />
            </Reveal>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-ink-200 bg-white px-8 py-20 text-center">
          <DishArt name="nothing found" className="mx-auto size-28 rounded-full" />
          <h2 className="mt-6 font-display text-xl font-semibold text-ink-900">
            {foods.length === 0
              ? "The menu is being written"
              : "Nothing matches that"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">
            {foods.length === 0
              ? "Dishes added from the admin panel show up here immediately."
              : "Try a different category, or clear the search."}
          </p>

          {foods.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActive("all");
                setQuery("");
                setAvailableOnly(false);
              }}
              className="mt-6 rounded-full bg-carrot-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-carrot-600"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MenuBrowser(props: {
  foods: Food[];
  categories: Category[];
}) {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <Browser {...props} />
    </Suspense>
  );
}
