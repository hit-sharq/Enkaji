export const EXCHANGE_RATE = 130 // 1 USD = 130 KSh (fixed rate)

export function formatDualCurrency(priceInKsh: number): string {
  const usdPrice = priceInKsh / EXCHANGE_RATE
  return `KSh ${priceInKsh.toLocaleString()} ($${usdPrice.toFixed(2)})`
}

export function formatKsh(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

export function formatUsd(priceInKsh: number): string {
  const usdPrice = priceInKsh / EXCHANGE_RATE
  return `$${usdPrice.toFixed(2)}`
}

export function convertKshToUsd(priceInKsh: number): number {
  return priceInKsh / EXCHANGE_RATE
}
