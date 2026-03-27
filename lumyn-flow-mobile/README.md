# Lumyn Flow Mobile App

Standalone delivery request & fulfillment app for Lumyn Technologies.

## Features

### Customer
- Request deliveries with map location picker
- Real-time driver tracking
- Payment via M-Pesa/Card
- Driver rating & reviews
- Delivery history

### Driver
- View available delivery jobs
- Accept/complete jobs
- Real-time location tracking
- Earnings dashboard
- Weekly payouts

## Tech Stack
- React Native + Expo
- Zustand (state management)
- Axios (API client)
- Expo Router (navigation)
- Expo Location & Camera

## Environment Variables

```
EXPO_PUBLIC_LUMYN_API_URL=https://your-api.com
EXPO_PUBLIC_MAPBOX_API_KEY=your_mapbox_key
```

## Development

```bash
npm install --legacy-peer-deps
npx expo start
```

## Deployment

EAS Build & EAS Update configured.

See LUMYN_SETUP.md for deployment instructions.
