import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/app/lib/mongodb";
import Category from "@/app/models/Category";
import { requireAdmin } from "@/app/lib/adminAuth";

// GET /api/categories — public
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/categories — admin only
export async function POST(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    await connectDB();

    const { name, image } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      image: image || null,
    });

    return NextResponse.json(
      { success: true, message: "Category created", category },
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