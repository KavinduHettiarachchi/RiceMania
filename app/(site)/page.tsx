import Link from "next/link";

import DishArt from "@/app/components/DishArt";
import FoodCard from "@/app/components/FoodCard";
import Hero from "@/app/components/Hero";
import Reveal from "@/app/components/Reveal";
import SectionHeading from "@/app/components/SectionHeading";
import { getCategoriesWithCounts, getFoods } from "@/app/lib/data";

// Dishes and prices are read from Mongo per request — a prerendered
// homepage would serve whatever the menu looked like at build time.
export const dynamic = "force-dynamic";

const MARQUEE = [
  "Clay-pot rice",
  "Slow curries",
  "Street kottu",
  "Wood-fire biryani",
  "Ceylon spice",
  "Cooked to order",
];

const STEPS = [
  {
    title: "Pick your plate",
    body: "Browse the day's kitchen — the menu updates live, so what you see is what's cooking.",
  },
  {
    title: "We cook it fresh",
    body: "Nothing sits under a lamp. Your order goes to the pass the moment it lands and is fired to order.",
  },
  {
    title: "Track it out the door",
    body: "Watch it move from approved to preparing to ready, right from your orders page.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The lamprais tastes like the one my grandmother wrapped. I have not said that about a delivery order before.",
    name: "Anjali Perera",
    role: "Colombo 05",
  },
  {
    quote:
      "We order for the whole office every Friday. Forty plates, still hot, still on time. That is the whole review.",
    name: "Ruwan Jayasuriya",
    role: "Office manager",
  },
  {
    quote:
      "Kottu at 9pm that actually tastes like the street stall down the road. The chilli level is honest.",
    name: "Nadeesha Silva",
    role: "Regular since 2021",
  },
];

export default async function HomePage() {
  const [foods, categories] = await Promise.all([
    getFoods({ limit: 8, availableOnly: true }),
    getCategoriesWithCounts(),
  ]);

  return (
    <>
      <Hero />

      {/* marquee strip */}
      <section className="mt-16 overflow-hidden border-y border-ink-900/[0.06] bg-ink-950 py-4 sm:mt-24">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex items-center gap-10 pr-10"
              aria-hidden={copy === 1}
            >
              {MARQUEE.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-10 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-white/70"
                >
                  {item}
                  <span className="size-1.5 rounded-full bg-carrot-500" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Browse the kitchen"
              title={
                <>
                  What are you in the
                  <br className="hidden sm:block" /> mood for today?
                </>
              }
              action={{ href: "/menu", label: "See all" }}
            />
          </Reveal>

          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category, index) => (
              <Reveal as="li" key={category._id} delay={index * 70}>
                <Link
                  href={`/menu?category=${category._id}`}
                  className="group flex h-full flex-col items-center gap-4 rounded-3xl border border-ink-900/[0.06] bg-white p-6 text-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-carrot-200 hover:shadow-xl hover:shadow-ink-900/[0.07]"
                >
                  <DishArt
                    name={category.name}
                    className="size-24 rounded-full ring-1 ring-ink-900/[0.05] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink-900 transition-colors group-hover:text-carrot-600">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-400">
                      {category.count} {category.count === 1 ? "dish" : "dishes"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* popular dishes */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="From our kitchen"
              title={
                <>
                  Dishes people come
                  <br className="hidden sm:block" /> back for.
                </>
              }
              action={{ href: "/menu", label: "Full menu" }}
            />
          </Reveal>

          {foods.length > 0 ? (
            <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {foods.map((food, index) => (
                <Reveal as="li" key={food._id} delay={(index % 4) * 90}>
                  <FoodCard food={food} priority={index < 4} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <Reveal>
              <div className="mt-12 rounded-3xl border border-dashed border-ink-200 bg-cream/60 px-8 py-20 text-center">
                <DishArt
                  name="empty kitchen"
                  className="mx-auto size-28 rounded-full"
                />
                <h3 className="mt-6 font-display text-xl font-semibold text-ink-900">
                  The menu is being written
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">
                  Dishes added from the admin panel appear here straight away.
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* story split */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-linear-to-br from-carrot-100 to-lime-glow sm:rounded-[2.5rem]">
              <div className="animate-float-slow absolute inset-8 grid place-items-center">
                <DishArt
                  name="Ricemania clay pot kitchen"
                  steam
                  className="size-full rounded-full bg-transparent!"
                />
              </div>
            </div>

            {/* floating credential card */}
            <div className="absolute -bottom-6 -right-2 w-48 rounded-2xl bg-white p-5 shadow-xl shadow-ink-900/10 sm:right-6">
              <p className="font-display text-3xl font-bold text-carrot-600">
                12<span className="text-lg">yrs</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-400">
                Cooking Ceylon rice on Galle Road
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <SectionHeading
              eyebrow="Our story"
              title={
                <>
                  A kitchen that never
                  <br className="hidden sm:block" /> learned shortcuts.
                </>
              }
              description="Ricemania started as a six-table room off Galle Road with one clay pot and a rice supplier from Polonnaruwa. We still use both. Curries are ground fresh each morning, rice is steamed in batches through the day, and nothing goes out that we would not eat ourselves."
            />

            <ul className="mt-9 space-y-5">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-carrot-50 font-display text-sm font-bold text-carrot-600">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-500"
            >
              Read our story
            </Link>
          </Reveal>
        </div>
      </section>

      {/* testimonials */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Guest book"
              title="Told to us over the counter."
              align="center"
            />
          </Reveal>

          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item, index) => (
              <Reveal as="li" key={item.name} delay={index * 110}>
                <figure className="flex h-full flex-col rounded-3xl border border-ink-900/[0.06] bg-cream/70 p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-carrot-200 hover:shadow-xl hover:shadow-ink-900/[0.06]">
                  <span className="flex gap-0.5 text-carrot-500">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} viewBox="0 0 12 12" className="size-3.5" aria-hidden>
                        <path
                          d="m6 1 1.5 3.2 3.5.4-2.6 2.4.7 3.4L6 8.7 2.9 10.4l.7-3.4L1 4.6l3.5-.4z"
                          fill="currentColor"
                        />
                      </svg>
                    ))}
                  </span>

                  <blockquote className="mt-5 flex-1 font-display text-[1.05rem] leading-relaxed text-ink-800">
                    “{item.quote}”
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-900/[0.07] pt-5">
                    <span className="grid size-10 place-items-center rounded-full bg-carrot-500 text-xs font-bold text-white">
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">
                        {item.name}
                      </span>
                      <span className="block text-xs text-ink-400">
                        {item.role}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* closing CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-16 text-center sm:rounded-[2.5rem] sm:px-12 sm:py-24">
          <div
            aria-hidden
            className="animate-float-slow absolute -left-20 -top-20 size-72 rounded-full bg-carrot-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="animate-float absolute -bottom-24 -right-16 size-80 rounded-full bg-carrot-600/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-carrot-400">
              Hungry yet?
            </p>
            <h2 className="text-balance mt-5 font-display text-[2.2rem] font-normal leading-[1.08] tracking-[-0.02em] text-white sm:text-[3.2rem]">
              Rice is on. Curry is
              <span className="italic text-carrot-400"> ready.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/50">
              Order before 9.30pm for same-evening delivery across Colombo.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/menu"
                className="rounded-full bg-carrot-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-400"
              >
                Start an order
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/15 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5"
              >
                Book a table
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
