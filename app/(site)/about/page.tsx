import type { Metadata } from "next";
import Link from "next/link";

import DishArt from "@/app/components/DishArt";
import Reveal from "@/app/components/Reveal";
import SectionHeading from "@/app/components/SectionHeading";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Ricemania has cooked Ceylon rice and clay-pot curry on Galle Road since 2013. Here's how we do it.",
};

const TIMELINE = [
  {
    year: "2013",
    title: "Six tables and one clay pot",
    body: "We opened in a narrow room off Galle Road with a rice supplier from Polonnaruwa and a menu written on a chalkboard.",
  },
  {
    year: "2016",
    title: "The kottu plate arrives",
    body: "A second cook joined and brought the griddle with him. The clatter has not stopped since.",
  },
  {
    year: "2019",
    title: "Colombo delivery",
    body: "We started sending food out. The rule was simple — if it wouldn't leave the kitchen hot, it didn't leave.",
  },
  {
    year: "Today",
    title: "Same pot, more plates",
    body: "Fifteen thousand regulars later, the curries are still ground each morning by hand.",
  },
];

const VALUES = [
  {
    title: "Ground fresh, daily",
    body: "Spice blends are roasted and ground each morning. No paste from a jar, no shortcuts before service.",
  },
  {
    title: "Cooked to order",
    body: "Nothing waits under a heat lamp. Your order goes to the pass the moment it lands.",
  },
  {
    title: "Priced honestly",
    body: "What you see on the menu is what you pay. No service surprises at the door.",
  },
  {
    title: "Rice we can name",
    body: "Every sack comes from growers we buy from directly, season after season.",
  },
];

export default function AboutPage() {
  return (
    <>
      <header className="relative overflow-hidden border-b border-ink-900/[0.06] bg-linear-to-b from-lime-glow/60 to-cream px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-carrot-200/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="animate-rise flex items-center justify-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-carrot-600">
            <span className="h-px w-8 bg-carrot-400" />
            Since 2013
            <span className="h-px w-8 bg-carrot-400" />
          </p>

          <h1 className="animate-rise delay-1 text-balance mt-5 font-display text-[2.5rem] font-normal leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-[3.6rem]">
            A kitchen that never learned
            <span className="italic text-carrot-600"> shortcuts.</span>
          </h1>

          <p className="animate-rise delay-2 mx-auto mt-6 max-w-xl text-[0.98rem] leading-relaxed text-ink-500">
            Ricemania started as a six-table room with one clay pot. The room is
            bigger now. The pot, the supplier and the method are exactly the
            same.
          </p>
        </div>
      </header>

      {/* timeline */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="How we got here"
            title="Twelve years, one method."
            align="center"
          />
        </Reveal>

        <ol className="mt-14 space-y-8">
          {TIMELINE.map((entry, index) => (
            <Reveal as="li" key={entry.year} delay={index * 90}>
              <div className="flex gap-6 sm:gap-10">
                <div className="flex flex-col items-center">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-carrot-500 font-display text-sm font-bold text-white shadow-lg shadow-carrot-500/25">
                    {entry.year}
                  </span>
                  {index < TIMELINE.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-linear-to-b from-carrot-300 to-transparent" />
                  )}
                </div>

                <div className="pb-4 pt-2">
                  <h3 className="font-display text-xl font-semibold text-ink-900">
                    {entry.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-500">
                    {entry.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* values */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-linear-to-br from-carrot-100 via-cream to-lime-glow sm:rounded-[2.5rem]">
                <div className="animate-float absolute inset-10">
                  <DishArt
                    name="Ricemania kitchen values plate"
                    steam
                    className="size-full rounded-full bg-transparent!"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <SectionHeading
                eyebrow="What we hold to"
                title="Four rules we don't bend."
              />

              <ul className="mt-9 grid gap-5 sm:grid-cols-2">
                {VALUES.map((value) => (
                  <li
                    key={value.title}
                    className="rounded-2xl border border-ink-900/[0.07] bg-cream/60 p-5 transition-all duration-400 hover:-translate-y-1 hover:border-carrot-200 hover:shadow-lg"
                  >
                    <h3 className="text-sm font-semibold text-ink-900">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">
                      {value.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <Reveal>
          <h2 className="text-balance font-display text-[2rem] font-normal leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.6rem]">
            Come and eat with us.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-500">
            The pot goes on at nine. Book a table or send an order across
            Colombo.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-ink-900 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-500"
            >
              See the menu
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-ink-900/15 bg-white px-8 py-4 text-sm font-semibold text-ink-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-900/30"
            >
              Book a table
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
