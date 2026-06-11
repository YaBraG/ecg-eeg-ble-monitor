# Changelog

## 2026-06-11 - Remove Temporary Android Startup Analysis Hook

### Summary

Removed the temporary Android app-startup EEG analysis hook after the Android/Chaquopy analysis test passed.

### Files Changed

- `android/app/src/main/java/com/yabrag/ecgeeegblemonitor/MainActivity.kt`
- `docs/ANDROID_EEG_ANALYSIS_TEST_REPORT.txt`
- `CHANGELOG.md`

### Notes

- Kept Chaquopy Gradle setup.
- Kept `android/app/src/main/python/eeg_analysis/`.
- Kept `android/app/src/main/python/mobile_analysis_runner.py`.
- Kept NumPy and Matplotlib Chaquopy dependencies.
- Future app behavior should call Python after Import EEG TXT through a real integration path.

### Commands Run

- `npm run typecheck`
- `npm run lint`
- `.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a`

### Checks

- Passed: `npm run typecheck`.
- Passed: `npm run lint`.
- Passed: Android debug assemble with Chaquopy still configured.

### Known Limitations

- React Native UI integration was not added.
- Native bridge integration was not added.
- Native Android changes remain local-only because `android/` is ignored by Git.

## 2026-06-11 - Android EEG Analysis Retest After Python Fixes

### Summary

Reran the local Android/Chaquopy EEG analysis test with the sandbox file name `current-demo-recording.txt` after the Python event-timing and NumPy compatibility fixes.

### Files Changed

- `CHANGELOG.md`
- `docs/ANDROID_EEG_ANALYSIS_TEST_REPORT.txt`

Local-only or ignored test files:

- `android/app/src/main/java/com/yabrag/ecgeeegblemonitor/MainActivity.kt`
- `android-analysis-test-output/analysis_summary.json`
- `android-analysis-test-output/event_group_a_vs_b_time_domain.png`
- `android-analysis-test-output/eeg_analysis_logcat.txt`
- `docs/current-demo-recording.txt`

### Commands Run

- `adb devices`
- `adb push docs/current-demo-recording.txt /data/local/tmp/current-demo-recording.txt`
- `adb shell run-as com.yabrag.ecgeeegblemonitor cp /data/local/tmp/current-demo-recording.txt files/current-demo-recording.txt`
- `.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a`
- `adb install -r .\app\build\outputs\apk\debug\app-debug.apk`
- `adb shell monkey -p com.yabrag.ecgeeegblemonitor 1`
- `adb logcat -s EegAnalysisTest -d`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output/plots/key`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output/plots/all`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output/exports`

### Checks

- Passed: debug APK build.
- Passed: APK install.
- Passed: app launch.
- Passed: `EegAnalysisTest` returned `success: true`.
- Passed: no filename or `sz1` warning.
- Passed: no NumPy trapezoid warning.
- Passed: event window exists.
- Passed: 8 key plots and 6 all plots were generated.
- Passed: required event plots, PSD/bandpower plots, and debug export ZIP exist.

### Known Limitations

- This is still a temporary local Android startup test hook.
- React Native UI integration was not added.
- A native module bridge was not added.
- Native Android changes are local-only because `android/` is ignored by Git.
- Raw TXT files and generated outputs remain ignored by Git.

## 2026-06-11 - Config-Driven EEG Event Analysis

### Summary

Updated the local EEG Python analysis package so event/protocol analysis is driven by configuration instead of the input file name, then verified the analysis with an arbitrary TXT filename.

### Files Changed

- `android/app/src/main/python/eeg_analysis/config.py`
- `android/app/src/main/python/eeg_analysis/features.py`
- `android/app/src/main/python/eeg_analysis/io.py`
- `android/app/src/main/python/eeg_analysis/pipeline.py`
- `README.md`
- `run_demo_analysis.py`
- `docs/LOCAL_ARBITRARY_FILENAME_ANALYSIS_REPORT.txt`

### Commands Run

- `py -3.12 run_demo_analysis.py "<input txt>" "<output folder>"`
- `py -3.12 -m compileall -q run_demo_analysis.py android\app\src\main\python\eeg_analysis android\app\src\main\python\mobile_analysis_runner.py`
- `rg -n "sz1|filename contains|eventMapping|np\.trapezoid|numpy\.trapezoid|scipy|from scipy|import scipy" android\app\src\main\python -g "*.py" -g "!**/__pycache__/**" --no-ignore`
- `rg -n "scipy|from scipy|import scipy" android\app\src\main\python -g "*.py" -g "!**/__pycache__/**" --no-ignore`

### Checks

- Passed: `python run_demo_analysis.py "<input txt>" "<output folder>"` completed with exit code 0.
- Passed: Python compile check completed.
- Passed: arbitrary filename analysis completed with `analysisComplete: true`.
- Passed: event window was created from config.
- Passed: event plots were generated.
- Passed: PSD and bandpower plots were generated.
- Passed: debug export ZIP was generated.
- Passed: no SciPy imports exist in the Python package.

### Known Limitations

- This was a local Python package test only.
- Android startup code, Gradle, ADB, and React Native UI were not touched.
- The copied TXT sample and generated analysis outputs remain local ignored files.

## 2026-06-11 - Local Android EEG Analysis Test Report

### Summary

Ran a local Android/Chaquopy EEG analysis integration test using the local TXT sample and generated a report for review.

### Files Changed

Tracked files:

- `.gitignore`
- `CHANGELOG.md`
- `docs/ANDROID_EEG_ANALYSIS_TEST_REPORT.txt`

Local-only native Android files:

- `android/app/src/main/java/com/yabrag/ecgeeegblemonitor/MainActivity.kt`

Local ignored output files:

- `android-analysis-test-output/analysis_summary.json`
- `android-analysis-test-output/recording_overview_selected_channels.png`
- `android-analysis-test-output/ANDROID_EEG_ANALYSIS_TEST_REPORT.txt`

### Commands Run

- `npm run typecheck`
- `npm run lint`
- `adb push "docs\sz1_cleaned (5minB 2minA).txt" /data/local/tmp/current-demo-recording.txt`
- `adb shell run-as com.yabrag.ecgeeegblemonitor cp /data/local/tmp/current-demo-recording.txt files/current-demo-recording.txt`
- `.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a`
- `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`
- `adb shell monkey -p com.yabrag.ecgeeegblemonitor 1`
- `adb logcat -s EegAnalysisTest -d`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output/plots/key`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output/plots/all`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -lh files/eeg_analysis_output/exports`

