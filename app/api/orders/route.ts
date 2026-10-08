import { NextRequest, NextResponse } from "next/server";
import type mongoose from "mongoose";

import { connectDB } from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Cart from "@/app/models/Cart";
// Imported for its side effect: registers the Food model so the cart's
// populate("items.food") can resolve ref: "Food".
import "@/app/models/Food";
import { getAuthUser } from "@/app/lib/auth";

/** Shape of `items.food` once the cart query has populated it. */
type PopulatedFood = {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  available: boolean;
};

type PopulatedCartItem = {
  food: PopulatedFood;
  quantity: number;
};

// POST /api/orders — place order from cart
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

    const cart = await Cart.findOne({ user: authUser.userId }).populate(
      "items.food"
    );

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // A dish can be taken off the menu while it sits in someone's cart.
    for (const item of cart.items) {
      const food = item.food as PopulatedFood;

      if (!food.available) {
        return NextResponse.json(
          { success: false, message: `${food.name} is no longer available` },
          { status: 400 }
        );
      }
    }

    // Build order items and calculate total
    let total = 0;
    const orderItems = (cart.items as PopulatedCartItem[]).map((item) => {
      const subtotal = item.food.price * item.quantity;
      total += subtotal;

      return {
        food: item.food._id,
        name: item.food.name,
        price: item.food.price,
        quantity: item.quantity,
      };
    });

    // Create order
    const order = await Order.create({
      user: authUser.userId,
      items: orderItems,
      total,
      status: "pending",
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    return NextResponse.json(
      { success: true, message: "Order placed", order },
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

// GET /api/orders — get my orders
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

    const orders = await Order.find({ user: authUser.userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}