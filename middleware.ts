import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getCsrfToken, validateCsrfToken } from "@/lib/csrf"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/cart",
  "/checkout",
  "/orders",
  "/favorites",
])

const isPublicRoute = createRouteMatcher([
  "/",
  "/shop(.*)",
  "/products(.*)",
  "/sellers(.*)",
  "/categories(.*)",
  "/about",
  "/contact",
  "/blog(.*)",
  "/artisans(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/pesapal(.*)",
])

const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:5000',
  'https://enkaji.vercel.app',
  'https://enkaji-amber.vercel.app',
]

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  return allowedOrigins.some(allowed => origin === allowed || origin.endsWith(allowed.replace('https://', '')))
}

function isCorsPreflight(req: NextRequest): boolean {
  return req.method === "OPTIONS"
}

function isStateChangingMethod(req: NextRequest): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const origin = req.headers.get("origin")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")

  if (isCorsPreflight(req)) {
    const response = NextResponse.next()
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token, X-Requested-With")
      response.headers.set("Access-Control-Allow-Credentials", "true")
      response.headers.set("Access-Control-Max-Age", "86400")
    }
    return response
  }

  if (userId && (req.nextUrl.pathname.startsWith("/sign-in") || req.nextUrl.pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  const response = NextResponse.next()

  if (origin && isAllowedOrigin(origin) && isApiRoute) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token, X-Requested-With")
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }

  if (isStateChangingMethod(req) && isApiRoute) {
    const csrfValid = validateCsrfToken(req)
    if (!csrfValid) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }
  }

  if (isApiRoute && isStateChangingMethod(req)) {
    const csrfToken = getCsrfToken()
    response.cookies.set("csrf_token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })
  }

  const cspDirectives =
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.com https://*.clerk.accounts.dev; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    `connect-src 'self' ${origin || ''} https://api.clerk.com https://*.clerk.accounts.dev https://api.cloudinary.com; ` +
    "frame-src 'self' https://js.clerk.com https://*.clerk.accounts.dev; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"

  response.headers.set("Content-Security-Policy", cspDirectives)

  return response
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
