import type { NextRequest } from "next/server"
import { createClient } from 'redis'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

// Redis client for rate limiting
let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL

    if (redisUrl) {
      try {
        redisClient = createClient({
          url: redisUrl,
          password: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
        })

        redisClient.on('error', (err) => {
          console.error('Redis Client Error:', err)
        })

        await redisClient.connect()
        console.log('✅ Connected to Redis for rate limiting')
      } catch (error) {
        console.error('❌ Failed to connect to Redis:', error)
        redisClient = null
      }
    }
  }

  return redisClient
}

// Fallback in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

async function checkRedisRateLimit(key: string, config: RateLimitConfig): Promise<{ success: boolean; remaining: number; resetTime?: number }> {
  const client = await getRedisClient()

  if (!client) {
    // Fallback to in-memory
    return checkInMemoryRateLimit(key, config)
  }

  try {
    const now = Date.now()
    const windowKey = `${key}:${Math.floor(now / config.windowMs)}`

    const current = await client.get(windowKey)
    const count = current ? parseInt(current) : 0

    if (count >= config.maxRequests) {
      const ttl = await client.ttl(windowKey)
      return {
        success: false,
        remaining: 0,
        resetTime: now + (ttl * 1000)
      }
    }

    const newCount = count + 1
    await client.setEx(windowKey, Math.ceil(config.windowMs / 1000), newCount.toString())

    return {
      success: true,
      remaining: config.maxRequests - newCount
    }
  } catch (error) {
    console.error('Redis rate limit error:', error)
    // Fallback to in-memory on Redis error
    return checkInMemoryRateLimit(key, config)
  }
}

function checkInMemoryRateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number; resetTime?: number } {
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Clean up old entries
  for (const [mapKey, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(mapKey)
    }
  }

  const current = rateLimitMap.get(key)

  if (!current) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return { success: true, remaining: config.maxRequests - 1 }
  }

  if (current.resetTime < now) {
    rateLimitMap.set(key, {
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

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || ""
    const key = `${ip}:${userAgent.slice(0, 50)}` // Include user agent for better uniqueness

    return await checkRedisRateLimit(key, config)
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
