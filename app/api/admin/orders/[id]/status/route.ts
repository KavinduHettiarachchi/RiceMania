import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { requireAdmin } from "@/app/lib/adminAuth";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["approved", "cancelled"],
  approved: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

// PUT /api/admin/orders/:id/status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const { id } = await params;
    await connectDB();

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const allowed = VALID_TRANSITIONS[order.status];

    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot change from "${order.status}" to "${status}"`,
        },
        { status: 400 }
      );
    }

    order.status = status;
    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}