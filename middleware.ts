import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

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
  "/api/pesapal(.*)",  // Allow Pesapal API routes to be public (they handle their own auth)
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // If user is signed in and tries to access sign-in/sign-up, redirect to dashboard
  if (userId && (req.nextUrl.pathname.startsWith("/sign-in") || req.nextUrl.pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protect routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  // Apply security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.com https://*.clerk.accounts.dev; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.clerk.com https://*.clerk.accounts.dev https://api.cloudinary.com; " +
    "frame-src 'self' https://js.clerk.com https://*.clerk.accounts.dev; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  )

})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
