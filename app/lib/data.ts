import "server-only";

import { connectDB } from "./mongodb";
import CategoryModel from "@/app/models/Category";
import FoodModel from "@/app/models/Food";
import type { Category, Food } from "./types";

/**
 * Read helpers for Server Components. These hit Mongo directly rather than
 * calling our own /api routes over HTTP — same data, one less round trip.
 * Every helper degrades to an empty list so a cold or unreachable database
 * renders an empty state instead of a crashed page.
 */

/** Mongoose documents carry ObjectIds and Dates; serialise for the client. */
function plain<T>(docs: unknown): T {
  return JSON.parse(JSON.stringify(docs)) as T;
}

export async function getFoods(options?: {
  category?: string;
  limit?: number;
  availableOnly?: boolean;
}): Promise<Food[]> {
  try {
    await connectDB();

    const filter: Record<string, unknown> = {};
    if (options?.category) filter.category = options.category;
    if (options?.availableOnly) filter.available = true;

    let query = FoodModel.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    if (options?.limit) query = query.limit(options.limit);

    return plain<Food[]>(await query.lean());
  } catch (error) {
    console.error("getFoods failed:", error);
    return [];
  }
}

export async function getFood(id: string): Promise<Food | null> {
  try {
    await connectDB();

    const food = await FoodModel.findById(id)
      .populate("category", "name")
      .lean();

    return food ? plain<Food>(food) : null;
  } catch (error) {
    console.error("getFood failed:", error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    await connectDB();
    return plain<Category[]>(
      await CategoryModel.find().sort({ name: 1 }).lean()
    );
  } catch (error) {
    console.error("getCategories failed:", error);
    return [];
  }
}

/** Categories with a live dish count — powers the landing page rail. */
export async function getCategoriesWithCounts(): Promise<
  Array<Category & { count: number }>
> {
  try {
    await connectDB();

    const [categories, counts] = await Promise.all([
      CategoryModel.find().sort({ name: 1 }).lean(),
      FoodModel.aggregate<{ _id: unknown; count: number }>([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const countBy = new Map(
      counts.map((row) => [String(row._id), row.count])
    );

    return plain<Array<Category & { count: number }>>(
      categories.map((category) => ({
        ...category,
        count: countBy.get(String(category._id)) ?? 0,
      }))
    );
  } catch (error) {
    console.error("getCategoriesWithCounts failed:", error);
    return [];
  }
}

/** Related dishes from the same category, excluding the one being viewed. */
export async function getRelatedFoods(
  categoryId: string | null,
  excludeId: string,
  limit = 4
): Promise<Food[]> {
  if (!categoryId) return [];

  try {
    await connectDB();

    return plain<Food[]>(
      await FoodModel.find({
        category: categoryId,
        _id: { $ne: excludeId },
        available: true,
      })
        .populate("category", "name")
        .limit(limit)
        .lean()
    );
  } catch (error) {
    console.error("getRelatedFoods failed:", error);
    return [];
  }
}
