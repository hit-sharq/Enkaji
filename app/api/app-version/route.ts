import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

/**
 * GET /api/app-version
 * Returns the current app version info for mobile update checks
 */
export async function GET(request: Request) {
  try {
    // Read package.json to get version
    const pkgPath = join(process.cwd(), "package.json")
    const pkgData = await readFile(pkgPath, "utf-8")
    const pkg = JSON.parse(pkgData)
    const currentVersion = pkg.version || "1.0.0"

    return NextResponse.json({
      currentVersion,
      latestVersion: process.env.NEXT_PUBLIC_LATEST_APP_VERSION || currentVersion,
      forceUpdate: process.env.NEXT_PUBLIC_FORCE_UPDATE === "true",
      releaseNotes: process.env.NEXT_PUBLIC_RELEASE_NOTES || "Bug fixes and improvements",
      downloadUrl: process.env.NEXT_PUBLIC_APP_STORE_URL || "https://enkaji.vercel.app",
    })
  } catch (error) {
    console.error("Error fetching app version:", error)
    return NextResponse.json(
      { currentVersion: "1.0.0", latestVersion: "1.0.0", forceUpdate: false, releaseNotes: "", downloadUrl: null },
      { status: 200 }
    )
  }
}

