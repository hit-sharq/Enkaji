# Mobile App Update System — Implementation Guide

## Overview

The Enkaji mobile app uses a **hybrid update system** combining:
- **Expo OTA updates** (JavaScript bundle updates)
- **Backend version API** (controlled release notes, force updates, store redirects)

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                     App Launch / Foreground              │
└─────────────────────────────────────────────────────────┘
                          ↓
              ┌───────────┴───────────┐
              │                       │
         OTA Check               Backend Check
    (Expo Updates CDN)        (GET /api/app-version)
              │                       │
              └───────────┬───────────┘
                          ↓
                 Has Update?
                    ↓
         ┌──────────┴──────────┐
         │                     │
        YES                   NO → Silent exit
         │
    Show Banner
    (optional or force)
         │
    User taps "Install"
         │
         └───┬──────────────┐
              │              │
         OTA available     No OTA
              │              │
    Updates.reloadAsync()   open(downloadUrl)
              │              │
         App restarts      → Play Store
```

---

## Files Involved

| File | Role |
|------|------|
| `enkaji-mobile/app.json` | App metadata (`version`, `runtimeVersion`) |
| `enkaji-mobile/hooks/use-app-updates.ts` | Hook that checks versions, manages state |
| `enkaji-mobile/components/update-banner.tsx` | UI component (top banner) |
| `enkaji-mobile/lib/api.ts` | `checkAppVersion()`, `reportUpdateEvent()` |
| `app/_layout.tsx` (mobile) | Mounts `<UpdateBanner />` |
| `app/api/app-version/route.ts` (web) | Backend endpoint (you must create) |

---

## Backend Endpoint (Missing — You Need to Create)

**Path:** `/api/app-version` (GET)

**Response:**
```json
{
  "latestVersion": "1.0.2",
  "forceUpdate": false,
  "releaseNotes": "Bug fixes and improvements",
  "downloadUrl": "https://play.google.com/store/apps/details?id=com.enkaji.mobile"
}
```

**Implementation example** (using environment variables):

```ts
// app/api/app-version/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const latestVersion = process.env.LATEST_APP_VERSION || '1.0.0'
  const forceUpdate = process.env.FORCE_UPDATE === 'true'
  const releaseNotes = process.env.RELEASE_NOTES || 'New version available'

  return NextResponse.json({
    latestVersion,
    forceUpdate,
    releaseNotes,
    downloadUrl: `https://play.google.com/store/apps/details?id=com.enkaji.mobile`
  })
}
```

---

## Setup Checklist

### 1. Backend Setup

- [ ] Create `/api/app-version` endpoint (see above)
- [ ] (Optional) Create `/api/app-update-events` endpoint for analytics
- [ ] Set environment variables:
  - `LATEST_APP_VERSION` — current latest version (e.g., `1.0.1`)
  - `FORCE_UPDATE` — `true` or `false`
  - `RELEASE_NOTES` — default release notes

### 2. Mobile App Setup

- [x] `expo-updates` installed
- [x] `updates.enabled: true` in `app.json` (default)
- [x] `runtimeVersion` set in `app.json` (for OTA compatibility)
- [x] `<UpdateBanner />` mounted in `app/_layout.tsx`
- [x] `useAppUpdates()` hook initialized in `app/_layout.tsx`

### 3. Build Configuration

- [x] `app.json` version matches your release version
- [x] `versionCode` (Android) and `buildNumber` (iOS) incremented
- [x] `eas.json` has `channel` configured for updates

---

## Release Process

### Step 1: Update Mobile App Version

In `enkaji-mobile/app.json`:
```json
{
  "expo": {
    "version": "1.0.2",  // ← bump this
    "android": {
      "versionCode": 4   // ← bump this too
    },
    "ios": {
      "buildNumber": "4" // ← bump this too
    }
  }
}
```

### Step 2: Build the APK/AAB

```bash
cd enkaji-mobile
npx eas build --platform android --profile preview
```

Wait for build to complete, download the APK.

### Step 3: Upload OTA Bundle (Optional but Recommended)

```bash
npx expo upload:android
```

This uploads the JS bundle to Expo's CDN. Users with the current APK will get the update instantly when they open the app (no store download needed).

**If you skip this**, the banner will still appear, but "Install" will open the Play Store page instead.

### Step 4: Update Backend Version

In your Vercel/backend environment, set:
```
LATEST_APP_VERSION=1.0.2
FORCE_UPDATE=false
RELEASE_NOTES="Fixed critical bug"
```

Or, if using a database, insert a new `app_versions` record with version `1.0.2`.

### Step 5: Deploy Backend

If using env vars: just redeploy/restart the backend.
If using database: ensure the new version record is visible.

### Step 6: Users See Banner

- Users with version `< 1.0.2` will see the banner on next app launch
- Tapping "Install" triggers OTA reload (if OTA uploaded) or opens Play Store

---

## Testing the Update Banner

### Quick Test (No Need to Build New APK)

1. **Make sure your current installed APK** is version `1.0.1` (or whatever you want to test from)
2. **Set backend** to return `latestVersion: "1.0.2"` (higher than installed)
3. **Restart the app** (completely close and reopen)
4. **Banner should appear** at the top

If it doesn't appear:

- Check device logs: `adb logcat | grep -i "update"`
- Verify network call to `/api/app-version` succeeds (use Chrome DevTools remote debugging)
- Ensure `semver.gt("1.0.2", "1.0.1")` returns `true` (it should)

---

## Version Comparison (Semver)

The app uses the `semver` library to compare versions. This means:

- `"1.0.2" > "1.0.11"` → `false` (string compare would be wrong)
- `"1.10.0" > "1.9.0"` → `true` (string compare would fail)

**Important:** Use proper semantic versioning (`major.minor.patch`). Don't skip numbers.

---

## Force Updates

To force an immediate update (red banner, no "Later" button):

Set in backend:
```json
{
  "forceUpdate": true
}
```

The banner will:
- Have red background (`#c73e1d`)
- Only show "Update Now" button (no dismiss)
- User cannot continue without updating

