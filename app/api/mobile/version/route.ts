import { NextResponse } from "next/server"

// This endpoint returns the latest mobile app version info
// The mobile app polls this to check if a new APK is required

interface VersionInfo {
  version: string
  buildNumber: number
  minRequiredBuild: number
  apkUrl: string | null
  releaseNotes: string
  forceUpdate: boolean
  publishedAt: string
}

// Update these values when you release a new APK
const LATEST_VERSION: VersionInfo = {
  version: "1.0.0",
  buildNumber: 1,
  minRequiredBuild: 1, // If user's build < this, force update
  apkUrl: process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || null,
  releaseNotes: "Initial release",
  forceUpdate: false,
  publishedAt: new Date().toISOString(),
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: LATEST_VERSION,
  })
}

// Admin endpoint to update version info (protected in production)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // In production, add admin auth check here
    
    // Update the version info
    Object.assign(LATEST_VERSION, {
      ...body,
      publishedAt: new Date().toISOString(),
    })
    
    return NextResponse.json({
      success: true,
      data: LATEST_VERSION,
      message: "Version info updated. New APK will be required for all users.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update version" },
      { status: 500 }
    )
  }
}

