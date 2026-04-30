# App Update System - Quick Reference

## What's Implemented

Users are **automatically notified** when the app has updates through a **professional banner** at the top of the app.

## Key Features

✅ **Auto Check on Launch** - Checks for updates when app opens
✅ **Background Check** - Checks when user returns to app
✅ **Banner Notification** - Shows at top of app without blocking
✅ **Optional Updates** - Users can dismiss and update later
✅ **Force Updates** - Critical updates force user to update (red banner)
✅ **Progress Indicator** - Shows installation progress (0-100%)
✅ **OTA Support** - Uses Expo's over-the-air updates
✅ **Backend Integration** - Checks API for version info
✅ **Event Tracking** - Reports update events to backend

## What Users See

### Normal Update
```
┌─────────────────────────────────────────────┐
│ ↻ Update Available                    [Install] │
│ v1.2.0 - Bug fixes and improvements     ▓▓▓▓░░░ │
└─────────────────────────────────────────────┘
```

### Critical Update (Force)
```
┌─────────────────────────────────────────────┐
│ ⚠ Update Required                   [Install] │
│ v1.2.0 - Security patch                ▓▓▓▓░░░ │
└─────────────────────────────────────────────┘
```

## How It Works

1. **App Launches** → Checks Expo OTA updates
2. **Also Checks** → Backend API for version
3. **Has Update?** → Shows banner at top
4. **User Taps Install** → Downloads update
5. **Progress Bar** → Shows 0-100% during download
6. **Auto Restart** → App restarts with new version

## Files Involved

```
enkaji-mobile/
├── hooks/
│   └── use-app-updates.ts          ← Update checking logic
├── components/
│   └── update-banner.tsx           ← Banner display
├── lib/
│   └── api.ts                      ← API endpoints
├── app/
│   └── _layout.tsx                 ← Banner integrated here
└── package.json                    ← Version stored here
```

## Implementation Details

### Hook (`use-app-updates.ts`)

```tsx
const { 
  checkForUpdates,     // Function to check manually
  checking,            // Is currently checking?
  progress,            // 0-100 progress
  updateInfo,          // Update details
  currentVersion       // Current app version
} = useAppUpdates()
```

Automatically:
- Checks on app launch
- Checks when user returns from background
- Retries if network fails
- Caches results
- Reports events to backend

### Banner (`update-banner.tsx`)

Features:
- Only shows when update available
- Different colors for optional vs critical
- Shows version number
- Progress bar during install
- Disabled state while installing
- Smooth animations

### API Endpoints (in your backend)

**Check Version:**
```
GET /api/app-version
→ Returns latest version, force flag, notes
```

**Report Events:**
```
POST /api/app-update-events
→ Tracks when user checks, downloads, installs
```

## Testing

### Trigger an Update

1. **Change package.json version:**
   ```json
   { "version": "1.1.0" }  // Change this
   ```

2. **Update backend to return new version:**
   ```javascript
   // In your API
   latestVersion: "1.1.0"
   ```

3. **Launch app** → Banner should appear

### Test Critical Update

```javascript
// In your API
forceUpdate: true  // Makes banner red and blocks dismiss
```

### Test Progress

- Watch banner while installing
- Progress bar should move 0-100%
- Should say "Installing..." while processing

## Customization

### Change Banner Colors

Edit `update-banner.tsx`:
```tsx
const containerBg = isCritical ? '#red-color' : '#your-primary'
```

### Change Check Interval

Edit `use-app-updates.ts`:
```tsx
const CHECK_INTERVAL = 1000 * 60 * 30  // Check every 30 min
```

### Change Release Notes

Edit your API response:
```json
{
  "releaseNotes": "Your custom message here"
}
```

## Backend API Implementation

### Minimal Implementation

```javascript
// pages/api/app-version.js
export default (req, res) => {
  res.json({
    latestVersion: "1.2.0",
    forceUpdate: false,
    releaseNotes: "Bug fixes and improvements"
  })
}
```

### With Database

```javascript
async function getLatestVersion() {
  const version = await db.appVersions.findOne()
  return {
    latestVersion: version.number,
    forceUpdate: version.isForceUpdate,
    releaseNotes: version.notes,
    downloadUrl: version.storeLink
  }
}
```

## User Experience Flow

```
User Opens App
    ↓
"Checking for updates..." (silent)
    ↓
Update found? → Show Banner
    ↓
User Sees "Update Available"
    ↓
User Taps "Install"
    ↓
Banner Shows Progress (0-100%)
    ↓
Download Complete → "Installing..."
    ↓
App Restarts → New Version Runs
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Banner not showing | Check API endpoint, ensure new version exists |
| Progress stuck | Check network, see console logs |
| Force update not working | Set `forceUpdate: true` in API |
| Can't dismiss | Good - only critical updates are non-dismissable |
| Update too slow | Check network speed, device storage |

## Monitoring

Track from your backend:
- How many users update within 24hrs
- Which versions are still in use
- Force update compliance rate
- Failed update attempts

Example queries:
```sql
SELECT version, COUNT(*) as users FROM app_versions GROUP BY version
SELECT COUNT(*) FROM update_events WHERE event='update_installed'
```

## Security Considerations

- Updates are cryptographically verified by Expo
- No sensitive data in update checks
- Version numbers don't leak user info
- Update events logged for analytics only

## Version Numbering

Use semantic versioning: `major.minor.patch`

```
1.0.0 → First release
1.0.1 → Bug fix (small update)
1.1.0 → New feature (minor update)
2.0.0 → Major changes (big update)
```

## Best Practices

1. **Always include release notes** - Let users know what changed
2. **Test on real devices** - Simulators don't show OTA updates
3. **Start optional** - Release as optional first, then force if needed
4. **Monitor adoption** - Track how many users update
5. **Use force sparingly** - Only for security/critical bugs
6. **Announce updates** - Tell users about major changes via notifications

## Next Steps

1. **Implement backend API** - Create `/api/app-version` endpoint
2. **Test locally** - Change version and test banner
3. **Deploy to production** - Use Expo publish or app store
4. **Monitor** - Track update adoption
5. **Iterate** - Gather feedback and improve

## Files to Know

- **use-app-updates.ts** - How updates are detected and checked
- **update-banner.tsx** - What users see
- **api.ts** - API client for version checking
- **_layout.tsx** - Where banner is mounted (line 124)
- **app.json** - Expo configuration

## Key Variables

```tsx
// In useAppUpdates hook
currentVersion      // App's current version (from package.json)
latestVersion       // Latest available version (from API)
hasUpdate           // true if latestVersion > currentVersion
isForceUpdate       // true if critical update required
progress            // 0-100 during installation
checking            // true while checking/installing
```

## Support

If update system isn't working:

1. Check `[v0]` console logs for errors
2. Verify API endpoint is accessible
3. Verify latest version in API > current version
4. Check device has internet connection
5. Check device storage space
6. Try restart app completely

---

**Status**: ✅ **IMPLEMENTED AND READY**

Users will automatically see updates in-app without needing to visit Expo or app store!