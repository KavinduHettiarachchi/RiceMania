import Link from "next/link";

import DishArt from "./components/DishArt";
import Logo from "./components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <div className="px-5 py-8 sm:px-10">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
        <div className="animate-float relative size-44">
          <DishArt
            name="empty plate four zero four"
            className="size-full rounded-full bg-transparent!"
          />
        </div>

        <p className="animate-rise mt-4 font-display text-6xl font-bold text-carrot-500">
          404
        </p>

        <h1 className="animate-rise delay-1 mt-3 font-display text-3xl font-normal tracking-[-0.02em] text-ink-900">
          This plate came back empty.
        </h1>

        <p className="animate-rise delay-2 mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
          The page you were after isn&apos;t on the menu. Let&apos;s get you
          back to the food.
        </p>

        <div className="animate-rise delay-3 mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/menu"
            className="rounded-full bg-carrot-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600"
          >
            Browse the menu
          </Link>
          <Link
            href="/"
            className="rounded-full border border-ink-900/15 bg-white px-7 py-3.5 text-sm font-semibold text-ink-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-900/30"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
