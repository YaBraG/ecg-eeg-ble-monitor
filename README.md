# ECG EEG BLE Monitor

Android EEG demo app built with Expo React Native and TypeScript.

The current app supports a clean device-first demo workflow, generated mock signal previews, Android EEG TXT import, and placeholder processing/result/plot screens.

## Current Status

| Area | Status |
| --- | --- |
| Platform target | Android demo app |
| Data source | Mock data, BLE discovery, or imported EEG TXT sample |
| Demo import | Accepts EEG TXT sample files |
| Stored recording | One current recording |
| Sampling rate assumption | 500 Hz |
| Recording target | 7 minutes total |
| Protocol | First 5 minutes task/movement, last 2 minutes no movement |
| Analysis | Placeholder flow; Python integration pending |
| Result and plots | Placeholder demo screens |

## What The App Does Now

- Shows a clean reconnecting screen while loading current recording metadata.
- Shows a Find EEG Device screen with one visible scan entry point.
- Shows a clean scanning screen with a Cancel button and discovered device list.
- Hides low-level BLE controls from the main demo UI.
- Shows Manual Start, Auto Start, and Import EEG TXT only after a device is connected.
- Provides a Disconnect button on the connected screen.
- Lets the user select an EEG TXT sample file from the Android device.
- Copies the selected TXT file into app document storage as the current demo recording.
- Stores one current recording metadata entry.
- Warns before a new import overwrites the current recording metadata.
- Shows acquisition, early-stop confirmation, processing placeholder, result, key plots, and all plots screens.
- Keeps generated mock signal previews for development.

## User Flow

```text
Connecting to EEG device...
Find EEG Device
Looking for EEG device...
EEG Device Connected
Start Recording
Recording
Processing
Result
Key Plots / All Plots
```

The Find EEG Device button is the only user-facing scan entry point. Internal scan controls, mock toggles, BLE status debug cards, and always-visible discovered-device panels stay out of the main demo screens.

## Import EEG TXT

The expected demo sample file name is:

```text
sz1_cleaned (5minB 2minA).txt
```

Demo import accepts EEG TXT sample files. Large EEG sample files stay local and are ignored by Git with rules for paths such as `sample-data/*.txt` and `assets/demo/*.txt`.

The current import step validates lightweight metadata such as file name, extension, size when available, and centralized assumptions. Full numeric parsing is deferred to the future Python analysis step after MATLAB-to-Python conversion.

## Current Sample Assumptions

Assumptions are centralized in:

```text
src/config/demoConfig.ts
```

Current assumptions:

- Sampling rate is 500 Hz.
- Demo file has approximately 200,963 rows and 32 columns.
- Demo file duration is approximately 401.926 seconds.
- Source TXT is whitespace-delimited numeric data.
- Source TXT has no header row.
- All 32 source columns are preserved as metadata.
- First 20 columns are used for analysis.
- Columns 21-32 are preserved and reported for future analysis work.
- A1/A2 are assumed reference electrodes.
- FPZ is assumed to be an EEG data channel.
- These assumptions are temporary and easy to update.

Current assumed MATLAB channel order:

```text
C3, C4, CZ, F3, F4, F7, F8, FZ, FP1, FP2, FPZ, O1, O2, P3, P4, PZ, T3, T4, T5, T6
```

## Current Communication Plan

The live BLE packet path remains future work. For this demo milestone, the app focuses on Android workflow, local EEG TXT import, and placeholder analysis screens. The planned live transport is binary BLE notifications.

See:

- `docs/COMMUNICATION_PLAN.md`
- `docs/DEMO_DATA_PLAN.md`

## Current Architecture

```text
src/
  app/                 State-driven demo screen composition
  components/          Existing BLE and signal UI pieces
  config/              Centralized demo assumptions
  constants/           BLE UUIDs and channel constants
  hooks/               React state hooks for BLE and mock data
  services/            BLE, mock data, TXT import, storage, and export placeholders
  screens/             Clean user-facing workflow screens
  types/               Shared TypeScript types
  utils/               Small helper functions
docs/
  COMMUNICATION_PLAN.md
  DEMO_DATA_PLAN.md
```

Key files:

| File | Purpose |
| --- | --- |
| `src/app/AppRoot.tsx` | Android demo workflow state orchestration |
| `src/screens/` | Clean user-facing workflow screens |
| `src/config/demoConfig.ts` | Centralized platform, protocol, channel, and assumption values |
| `src/services/DemoImportService.ts` | Document picker TXT import and lightweight validation |
| `src/services/RecordingStorageService.ts` | Current recording metadata storage |
| `src/services/ExportService.ts` | Future export package placeholder |
| `src/hooks/useBleConnection.ts` | BLE connection state used by the UI |
| `src/services/BleService.ts` | BLE manager, permissions, scan, connect, disconnect, and subscription placeholder |

## Required Installs

- Node.js and npm
- Android Studio with Android SDK for Android development
- Java version compatible with the installed Android Gradle tooling
- A physical Android phone for BLE testing

Use an Expo development build for BLE because `react-native-ble-plx` is a native module.

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

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run start` | Start the Expo development server |
| `npm run android` | Start Android through Expo |
| `npm run devbuild:android` | Build and run the native Android development app |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run Expo linting |

## Current Limitations

- Python analysis integration is pending.
- MATLAB/Python algorithm logic is pending.
- Result and plot screens use placeholders.
- Real ESP32 data parsing and live BLE packet handling are future work.
- Demo mode is for workflow testing and clinical review language only.
