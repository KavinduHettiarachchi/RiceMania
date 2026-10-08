import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/app/lib/mongodb";
import Food from "@/app/models/Food";
import { requireAdmin } from "@/app/lib/adminAuth";

// GET /api/foods — public
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;

    const foods = await Food.find(filter)
      .populate("category", "name")
      .sort({ name: 1 });

    return NextResponse.json({ success: true, foods });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/foods — admin only
export async function POST(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    await connectDB();

    const { name, description, price, category, available, image } =
      await req.json();

    if (!name?.trim() || price == null || !category) {
      return NextResponse.json(
        { success: false, message: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const food = await Food.create({
      name: name.trim(),
      description: description?.trim() || "",
      price,
      category,
      available: available ?? true,
      image: image || null,
    });

    await food.populate("category", "name");

    return NextResponse.json(
      { success: true, message: "Food created", food },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}