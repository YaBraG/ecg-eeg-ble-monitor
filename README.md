# ECG EEG BLE Monitor

A first Expo React Native + TypeScript milestone for a 20-channel ECG/EEG Bluetooth Low Energy monitor.

The app currently runs in mock mode, displays generated ECG/EEG-like test signals, and includes a clean BLE service structure for a future ESP32 firmware connection.

## Current Status

| Area | Status |
| --- | --- |
| App framework | Expo React Native with TypeScript |
| BLE approach | Development build with `react-native-ble-plx` |
| Data source | Generated mock data |
| Channels shown | 20 channels, CH01 through CH20 |
| Real ESP32 streaming | Placeholder structure only |

## What The App Does Now

- Shows a connection panel with BLE status.
- Supports Mock Mode, Ready, Scanning, Connected, Bluetooth unavailable, and Error states.
- Provides Start Scan, Stop Scan, and Disconnect controls.
- Lists discovered BLE devices.
- Creates a mock ESP32 device while mock mode is enabled.
- Generates 20 ECG/EEG-like signal channels.
- Displays each channel with its latest numeric value and a small waveform preview.

## Current Architecture

```text
src/
  app/                 App screen composition
  components/          Reusable UI pieces
  constants/           BLE UUIDs and channel settings
  hooks/               React state hooks for BLE and mock data
  services/            BLE and mock signal services
  types/               Shared TypeScript types
  utils/               Small helper functions
```

Key files:

| File | Purpose |
| --- | --- |
| `src/app/AppRoot.tsx` | Main screen layout |
| `src/hooks/useBleConnection.ts` | BLE connection state used by the UI |
| `src/services/BleService.ts` | BLE manager, permissions, scan, connect, disconnect, and subscription placeholder |
| `src/services/MockSignalService.ts` | Generated test signal data |
| `src/constants/ble.ts` | ESP32 device prefix and placeholder UUIDs |

## Required Installs

- Node.js and npm
- Android Studio with Android SDK for Android development
- Java version compatible with the installed Android Gradle tooling
- A physical Android phone for real BLE testing

Expo Go will not work for BLE in this project because `react-native-ble-plx` is a native module. Use an Expo development build instead.

## Clone And Install

```bash
git clone https://github.com/YaBraG/ecg-eeg-ble-monitor.git
cd ecg-eeg-ble-monitor
npm install
```

## Run The App

Start the Expo development server:

```bash
npm run start
```

Run Android:

```bash
npm run android
```

For BLE testing, install and run a development build on a physical phone. Android emulators are useful for UI checks, but they are not reliable for real Bluetooth Low Energy hardware testing.

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run start` | Start the Expo development server |
| `npm run android` | Start Android through Expo |
| `npm run ios` | Start iOS through Expo |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run Expo linting when available |

## ESP32 BLE UUIDs

Edit the ESP32 BLE placeholders in:

```text
src/constants/ble.ts
```

Replace `ESP32_SERVICE_UUID` and `ESP32_DATA_CHARACTERISTIC_UUID` after the ESP32 firmware service and characteristic UUIDs are finalized.

## Current Limitations

- Real ESP32 data parsing is not implemented yet.
- BLE UUIDs are placeholders.
- Mock data is generated locally and does not represent calibrated biosignal measurements.
- Android permissions are included, but real BLE behavior still depends on the phone, OS version, and development build.
- iOS BLE setup has starter permission text only and has not been tested in this milestone.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `adb` not recognized | Install Android Studio platform tools and add them to your PATH. |
| Wrong Java version | Install a JDK version supported by your Android Gradle setup and make sure `JAVA_HOME` points to it. |
| Android SDK missing | Open Android Studio, install the Android SDK, and set `ANDROID_HOME` if your shell cannot find it. |
| Bluetooth permissions | Use a physical phone, enable Bluetooth and Location, and allow the app permissions when prompted. |
