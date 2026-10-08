import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/app/lib/mongodb";
import Cart from "@/app/models/Cart";
import Food from "@/app/models/Food";
import { getAuthUser } from "@/app/lib/auth";

// GET /api/cart — get current user's cart
export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    let cart = await Cart.findOne({ user: authUser.userId }).populate(
      "items.food",
      "name price available image"
    );

    if (!cart) {
      cart = await Cart.create({ user: authUser.userId, items: [] });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/cart — add item to cart
export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { foodId, quantity } = await req.json();

    if (!foodId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "foodId and quantity (min 1) are required" },
        { status: 400 }
      );
    }

    const food = await Food.findById(foodId);
    if (!food || !food.available) {
      return NextResponse.json(
        { success: false, message: "Food not available" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: authUser.userId });

    if (!cart) {
      cart = await Cart.create({
        user: authUser.userId,
        items: [{ food: foodId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item: { food: mongoose.Types.ObjectId }) =>
          item.food.toString() === foodId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ food: foodId, quantity });
      }

      await cart.save();
    }

    await cart.populate("items.food", "name price available image");

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}