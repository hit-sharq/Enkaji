"use client"

import { getCsrfToken } from "@/lib/csrf"

export async function csrfFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getCsrfToken()

  const headers = new Headers(init?.headers)
  headers.set("X-CSRF-Token", token)

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  })
}
