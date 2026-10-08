import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/app/lib/mongodb";
import Food from "@/app/models/Food";
import { requireAdmin } from "@/app/lib/adminAuth";

// GET /api/foods/:id — public
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const food = await Food.findById(id).populate("category", "name");

    if (!food) {
      return NextResponse.json(
        { success: false, message: "Food not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, food });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// PUT /api/foods/:id — admin only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const { name, description, price, category, available, image } =
      await req.json();

    const food = await Food.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price }),
        ...(category && { category }),
        ...(available !== undefined && { available }),
        ...(image !== undefined && { image }),
      },
      { new: true }
    ).populate("category", "name");

    if (!food) {
      return NextResponse.json(
        { success: false, message: "Food not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Food updated",
      food,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/foods/:id — admin only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const food = await Food.findByIdAndDelete(id);

    if (!food) {
      return NextResponse.json(
        { success: false, message: "Food not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Food deleted",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}