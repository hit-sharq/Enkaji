import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/sell(.*)",
  "/cart",
  "/checkout",
  "/orders",
  "/favorites",
])

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/about(.*)",
  "/contact(.*)",
  "/faq(.*)",
  "/products(.*)",
  "/artisans(.*)",
  "/sellers(.*)",
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req) && isProtectedRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
