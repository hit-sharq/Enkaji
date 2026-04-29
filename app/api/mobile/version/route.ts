import { NextRequest, NextResponse } from 'next/server'

function getEnvNumber(key: string, fallback: number): number {
  const val = process.env[key]
  const num = Number(val)
  return Number.isNaN(num) ? fallback : num
}

function getEnvString(key: string, fallback: string): string {
  return process.env[key] || fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const versionData = {
      version: body.version || getEnvString('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
      buildNumber: Number(body.buildNumber) || getEnvNumber('NEXT_PUBLIC_BUILD_NUMBER', 1),
      minRequiredBuild: Number(body.minRequiredBuild) || getEnvNumber('NEXT_PUBLIC_MIN_REQUIRED_BUILD', 1),
      apkUrl: body.apkUrl || getEnvString('NEXT_PUBLIC_APK_DOWNLOAD_URL', 'https://expo.dev/artifacts/eas/vmSxSYvCbc3HveLYLbunxe.apk'),
      releaseNotes: body.releaseNotes || getEnvString('NEXT_PUBLIC_RELEASE_NOTES', 'App update available'),
    }

    console.log('Mobile version updated:', versionData)

    return NextResponse.json({ success: true, data: versionData })
  } catch (error) {
    console.error('Version update failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  const currentVersion = {
    version: getEnvString('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
    buildNumber: getEnvNumber('NEXT_PUBLIC_BUILD_NUMBER', 1),
    minRequiredBuild: getEnvNumber('NEXT_PUBLIC_MIN_REQUIRED_BUILD', 1),
    apkUrl: getEnvString('NEXT_PUBLIC_APK_DOWNLOAD_URL', 'https://expo.dev/artifacts/eas/vmSxSYvCbc3HveLYLbunxe.apk'),
    releaseNotes: getEnvString('NEXT_PUBLIC_RELEASE_NOTES', 'App update available'),
  }
  
  return NextResponse.json({ success: true, data: currentVersion })
}
