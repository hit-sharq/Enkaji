interface Coordinates {
  lat: number
  lng: number
}

export function calculateDistance(
  start: Coordinates,
  end: Coordinates
): number {
  const R = 6371
  const dLat = ((end.lat - start.lat) * Math.PI) / 180
  const dLng = ((end.lng - start.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculateDeliveryPrice(
  distanceKm: number,
  timestamp: Date = new Date()
): {
  baseFee: number
  distanceFee: number
  peakSurcharge: number
  total: number
} {
  const baseFee = 150
  const perKmRate = 20
  const distanceFee = Math.max(0, (distanceKm - 2) * perKmRate)

  const hour = timestamp.getHours()
  const isPeakHour = [12, 13, 17, 18, 19].includes(hour)
  const peakSurcharge = isPeakHour ? baseFee * 0.5 : 0

  return {
    baseFee,
    distanceFee,
    peakSurcharge,
    total: baseFee + distanceFee + peakSurcharge,
  }
}

export function generateDeliveryNumber(): string {
  return `LUM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export function isWithinServiceArea(lat: number, lng: number): boolean {
  const bounds = {
    minLat: -1.44,
    maxLat: -1.15,
    minLng: 36.68,
    maxLng: 37.0,
  }

  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  )
}
