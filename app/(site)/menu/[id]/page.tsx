import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import FoodCard from "@/app/components/FoodCard";
import Reveal from "@/app/components/Reveal";
import { getFood, getRelatedFoods } from "@/app/lib/data";
import { categoryId, categoryName } from "@/app/lib/types";
import AddToOrder from "./AddToOrder";
import FoodHeroImage from "./FoodHeroImage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const food = await getFood(id);

  if (!food) return { title: "Dish not found" };

  return {
    title: food.name,
    description:
      food.description ||
      `${food.name} — freshly cooked at Ricemania, Colombo.`,
  };
}

export default async function FoodDetailPage({ params }: PageProps) {
  const { id } = await params;
  const food = await getFood(id);

  if (!food) notFound();

  const related = await getRelatedFoods(categoryId(food.category), food._id);
  const soldOut = !food.available;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-400">
        <Link href="/" className="transition-colors hover:text-carrot-600">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/menu" className="transition-colors hover:text-carrot-600">
          Menu
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-ink-700">{food.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* image */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <FoodHeroImage src={food.image} name={food.name} />
        </Reveal>

        {/* details */}
        <Reveal delay={100} className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-carrot-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-carrot-700">
              {categoryName(food.category)}
            </span>

            {soldOut ? (
              <span className="rounded-full bg-ink-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500">
                Off the menu today
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Cooking now
              </span>
            )}
          </div>

          <h1 className="mt-5 font-display text-[2.2rem] font-normal leading-[1.08] tracking-[-0.02em] text-ink-900 sm:text-[2.9rem]">
            {food.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-carrot-600">
              {new Intl.NumberFormat("en-LK", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(food.price)}
            </span>
            <span className="text-sm text-ink-400">LKR per portion</span>
          </div>

          {food.description && (
            <p className="mt-6 text-[0.98rem] leading-relaxed text-ink-600">
              {food.description}
            </p>
          )}

          <AddToOrder food={food} />

          {/* kitchen notes */}
          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-ink-900/[0.07] bg-ink-100 sm:grid-cols-3">
            {[
              { term: "Prepared", detail: "Cooked to order" },
              { term: "Ready in", detail: "20–30 minutes" },
              { term: "Delivery", detail: "Free in Colombo" },
            ].map((item) => (
              <div key={item.term} className="bg-white px-5 py-4">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                  {item.term}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink-900">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-ink-900/[0.07] pt-14 sm:mt-28">
          <Reveal>
            <h2 className="font-display text-[1.8rem] font-normal tracking-[-0.02em] text-ink-900 sm:text-[2.2rem]">
              Goes well with this
            </h2>
          </Reveal>

          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal as="li" key={item._id} delay={index * 80}>
                <FoodCard food={item} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
