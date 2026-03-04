import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  console.log("Cloud Name:", cloudName);

  if (!cloudName) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadFormData = new FormData();
    uploadFormData.append("file", dataUri);
    uploadFormData.append("upload_preset", "studio");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    const result = await response.json();
    console.log("Cloudinary response status:", response.status);
    console.log("Cloudinary response:", result);

    if (result.secure_url) {
      return NextResponse.json({ url: result.secure_url });
    } else {
      return NextResponse.json(
        { error: result.error?.message || "Upload failed", details: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed", details: String(error) }, { status: 500 });
  }
}
