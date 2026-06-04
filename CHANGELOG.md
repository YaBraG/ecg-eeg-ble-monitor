# Changelog

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
