import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Media from "@/models/Media";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const alt = (formData.get("alt") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using secure stream pipe
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "growthbridge" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    await connectToDatabase();
    
    // Save record to DB
    const mediaItem = await Media.create({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      altText: alt,
    });

    return NextResponse.json({ success: true, data: mediaItem });
  } catch (error: any) {
    console.error("Cloudinary upload API error:", error);
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const items = await Media.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: items });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const publicId = searchParams.get("publicId");

    if (!id || !publicId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from DB
    await connectToDatabase();
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
  }
}
