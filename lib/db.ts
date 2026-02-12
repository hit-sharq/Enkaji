import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization to prevent connection attempts during build
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
export const db = prisma

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
