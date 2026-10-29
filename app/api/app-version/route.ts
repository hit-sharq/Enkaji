import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { db } from "@/lib/db"

async function getPkgVersion(): Promise<string> {
  try {
    const pkgData = await readFile(join(process.cwd(), "package.json"), "utf-8")
    return JSON.parse(pkgData).version || "1.0.0"
  } catch {
    return "1.0.0"
  }
}

/**
 * GET /api/app-version
 * Reads from SystemConfig (DB) so updates can be published without a Vercel redeploy.
 * Auto-creates a singleton row from env/package defaults on first call.
 */
export async function GET(request: Request) {
  try {
    let config = await db.systemConfig.findUnique({ where: { id: "singleton" } })

    if (!config) {
      config = await db.systemConfig.create({
        data: {
          id: "singleton",
          latestVersion: process.env.NEXT_PUBLIC_LATEST_APP_VERSION || (await getPkgVersion()),
          forceUpdate: process.env.NEXT_PUBLIC_FORCE_UPDATE === "true",
          releaseNotes: process.env.NEXT_PUBLIC_RELEASE_NOTES || "Bug fixes and improvements",
          downloadUrl: process.env.NEXT_PUBLIC_APP_STORE_URL || "https://enkaji.vercel.app",
        },
      })
    }

    return NextResponse.json({
      currentVersion: await getPkgVersion(),
      latestVersion: config.latestVersion,
      forceUpdate: config.forceUpdate,
      releaseNotes: config.releaseNotes,
      downloadUrl: config.downloadUrl,
    })
  } catch (error) {
    console.error("Error fetching app version:", error)
    return NextResponse.json(
      {
        currentVersion: await getPkgVersion(),
        latestVersion: process.env.NEXT_PUBLIC_LATEST_APP_VERSION || (await getPkgVersion()),
        forceUpdate: process.env.NEXT_PUBLIC_FORCE_UPDATE === "true",
        releaseNotes: process.env.NEXT_PUBLIC_RELEASE_NOTES || "Bug fixes and improvements",
        downloadUrl: process.env.NEXT_PUBLIC_APP_STORE_URL || "https://enkaji.vercel.app",
      },
      { status: 200 }
    )
  }
}

/**
 * PATCH /api/app-version
 * Update version config at runtime (no redeploy). Body: { latestVersion?, forceUpdate?, releaseNotes?, downloadUrl? }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const config = await db.systemConfig.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        latestVersion: body.latestVersion || "1.0.0",
        forceUpdate: body.forceUpdate ?? false,
        releaseNotes: body.releaseNotes || "Bug fixes and improvements",
        downloadUrl: body.downloadUrl || "",
      },
      update: {
        ...(body.latestVersion !== undefined && { latestVersion: body.latestVersion }),
        ...(body.forceUpdate !== undefined && { forceUpdate: body.forceUpdate }),
        ...(body.releaseNotes !== undefined && { releaseNotes: body.releaseNotes }),
        ...(body.downloadUrl !== undefined && { downloadUrl: body.downloadUrl }),
      },
    })
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("Error updating app version:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
