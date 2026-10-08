"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import DishArt from "./DishArt";

const STATS = [
  { value: 250, suffix: "+", label: "Food items" },
  { value: 75, suffix: "+", label: "Team members" },
  { value: 15, suffix: "k+", label: "Happy customers" },
];

/** Counts up to `value` once mounted — the hero numbers tick in on load. */
function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const duration = reduced ? 0 : 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      // easeOutExpo — fast then settles
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(value * eased));

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className="font-display text-3xl font-semibold tabular-nums text-ink-900 sm:text-[2.1rem]">
      {display}
      {suffix}
    </span>
  );
}

const SOCIALS = ["Instagram", "WhatsApp", "Facebook"];

export default function Hero() {
  return (
    <section className="relative px-4 pt-4 sm:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-linear-to-br from-lime-glow via-[#f3f8cf] to-[#fdfbe9] px-6 py-14 sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        {/* soft ambient blobs */}
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-carrot-200/30 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute -bottom-32 left-1/4 size-72 rounded-full bg-carrot-300/20 blur-3xl"
        />

        {/* social rail — right edge, as in the reference */}
        <ul
          aria-hidden
          className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-8 xl:flex"
        >
          {SOCIALS.map((item) => (
            <li key={item}>
              <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-ink-400 [writing-mode:vertical-rl]">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* copy */}
          <div className="relative z-10">
            <p className="animate-rise flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink-500">
              <span className="h-px w-10 bg-ink-400" />
              Welcome to our restaurant
            </p>

            <h1 className="animate-rise delay-1 mt-5 font-display text-[2.75rem] font-normal leading-[1.04] tracking-[-0.02em] text-ink-900 sm:text-6xl lg:text-[4.2rem]">
              Enjoy healthy and
              <br />
              delicious <span className="italic text-carrot-600">food.</span>
            </h1>

            <p className="animate-rise delay-2 mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink-500">
              Ceylon rice steamed in clay pots, curries simmered since dawn and
              kottu chopped to order — served the way Colombo has always eaten.
            </p>

            <div className="animate-rise delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/menu"
                className="group relative overflow-hidden rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-ink-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <span className="relative z-10">Order now</span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-carrot-500 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
              </Link>

              <Link
                href="/contact"
                className="rounded-full border border-ink-900/15 bg-white/70 px-7 py-3.5 text-sm font-semibold text-ink-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-900/30 hover:bg-white"
              >
                Reservation
              </Link>
            </div>

            {/* opening hours */}
            <div className="animate-rise delay-4 mt-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink-400">
                We are open from
              </p>
              <p className="mt-2.5 text-sm text-ink-600">
                <span className="font-semibold text-ink-900">Mon–Sat</span>:
                09.00am–10.00pm
              </p>
              <p className="text-sm text-ink-600">
                <span className="font-semibold text-ink-900">Sunday</span>:
                04.00pm–10.00pm
              </p>
            </div>

            {/* stats */}
            <dl className="animate-rise delay-5 mt-9 flex flex-wrap gap-x-12 gap-y-5">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <CountUp value={stat.value} suffix={stat.suffix} />
                    <span className="mt-1 block text-xs text-ink-400">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* hero dish */}
          <div className="relative">
            {/* rating card */}
            <div className="animate-rise delay-3 absolute -top-2 right-0 z-20 flex flex-col items-center rounded-2xl bg-white/80 px-5 py-4 shadow-xl shadow-ink-900/[0.07] backdrop-blur-md sm:right-4">
              <div className="flex -space-x-2.5">
                {["#f9a825", "#ef6c00", "#8d6e63"].map((color, i) => (
                  <span
                    key={color}
                    className="grid size-9 place-items-center rounded-full text-[0.6rem] font-bold text-white ring-[3px] ring-white"
                    style={{ background: color }}
                  >
                    {["A", "N", "K"][i]}
                  </span>
                ))}
              </div>
              <p className="mt-2.5 text-xs font-semibold text-ink-800">
                50k+ Happy customer
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                <span className="font-bold text-ink-900">4.5</span>
                <span className="flex gap-0.5 text-carrot-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} viewBox="0 0 12 12" className="size-3" aria-hidden>
                      <path
                        d="m6 1 1.5 3.2 3.5.4-2.6 2.4.7 3.4L6 8.7 2.9 10.4l.7-3.4L1 4.6l3.5-.4z"
                        fill="currentColor"
                      />
                    </svg>
                  ))}
                </span>
              </p>
            </div>

            {/* plate */}
            <div className="animate-scale-in delay-2 relative mx-auto aspect-square w-full max-w-[30rem]">
              <div
                aria-hidden
                className="animate-spin-slow absolute inset-[8%] rounded-full border border-dashed border-carrot-400/30"
              />
              <div className="animate-float relative size-full">
                <DishArt
                  name="Ricemania signature rice and curry"
                  steam
                  className="size-full rounded-full bg-transparent!"
                />
              </div>

              {/* floating ingredient chips */}
              <span
                aria-hidden
                className="animate-float absolute left-[2%] top-[22%] size-11 rounded-full bg-[#7ba05b]/85 shadow-lg"
                style={{ animationDelay: "0.8s" }}
              />
              <span
                aria-hidden
                className="animate-float absolute right-[6%] top-[12%] size-8 rounded-full bg-carrot-400/80 shadow-lg"
                style={{ animationDelay: "1.6s" }}
              />
              <span
                aria-hidden
                className="animate-float absolute bottom-[16%] left-[10%] size-7 rounded-full bg-carrot-600/70 shadow-lg"
                style={{ animationDelay: "2.4s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
