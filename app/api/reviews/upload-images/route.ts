import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = Array.from(formData.values()).filter((value): value is File => value instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 images allowed" }, { status: 400 })
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
      }
    }

    // Upload files to Vercel Blob
    const uploadPromises = files.map(async (file, index) => {
      const filename = `reviews/${userId}/${Date.now()}-${index}-${file.name}`
      const blob = await put(filename, file, {
        access: "public",
      })
      return blob.url
    })

    const urls = await Promise.all(uploadPromises)

    return NextResponse.json({ urls })
  } catch (error) {
    console.error("Error uploading images:", error)
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 })
  }
}
