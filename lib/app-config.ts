/**
 * Centralized Application Configuration
 * 
 * All branding, naming, and URL references should use this config
 * to enable easy white-labeling and rebranding.
 * 
 * Set NEXT_PUBLIC_APP_NAME in your .env to override defaults.
 */

export const appConfig = {
  /** Primary app name (e.g., "Enkaji Trade") */
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Enkaji Trade",

  /** Full app name with country/region (e.g., "Enkaji Trade Kenya") */
  get APP_FULL_NAME() {
    return `${this.APP_NAME} Kenya`
  },

  /** Short tagline for emails and footers */
  APP_TAGLINE: process.env.APP_TAGLINE || "Connecting Kenya's Market",

  /**
   * Base app URL (no trailing slash).
   * Set NEXT_PUBLIC_APP_URL to your real domain in production.
   * Falls back to localhost for development since no custom domain is configured yet.
   */
  APP_URL: (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, ""),

  /**
   * Email sender address.
   * Set EMAIL_FROM once a real sending domain is verified with the email provider.
   */
  get EMAIL_FROM() {
    return process.env.EMAIL_FROM || `${this.APP_NAME} <onboarding@resend.dev>`
  },

  /**
   * Support email.
   * Set SUPPORT_EMAIL once a real support inbox exists; empty by default so the
   * UI can fall back to the on-site contact form instead of a fake address.
   */
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "",

  /** Seller dashboard URL */
  get SELLER_DASHBOARD_URL() {
    return `${this.APP_URL}/dashboard`
  },

  /** Sellers landing page URL */
  get SELLERS_URL() {
    return `${this.APP_URL}/sellers`
  }
} as const

export default appConfig
