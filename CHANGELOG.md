# Changelog

## 2026-06-09 - Local Android Python/Matplotlib Smoke Test

### Summary

Added a local Android-only Chaquopy smoke test to check whether Python 3.12, NumPy, SciPy, and Matplotlib can run inside the Android app and save a PNG plot.

### Files Changed

Local-only native Android files:

- `android/build.gradle`
- `android/app/build.gradle`
- `android/app/src/main/java/com/yabrag/ecgeeegblemonitor/MainActivity.kt`
- `android/app/src/main/python/chaquopy_smoke_test.py`

Tracked documentation files:

- `docs/ANDROID_PYTHON_SMOKE_TEST.md`
- `README.md`
- `CHANGELOG.md`

### Commands Run

- `npm run typecheck`
- `npm run lint`
- `adb logcat -c`
- `npm run devbuild:android`
- `adb logcat -s PythonSmokeTest -d`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls files`

### Checks

- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Failed: `npm run devbuild:android` failed during `:app:installDebugPythonRequirements` because no SciPy distribution was available for the Chaquopy Python 3.12 / Android arm64-v8a target.
- Logcat: no `PythonSmokeTest` output was produced because the APK did not install.
- PNG: `chaquopy_matplotlib_test.png` was not generated.

### Known Limitations

- This is a local feasibility smoke test only.
- Full EEG Python package integration is not included.
- EEG analysis logic is not included.
- Native Android changes are local-only because `android/` is ignored by Git.
- Generated PNG files must stay local and should not be committed.

## 2026-06-09 - Clean Main Demo UX

### Summary

Cleaned the main demo UX and removed visible BLE debug controls from user-facing screens. The app now shows a clean reconnecting screen, a single Find EEG Device entry point, a scanning screen with Cancel and device selection, and start options only after a device is connected.

### Files Changed

- `README.md`
- `CHANGELOG.md`
- `src/app/AppRoot.tsx`
- `src/hooks/useBleConnection.ts`
- `src/types/workflow.ts`
- `src/screens/ReconnectingScreen.tsx`
- `src/screens/FindDeviceScreen.tsx`
- `src/screens/ScanningDeviceScreen.tsx`
- `src/screens/ConnectedStartScreen.tsx`
- `src/screens/AcquisitionScreen.tsx`
- `src/screens/StoppedEarlyScreen.tsx`
- `src/screens/ProcessingScreen.tsx`
- `src/screens/ResultScreen.tsx`
- `src/screens/PlotsScreen.tsx`

### Commands Run

- `npm run typecheck`
- `npm run lint`
- `npm run devbuild:android`

### Checks

- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Partial: `npm run devbuild:android` built successfully and installed/opened the debug APK on a connected Android device, then Expo hit a non-interactive prompt because port 8081 was already in use.

### Known Limitations

- Python analysis integration is pending.
- MATLAB/Python algorithm logic is pending.
- Result and plot screens use placeholders.
- Real ESP32 data parsing and live BLE packet handling are future work.
- Mock device discovery remains available internally for development.

## 2026-06-09 - Documentation And UI Wording Cleanup

### Summary

Cleaned README, docs, and UI wording so the project describes the current Android demo app directly with less redundant negative phrasing.

### Files Changed

- `README.md`
- `docs/DEMO_DATA_PLAN.md`
- `docs/COMMUNICATION_PLAN.md`
- `src/app/AppRoot.tsx`
- `src/config/demoConfig.ts`
- `src/services/DemoImportService.ts`
- `CHANGELOG.md`

### Scope

This is wording/config cleanup only. App workflow behavior, TXT import behavior, BLE scanning, and placeholder analysis screens were kept the same.

### Commands Run

- `npm run typecheck`
- `npm run lint`
- `npm run devbuild:android`

### Checks

- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Failed: `npm run devbuild:android` could not continue because no Android device was connected and no emulator could be started automatically.

### Known Limitations

- Python analysis integration is pending.
- MATLAB/Python algorithm logic is pending.
- Result and plot screens use placeholders.
- Real ESP32 data parsing and live BLE packet handling are future work.

## 2026-06-09 - Android EEG Demo TXT Workflow

### Summary

Created the next Android-only EEG demo milestone. The app now has a simple state-driven workflow with reconnecting, find-device, connected/start, acquisition, early stop, processing, result, key plots, and all plots states. Real Python analysis and real MATLAB/Python algorithm logic are still deferred.

### Files Changed

- `.gitignore`
- `app.json`
- `package.json`
- `package-lock.json`
- `README.md`
- `CHANGELOG.md`
- `docs/COMMUNICATION_PLAN.md`
- `docs/DEMO_DATA_PLAN.md`
- `src/app/AppRoot.tsx`
- `src/config/demoConfig.ts`
- `src/constants/channels.ts`
- `src/services/DemoImportService.ts`
- `src/services/ExportService.ts`
- `src/services/RecordingStorageService.ts`
- `src/types/analysis.ts`
- `src/types/protocol.ts`
- `src/types/recording.ts`
- `src/types/workflow.ts`

### New Android-Only Decision

The demo target is Android only. iPhone/iOS support claims, iOS app config, and the iOS npm script were removed for this demo phase.

### New Demo From TXT Workflow

Added a Demo From TXT button that opens Android document selection for a `.txt` file, copies the selected file into app document storage, saves one current recording metadata entry, and proceeds through placeholder processing to the result screen. The demo expects TXT, not ZIP.

### New Assumptions

- Sampling rate is 500 Hz.
- Recording target is 420 seconds.
- First 300 seconds are task/movement protocol.
- Last 120 seconds are no movement / stay still.
- Demo source file name is `sz1_cleaned (5minB 2minA).txt`.
- Source TXT is assumed to be whitespace-delimited numeric data with no header row.
- Source TXT is assumed to have approximately 200,963 rows and 32 columns.
- First 20 columns are used for future analysis.
- All 32 columns are preserved as source metadata.
- A1/A2 are assumed reference electrodes.
- FPZ is assumed to be an EEG data channel.

### Commands Run

- `npx expo install expo-document-picker expo-file-system @react-native-async-storage/async-storage`
- `npm run typecheck`
- `npm run lint`
- `npm run devbuild:android`

### Checks

- Completed: dependency install; npm reported 10 moderate audit findings in installed dependencies.
- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Failed: `npm run devbuild:android` could not continue because no Android device was connected and no emulator could be started automatically.

### Known Limitations

- Real Python analysis is not integrated yet.
- MATLAB/Python algorithm logic is not implemented yet.
- The TXT file is not fully parsed in JavaScript.
- Result and plots are placeholders only.
- Export package creation is a placeholder only.
- Real ESP32 packet parsing and live BLE packets remain future work.

### Next Recommended Steps

- Convert the MATLAB analysis path to Python.
- Define the recording package metadata schema.
- Add Python-side TXT parsing and validation.
- Populate result and plot screens from real Python analysis outputs.
- Test TXT import on a physical Android phone.

## 2026-06-09 - Communication Plan And Early ESP32 BLE Testing Cleanup

### Summary

Added the missing communication-plan documentation, introduced shared scan-rate and transport constants, added placeholder binary packet parsing structure, and improved BLE scanning so early ESP32 devices can be discovered before final service UUID advertising is ready.

### Files Changed

- `docs/COMMUNICATION_PLAN.md`
- `src/constants/channels.ts`
- `src/types/packet.ts`
- `src/utils/packetParser.ts`
- `src/services/BleService.ts`
- `src/hooks/useBleConnection.ts`
- `src/components/DeviceList.tsx`
- `src/types/ble.ts`
- `package.json`
- `README.md`
- `CHANGELOG.md`

### Communication Decision Added

The current live communication plan is binary BLE notifications for 20 ECG/EEG channels at 512 samples per second per channel. CSV should be generated later by the phone app as an export format, not used as the live stream format.

### Commands Run

- Skipped: `npm install` was not needed because no dependencies were added.
- `npm run typecheck`
- `npm run lint`
- `npm run devbuild:android`

### Checks

- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Failed: `npm run devbuild:android` could not continue because no Android device was connected and no emulator could be started automatically.

### Known Limitations

- Real ESP32 binary packet parsing is not implemented yet.
- Final ESP32 packet layout, byte order, checksum, and sample packing still need to be finalized.
- BLE service and characteristic UUIDs are still placeholders.
- Broad BLE scanning is intended for early hardware debugging and may show unrelated BLE devices.
- CSV export is not implemented yet.

### Next Recommended Steps

- Finalize the ESP32 binary packet format.
- Add real packet decoding once firmware packets are available.
- Track sequence numbers and dropped packets in the phone app.
- Add phone-side buffering and UI downsampling for live scans.
- Test BLE throughput on a physical Android phone and consider Wi-Fi fallback if BLE is unreliable.

## 2026-06-04 - Initial Expo BLE Monitor App

### Summary

Created the first working Expo React Native + TypeScript version of the ECG/EEG BLE monitor app. The current milestone displays generated mock test data and includes a beginner-readable BLE connection structure for future ESP32 integration.

### Features Added

- Expo React Native app scaffolded with TypeScript.
- Development-build-compatible setup with `expo-dev-client`.
- BLE service abstraction using `react-native-ble-plx`.
- Android BLE permission request flow.
- BLE scan, stop scan, connect, disconnect, and data subscription placeholder.
- Mock mode for development without Bluetooth hardware.
- Generated 20-channel ECG/EEG-like mock signal feed.
- Scrollable signal display for CH01 through CH20.
- Device list and connection status panel.

### Libraries Added

- `expo-dev-client`
- `react-native-ble-plx`

### Files And Folders Created

- `src/app/AppRoot.tsx`
- `src/components/ChannelWaveform.tsx`
- `src/components/ConnectionPanel.tsx`
- `src/components/DeviceList.tsx`
- `src/components/SignalGrid.tsx`
- `src/components/StatusCard.tsx`
- `src/constants/ble.ts`
- `src/constants/channels.ts`
- `src/hooks/useBleConnection.ts`
- `src/hooks/useMockSignalFeed.ts`
- `src/services/BleService.ts`
- `src/services/MockSignalService.ts`
- `src/types/ble.ts`
- `src/types/signal.ts`
- `src/utils/base64.ts`
- `src/utils/signalBuffer.ts`
- `CHANGELOG.md`

### Commands Run

- `npx create-expo-app@latest <temp-folder> --template blank-typescript`
- `npm install expo-dev-client react-native-ble-plx`
- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run android`

### Checks

- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Completed: `npm install`; npm reported 10 moderate audit findings in installed dependencies.
- Partial: `npm run android` started Metro successfully after native app identifiers were added, then stopped because no Android device was connected and no emulator could be started automatically.

### Known Limitations

- ESP32 service and characteristic UUIDs are placeholders.
- Real BLE data parsing is not implemented.
- Mock signal values are for UI and connection-flow testing only.
- Physical-phone BLE testing has not been completed yet.
- Android launch still requires a connected phone or configured emulator.

### Next Recommended Steps

- Finalize ESP32 firmware BLE UUIDs and update `src/constants/ble.ts`.
- Define the BLE packet format for 20-channel samples.
- Parse characteristic notifications into real channel samples.
- Test scanning and connection on a physical Android phone with a development build.
