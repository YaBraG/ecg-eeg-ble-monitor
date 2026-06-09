# Changelog

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
