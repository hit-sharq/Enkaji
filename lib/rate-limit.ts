import type { NextRequest } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }

    const current = rateLimitMap.get(ip)

    if (!current) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return { success: true, remaining: config.maxRequests - 1 }
    }

    if (current.resetTime < now) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return { success: true, remaining: config.maxRequests - 1 }
    }

    if (current.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
      }
    }

    current.count++
    return {
      success: true,
      remaining: config.maxRequests - current.count,
    }
  }
}

// Pre-configured rate limiters
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
})
