"use client"

import { useEffect } from "react"

export function ErrorReporter() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: event.message,
          stack: event.error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    }
    window.addEventListener("error", handler)
    return () => window.removeEventListener("error", handler)
  }, [])
  return null
}