### Checks

- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Passed: direct Gradle Android debug assemble.
- Passed: ADB install.
- Passed: `EegAnalysisTest` returned `success: true`.
- Passed: `analysis_summary.json` exists.
- Passed: `debug_export_package.zip` exists.
- Passed: key and all plot PNGs were generated.

### Known Limitations

- This was a temporary local startup test hook in `MainActivity.kt`.
- React Native UI integration was not added.
- React Native bridge was not added.
- Event/ictal analysis was skipped because the sandbox filename did not include `sz1`.
- PSD/bandpower plots were skipped because the mobile NumPy version reported no `numpy.trapezoid` attribute.
- Native Android changes are local-only because `android/` is ignored by Git.
- Raw EEG TXT data and generated outputs remain ignored by Git.

## 2026-06-09 - Remove SciPy From Local Android Smoke Test

### Summary

Removed SciPy from the local Chaquopy smoke test to isolate Python 3.12, NumPy, and Matplotlib feasibility after the first Gradle build failed with no matching SciPy distribution.

### Files Changed

Local-only native Android files:

- `android/app/build.gradle`
- `android/app/src/main/python/chaquopy_smoke_test.py`

Tracked documentation files:

- `docs/ANDROID_PYTHON_SMOKE_TEST.md`
- `CHANGELOG.md`

### Commands Run

- `npm run typecheck`
- `npm run lint`
- `npm run devbuild:android`
- `.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a`
- `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`
- `adb shell monkey -p com.yabrag.ecgeeegblemonitor 1`
- `adb logcat -s PythonSmokeTest -d`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls files`
- `adb shell run-as com.yabrag.ecgeeegblemonitor ls -l files/chaquopy_matplotlib_test.png`

### Checks

- Passed: `npm run typecheck`
- Passed: `npm run lint`
- Blocked at first: `npm run devbuild:android` could not start while the phone was disconnected.
- Timed out after reconnect: `npm run devbuild:android` did not return cleanly, so the debug APK was installed and launched with ADB after a direct Gradle assemble.
- Passed: direct Gradle debug assemble completed successfully with SciPy removed.
- Passed: ADB install completed successfully.
- Passed: `PythonSmokeTest` Logcat result reported `success: true`, NumPy `1.26.2`, Matplotlib `3.8.2`, and output path `/data/user/0/com.yabrag.ecgeeegblemonitor/files/chaquopy_matplotlib_test.png`.
- Passed: `chaquopy_matplotlib_test.png` exists in the app files directory.
- Toast: expected `Python smoke test passed` from the success code path; a programmatic UI dump did not capture the transient Toast text.

### Known Limitations

- This is still a local feasibility smoke test only.
- Full EEG Python package integration is not included.
- EEG analysis logic is not included.
- SciPy remains excluded from this smoke test because the Chaquopy Python 3.12 / Android arm64-v8a package install failed.
- Native Android changes are local-only because `android/` is ignored by Git.

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
