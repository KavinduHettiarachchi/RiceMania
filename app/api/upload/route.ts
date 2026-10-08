import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB

// Extension is derived from the detected type, never from the client filename.
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

// POST /api/upload — admin only. Stores the file under public/uploads
// and returns the public path to save on a Food or Category.
export async function POST(req: NextRequest) {
  try {
    const { error } = requireAdmin(req);
    if (error) return error;

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file received" },
        { status: 400 }
      );
    }

    const extension = ALLOWED[file.type];
    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message: "Use a JPG, PNG, WebP, AVIF or GIF image",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 4MB" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Random name — avoids collisions and stops a crafted filename from
    // escaping the uploads directory.
    const filename = `${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads");

    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), bytes);

    return NextResponse.json(
      { success: true, message: "Image uploaded", url: `/uploads/${filename}` },
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
