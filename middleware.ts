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

  // Allow all other routes
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
