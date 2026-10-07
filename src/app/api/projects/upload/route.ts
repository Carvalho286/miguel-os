import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Vercel Blob token is missing. Please set BLOB_READ_WRITE_TOKEN in .env.local to upload photos.",
        },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const projectName = (formData.get("projectName") as string) || "unnamed";
    const files = formData.getAll("photos") as File[];

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const blob = await put(`projects/${projectName}/${file.name}`, file, {
        access: "public",
      });
      uploadedUrls.push(blob.url);
    }

    return NextResponse.json(uploadedUrls);
  } catch (err: any) {
    console.error("POST /api/projects/upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload photos" },
      { status: 500 },
    );
  }
}
