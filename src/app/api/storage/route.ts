import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STORAGE_LIMIT_BYTES = 25 * 1024 * 1024; // 25 MB virtual limit
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    let usedBytes = 0;

    try {
      const files = await fs.readdir(UPLOADS_DIR);
      const stats = await Promise.all(
        files.map((file) => fs.stat(path.join(UPLOADS_DIR, file)).catch(() => null))
      );
      usedBytes = stats.reduce((sum, s) => sum + (s?.size ?? 0), 0);
    } catch {
      // uploads dir doesn't exist yet — size is 0
    }

    return NextResponse.json({
      usedBytes,
      usedMB: usedBytes / (1024 * 1024),
      limitBytes: STORAGE_LIMIT_BYTES,
      limitMB: STORAGE_LIMIT_BYTES / (1024 * 1024),
      percentUsed: Math.min((usedBytes / STORAGE_LIMIT_BYTES) * 100, 100),
    });
  } catch (error) {
    console.error('Storage stats error:', error);
    return NextResponse.json({ error: 'Failed to calculate storage' }, { status: 500 });
  }
}
