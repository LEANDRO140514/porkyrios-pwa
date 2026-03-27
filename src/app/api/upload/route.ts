import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink, access } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Allow up to 10MB before optimization (optimized will be much smaller)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    // Always save as .webp since client optimizes to webp
    const isWebp = file.type === "image/webp";
    const originalExt = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const ext = isWebp ? "webp" : originalExt;
    const publicId = `${timestamp}-${randomString}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(UPLOADS_DIR, publicId);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${publicId}`,
      publicId,
      size: buffer.byteLength,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const publicId = request.nextUrl.searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    // Security: prevent path traversal
    const sanitized = path.basename(publicId);
    if (sanitized !== publicId || publicId.includes("..") || publicId.includes("/")) {
      return NextResponse.json({ error: "Invalid publicId" }, { status: 400 });
    }

    const filepath = path.join(UPLOADS_DIR, sanitized);

    try {
      await access(filepath);
      await unlink(filepath);
    } catch {
      // File doesn't exist — treat as success (idempotent)
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
