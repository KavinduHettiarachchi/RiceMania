import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET");
}

export function signToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET as string) as {
    userId: string;
    role: string;
  };
}