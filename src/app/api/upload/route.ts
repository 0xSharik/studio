import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fileOrDataUri = formData.get("file");

  if (!fileOrDataUri) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  console.log("Cloud Name:", cloudName);

  if (!cloudName) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  try {
    let dataUri: string;

    if (typeof fileOrDataUri === "string") {
      // Already a data URI string (from image cropper)
      dataUri = fileOrDataUri;
    } else {
      // It's a File object
      const bytes = await fileOrDataUri.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      dataUri = `data:${fileOrDataUri.type};base64,${base64}`;
    }

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
