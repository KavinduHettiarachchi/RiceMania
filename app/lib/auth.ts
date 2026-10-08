import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function getAuthUser(req: NextRequest) {
  const header = req.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  try {
    return verifyToken(header.split(" ")[1]);
  } catch {
    return null;
  }
}


