import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./auth";

export function requireAdmin(req: NextRequest) {
  const user = getAuthUser(req);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}