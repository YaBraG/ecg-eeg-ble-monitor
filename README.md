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
| Communication plan | 20 channels at 512 Hz for 5-minute scans |
| Real ESP32 streaming | Binary BLE packets planned; parser placeholder only |

## What The App Does Now

- Shows a connection panel with BLE status.
- Supports Mock Mode, Ready, Scanning, Connected, Bluetooth unavailable, and Error states.
- Provides Start Scan, Stop Scan, and Disconnect controls.
- Lists discovered BLE devices.
- Scans broadly for BLE devices during early ESP32 testing.
- Marks devices with the ESP32 name prefix when they are discovered.
- Creates a mock ESP32 device while mock mode is enabled.
- Generates 20 ECG/EEG-like signal channels.
- Displays each channel with its latest numeric value and a small waveform preview.

## Current Communication Plan

The current target is 20 ECG/EEG channels sampled at 512 samples per second per channel for a 5-minute scan. That produces 3,072,000 channel-samples per scan. With raw `int16` samples, the sample payload alone is about 6,144,000 bytes before packet headers and BLE overhead.

The planned live transport is binary BLE notifications. Live CSV streaming is not the main plan because text formatting would waste BLE bandwidth and make high-rate streaming harder to test reliably. CSV export may be added later on the phone side after binary packets have been received and buffered.

The app now includes packet parser placeholder files, but real ESP32 packet parsing is not implemented yet. The ESP32 binary packet format still needs to be finalized, including sequence numbers, timestamps, sample packing, and checksum behavior.

See `docs/COMMUNICATION_PLAN.md` for the current communication plan details.

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
docs/
  COMMUNICATION_PLAN.md  Current live transport and packet planning notes
```

Key files:

| File | Purpose |
| --- | --- |
| `src/app/AppRoot.tsx` | Main screen layout |
| `src/hooks/useBleConnection.ts` | BLE connection state used by the UI |
| `src/services/BleService.ts` | BLE manager, permissions, scan, connect, disconnect, and subscription placeholder |
| `src/services/MockSignalService.ts` | Generated test signal data |
| `src/constants/ble.ts` | ESP32 device prefix and placeholder UUIDs |
| `src/constants/channels.ts` | Channel count, sample rate, scan duration, and transport constants |
| `src/types/packet.ts` | Future binary packet type shape |
| `src/utils/packetParser.ts` | Placeholder BLE packet parser |
| `docs/COMMUNICATION_PLAN.md` | Current communication plan |

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

Build and run the Android development app:

```bash
npm run devbuild:android
```

For BLE testing, install and run a development build on a physical phone. Android emulators are useful for UI checks, but they are not reliable for real Bluetooth Low Energy hardware testing.

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run start` | Start the Expo development server |
| `npm run android` | Start Android through Expo |
| `npm run devbuild:android` | Build and run the native Android development app |
| `npm run ios` | Start iOS through Expo |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run Expo linting when available |

## ESP32 BLE UUIDs

Edit the ESP32 BLE placeholders in:

```text
src/constants/ble.ts
```

Replace `ESP32_SERVICE_UUID` and `ESP32_DATA_CHARACTERISTIC_UUID` after the ESP32 firmware service and characteristic UUIDs are finalized.

The scan currently does not rely only on the placeholder service UUID. It scans broadly so early ESP32 devices can be found before advertising is finalized, then marks devices whose name starts with the configured ESP32 prefix.

## Current Limitations

- Real ESP32 data parsing is not implemented yet.
- Binary BLE packet parsing is a placeholder only.
- BLE UUIDs are placeholders.
- Mock data is generated locally and does not represent calibrated biosignal measurements.
- CSV export is not implemented yet and should be generated later by the phone app, not streamed live from the ESP32.
- Android permissions are included, but real BLE behavior still depends on the phone, OS version, and development build.
- iOS BLE setup has starter permission text only and has not been tested in this milestone.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `adb` not recognized | Install Android Studio platform tools and add them to your PATH. |
| Wrong Java version | Install a JDK version supported by your Android Gradle setup and make sure `JAVA_HOME` points to it. |
| Android SDK missing | Open Android Studio, install the Android SDK, and set `ANDROID_HOME` if your shell cannot find it. |
| Bluetooth permissions | Use a physical phone, enable Bluetooth and Location, and allow the app permissions when prompted. |
