import fs from "node:fs/promises";
import path from "node:path";

type RouteProps = {
  params: Promise<{ name: string }>;
};

const SAMPLE_SCREEN_DIR = path.resolve(process.cwd(), "../Sample Sceen");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

export async function GET(_request: Request, { params }: RouteProps) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const extension = path.extname(decoded).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension) || decoded.includes("..")) {
    return new Response("Invalid file name", { status: 400 });
  }

  const fullPath = path.join(SAMPLE_SCREEN_DIR, decoded);
  try {
    const fileBuffer = await fs.readFile(fullPath);
    const contentType = extension === ".png" ? "image/png" : "image/jpeg";
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Image not found", { status: 404 });
  }
}