**Use sparingly** — only for critical security patches or breaking bugs.

---

## OTA vs Store Updates

| Aspect | OTA (expo upload) | Store (downloadUrl) |
|--------|-------------------|--------------------|
| Speed | Instant (seconds) | Minutes (download + install) |
| Requires user account | No | Yes (Google Play) |
| Works on Expo Go | No | N/A |
| Native code changes | Not supported | Supported (full APK) |
| User friction | Low | Higher (store UX) |

**Best practice:** Use OTA for JS-only changes, store updates for native changes.

---

## Event Tracking (Optional)

The app sends analytics events:

```ts
api.reportUpdateEvent('update_checked', { currentVersion, latestVersion, hasUpdate })
api.reportUpdateEvent('update_downloaded', { newVersion }) // after fetchUpdateAsync
api.reportUpdateEvent('update_installed', { newVersion }) // after reload
```

Implement `/api/app-update-events` to log these for analytics.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Banner never shows | `/api/app-version` returns `latestVersion` equal to or less than current | Increase `latestVersion` in backend |
| Banner shows but "Install" does nothing | OTA not uploaded OR network error | Run `npx expo upload:android` first |
| Force update not blocking | `forceUpdate: false` in backend response | Set `FORCE_UPDATE=true` |
| Version `1.0.10` not detected as > `1.0.9` | Using string compare (bug) | Ensure `semver.gt()` is used (fixed in current code) |
| Build fails with "react-native-worklets/plugin" missing | `react-native-worklets` not installed | `npm install react-native-worklets` |

---

## Important Notes

- **Update checks happen:**
  - On app launch (silent)
  - When app returns from background (silent)
  - Banner only shows if `hasUpdate === true`

- **OTA only works in release builds:**
  - Expo Go: ❌
  - Development build (`npx expo run:android`): ❌
  - EAS built APK: ✅

- **Version must be strictly greater:**
  - `1.0.1` vs `1.0.1` → no banner
  - `1.0.2` vs `1.0.1` → banner shows

---

## Related Files

- `docs/UPDATE_SYSTEM_QUICK_REFERENCE.md` — Quick visual reference
- `components/update-banner.tsx` — Banner UI component
- `hooks/use-app-updates.ts` — Version check logic

---

## Questions?

Refer to:
- Expo Updates docs: https://docs.expo.dev/eas-update/
- EAS Build docs: https://docs.expo.dev/build/
- Semver: https://semver.org/
