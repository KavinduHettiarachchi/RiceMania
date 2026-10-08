import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/app/lib/mongodb";
import Cart from "@/app/models/Cart";
import { getAuthUser } from "@/app/lib/auth";

// PUT /api/cart/:itemId — update quantity
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    await connectDB();

    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: authUser.userId });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Item not found in cart" },
        { status: 404 }
      );
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.food", "name price available image");

    return NextResponse.json({
      success: true,
      message: "Cart updated",
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

// DELETE /api/cart/:itemId — remove item from cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    await connectDB();

    const cart = await Cart.findOne({ user: authUser.userId });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items.pull({ _id: itemId });
    await cart.save();
    await cart.populate("items.food", "name price available image");

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
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