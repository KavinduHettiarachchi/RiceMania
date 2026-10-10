import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("MongoDB connection is not ready");
    }

    await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "Rice Mania MongoDB connected successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Rice Mania MongoDB connection failed",
      },
      { status: 500 }
    );
  }
}
