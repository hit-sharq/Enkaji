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

  /** Base app URL (no trailing slash) */
  APP_URL: (process.env.NEXT_PUBLIC_APP_URL || "https://enkaji.co.ke").replace(/\/$/, ""),

  /** Email sender address */
  get EMAIL_FROM() {
    return process.env.EMAIL_FROM || `${this.APP_NAME} <noreply@enkaji.co.ke>`
  },

  /** Support email */
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "support@enkaji.co.ke",

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
