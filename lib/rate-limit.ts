import type { NextRequest } from "next/server"
import { prisma } from "@/lib/db"

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime?: number
}

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    const existing = await prisma.rateLimitEntry.findUnique({
      where: { key },
    })

    if (!existing || existing.resetTime.getTime() < now) {
      const resetTime = new Date(now + config.windowMs)

      if (existing) {
        await prisma.rateLimitEntry.update({
          where: { key },
          data: { count: 1, resetTime },
        })
      } else {
        await prisma.rateLimitEntry.create({
          data: { key, count: 1, resetTime },
        })
      }

      return { success: true, remaining: config.maxRequests - 1, resetTime: resetTime.getTime() }
    }

    if (existing.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: existing.resetTime.getTime(),
      }
    }

    const updated = await prisma.rateLimitEntry.update({
      where: { key },
      data: { count: existing.count + 1 },
    })

    return {
      success: true,
      remaining: config.maxRequests - updated.count,
      resetTime: updated.resetTime.getTime(),
    }
  } catch (error) {
    console.error("[RateLimit] Database error, allowing request:", error)
    return { success: true, remaining: config.maxRequests - 1 }
  }
}

export async function isBlockedIp(ip: string): Promise<boolean> {
  try {
    const blocked = await prisma.blockedIp.findUnique({
      where: { ip },
    })
    return !!blocked
  } catch (error) {
    console.error("[RateLimit] Blocked IP check failed:", error)
    return false
  }
}

export async function blockIp(ip: string, reason?: string): Promise<void> {
  try {
    await prisma.blockedIp.upsert({
      where: { ip },
      update: { reason: reason || null },
      create: { ip, reason: reason || null },
    })
  } catch (error) {
    console.error("[RateLimit] Failed to block IP:", error)
  }
}

export async function unblockIp(ip: string): Promise<void> {
  try {
    await prisma.blockedIp.delete({
      where: { ip },
    }).catch(() => {})
  } catch (error) {
    console.error("[RateLimit] Failed to unblock IP:", error)
  }
}

export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<RateLimitResult> => {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""
    const key = `${ip}:${userAgent.slice(0, 50)}`

    const blocked = await isBlockedIp(ip)
    if (blocked) {
      return { success: false, remaining: 0 }
    }

    return checkRateLimit(key, config)
  }
}

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
})

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
})

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
})

// Backwards-compatible aliases
export const apiRateLimit = apiRateLimiter
export const authRateLimit = authRateLimiter
export const uploadRateLimit = uploadRateLimiter
