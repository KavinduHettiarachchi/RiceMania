import type { Metadata } from "next";

import { getCategories, getFoods } from "@/app/lib/data";
import MenuBrowser from "./MenuBrowser";

// What's on and what it costs changes through the day — read it per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Rice and curry, kottu, biryani and short eats — the full Ricemania menu, updated live from the kitchen.",
};

export default async function MenuPage() {
  const [foods, categories] = await Promise.all([
    getFoods(),
    getCategories(),
  ]);

  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-900/[0.06] bg-linear-to-b from-lime-glow/60 to-cream px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-carrot-200/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <p className="animate-rise flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-carrot-600">
            <span className="h-px w-8 bg-carrot-400" />
            Today at Ricemania
          </p>

          <h1 className="animate-rise delay-1 mt-4 max-w-2xl font-display text-[2.4rem] font-normal leading-[1.06] tracking-[-0.02em] text-ink-900 sm:text-[3.4rem]">
            Everything the kitchen
            <span className="italic text-carrot-600"> is cooking.</span>
          </h1>

          <p className="animate-rise delay-2 mt-5 max-w-lg text-[0.95rem] leading-relaxed text-ink-500">
            Everything here comes straight from the pass. When a dish comes off
            for the day, it says so here first.
          </p>
        </div>
      </header>

      <MenuBrowser foods={foods} categories={categories} />
    </>
  );
}
