# ECG EEG BLE Monitor

Android-only Expo React Native + TypeScript demo for an EEG workflow.

The current app is a demo milestone. It keeps BLE scanning/connect structure and mock signal display, adds Manual Start, Auto Start, and Demo From TXT workflow buttons, and shows placeholder processing, result, and plot screens. It does not run real Python, MATLAB, or clinical analysis yet.

## Current Status

| Area | Status |
| --- | --- |
| Platform target | Android only |
| iPhone/iOS support | Intentionally removed for this demo phase |
| Data source | Mock data, BLE discovery, or selected demo TXT file |
| Demo import format | `.txt`, not `.zip` |
| Sampling rate assumption | 500 Hz |
| Recording target | 7 minutes total |
| Protocol | First 5 minutes task/movement, last 2 minutes no movement |
| Analysis | Placeholder only; Python integration pending |
| Result and plots | Placeholder demo screens |

## What The App Does Now

- Tries to load one previous/current recording metadata entry on app open.
- Shows a reconnecting state, then a Find EEG Device state if no previous recording exists.
- Keeps current BLE scan/connect/mock behavior for early ESP32 testing.
- Shows Manual Start, Auto Start, and Demo From TXT buttons.
- Lets the user select a `.txt` file from the Android phone with Demo From TXT.
- Copies the selected TXT file into app document storage as the current demo recording.
- Stores metadata for only one previous/current recording.
- Warns that importing a new TXT can overwrite the previous/current recording metadata.
- Shows acquisition, early-stop confirmation, processing placeholder, result, key plots, and all plots screens.
- Keeps generated mock signal previews for development.

## Demo TXT Import

Demo From TXT expects this sample file name:

```text
sz1_cleaned (5minB 2minA).txt
```

The app imports TXT, not ZIP. Do not commit sample TXT files into GitHub. Local raw demo data is ignored with `.gitignore` rules for locations such as `sample-data/*.txt` and `assets/demo/*.txt`.

The current import step only validates lightweight metadata such as file name, extension, size when available, and centralized assumptions. It intentionally does not parse the full large TXT file in JavaScript. Full numeric parsing is deferred to the future Python analysis step after MATLAB-to-Python conversion.

## Current Sample Assumptions

Assumptions are centralized in:

```text
src/config/demoConfig.ts
```

Current assumptions:

- Sampling rate is 500 Hz.
- Demo file has approximately 200,963 rows and 32 columns.
- Source TXT is whitespace-delimited numeric data.
- Source TXT has no header row.
- All 32 source columns are preserved as metadata.
- First 20 columns are used for analysis.
- Columns 21-32 are preserved and reported but not analyzed yet.
- A1/A2 are assumed reference electrodes.
- FPZ is assumed to be an EEG data channel.
- These assumptions are temporary and easy to update.

Current assumed MATLAB channel order:

```text
C3, C4, CZ, F3, F4, F7, F8, FZ, FP1, FP2, FPZ, O1, O2, P3, P4, PZ, T3, T4, T5, T6
```

## Current Communication Plan

The live BLE packet path remains future work. For this demo milestone, the app focuses on Android flow and TXT import. The planned live transport is still binary BLE notifications, not live CSV streaming.

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
  types/               Shared TypeScript types
  utils/               Small helper functions
docs/
  COMMUNICATION_PLAN.md
  DEMO_DATA_PLAN.md
```

Key files:

| File | Purpose |
| --- | --- |
| `src/app/AppRoot.tsx` | Android demo workflow screens |
| `src/config/demoConfig.ts` | Centralized platform, protocol, channel, and assumption values |
| `src/services/DemoImportService.ts` | Document picker TXT import and lightweight validation |
| `src/services/RecordingStorageService.ts` | One-recording metadata storage |
| `src/services/ExportService.ts` | Future export package placeholder |
| `src/hooks/useBleConnection.ts` | BLE connection state used by the UI |
| `src/services/BleService.ts` | BLE manager, permissions, scan, connect, disconnect, and subscription placeholder |

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

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run start` | Start the Expo development server |
| `npm run android` | Start Android through Expo |
| `npm run devbuild:android` | Build and run the native Android development app |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run Expo linting |

## Current Limitations

- Android-only demo phase.
- iPhone/iOS support is intentionally removed for now.
- Real ESP32 data parsing is not implemented yet.
- Python analysis is not integrated yet.
- MATLAB/Python algorithm logic is not implemented yet.
- Result and plots are placeholders only.
- ZIP export is not implemented yet.
- The app imports TXT for demo mode, not ZIP.
- Demo mode is not for clinical decision-making.
