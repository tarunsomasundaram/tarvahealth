# Building Tarva as a native Android & iOS app (Capacitor)

The project is configured with Capacitor 8 and native BLE (`@capacitor-community/bluetooth-le`).

## 1. Get the code locally
1. Export the project to GitHub (Lovable → GitHub → Export), then `git clone` it.
2. `npm install`

## 2. Add the native platforms
```bash
npx cap add android
npx cap add ios      # macOS + Xcode only
```

## 3. Build the web bundle and sync
```bash
npm run build
npx cap sync
```
Run `git pull && npm install && npx cap sync` again after every change made in Lovable.

## 4. Run it
```bash
npx cap run android   # requires Android Studio
npx cap run ios       # requires macOS + Xcode
```
Or open the IDE directly: `npx cap open android` / `npx cap open ios`.

### Building an APK
In Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**.
The APK lands in `android/app/build/outputs/apk/debug/`.
For release, create a keystore and use **Build → Generate Signed Bundle / APK**.

## 5. Live reload during development
`capacitor.config.ts` points `server.url` at the Lovable sandbox preview, so the
native shell loads the hosted app and hot-reloads. **Remove the whole `server`
block before shipping to the App Store / Play Store** so the app runs the bundled
`dist/` build.

## 6. Required native permissions
These must be added once after `npx cap add ...` (Capacitor does not add them for you).

### Android — `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

### iOS — `ios/App/App/Info.plist`
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Tarva connects to your smart pill case to detect when you take a dose.</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Tarva connects to your smart pill case to detect when you take a dose.</string>
<key>UIBackgroundModes</key>
<array>
  <string>bluetooth-central</string>
</array>
```

## 7. BLE GATT contract
Defined in `src/lib/bleCase.ts` — update the UUIDs to match the case firmware:

| UUID | Purpose |
| --- | --- |
| `0000fee0-…` | Tarva case service |
| `0000fee1-…` | Case open/close events (notify): byte 0 = 1 open / 0 close, byte 1 = compartment |
| `0000fee2-…` | Status (read + notify): byte 0 = battery %, byte 1 = lid state |

Case-open notifications feed `useBleCase` → `useCaseDevice.handleCaseOpen`, which
runs the existing auto-mark logic (15–90 min window, `CASE_OPEN_AUTO`) and silences alarms.

Read more: https://lovable.dev/blogs/TODO
