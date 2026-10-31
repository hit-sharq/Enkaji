declare global {
  var __csrfToken: string | undefined
}

import { NextRequest, NextResponse } from "next/server"

const CSRF_COOKIE_NAME = "csrf_token"
const CSRF_HEADER_NAME = "x-csrf-token"

function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString("hex")
}

export function getCsrfToken(): string {
  // Client-side: read the token from the non-httpOnly cookie (double-submit pattern)
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)
    if (match) {
      return decodeURIComponent(match[1])
    }
    // Fallback: generate (won't validate, but avoids crashes)
    return ""
  }
  // Server-side (middleware/edge): generate/store in process global
  if (typeof globalThis.__csrfToken === "string") {
    return globalThis.__csrfToken
  }
  const token = generateToken()
  globalThis.__csrfToken = token
  return token
}

export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return false
  }

  return cookieToken === headerToken
}

export function setCsrfCookie(response: NextResponse): void {
  const token = getCsrfToken()
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  })
}

export function csrfProtection() {
  return async (request: NextRequest) => {
    const method = request.method

    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return null
    }

    const isValid = validateCsrfToken(request)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      )
    }

    return null
  }
}
