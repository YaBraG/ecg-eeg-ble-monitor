# Communication Plan

This Android demo app targets a 20-channel EEG workflow with local TXT import now and live ESP32 streaming later.

## Target Data Shape

| Item | Value |
| --- | --- |
| Analysis channels | 20 EEG channels |
| Source columns preserved | 32 columns |
| Sample rate | 500 samples per second |
| Total recording target | 420 seconds |
| Task/movement protocol | First 300 seconds |
| No-movement phase | Last 120 seconds |
| Sample format target | Raw `int16` samples for future live packets |
| Future live transport | Binary BLE notifications |

The total target channel-samples for the 20 analyzed channels is:

```text
20 channels * 500 samples/second * 420 seconds = 4,200,000 channel-samples
```

At 2 bytes per `int16` sample, the estimated raw binary sample data size for the 20 analyzed channels is:

```text
4,200,000 channel-samples * 2 bytes = 8,400,000 bytes
```

That estimate excludes packet headers, timestamps, sequence numbers, checksums, BLE overhead, source metadata, and exported analysis files.

## Current Demo Source

The current demo flow accepts the MATLAB-style EEG TXT sample file:

```text
sz1_cleaned (5minB 2minA).txt
```

The current sample assumptions are centralized in `src/config/demoConfig.ts`.

## Recommended Future Live Transport

The recommended live streaming transport is binary BLE notifications.

Binary packets are a good fit for live BLE streaming because they keep each sample compact. CSV export can be generated later by the phone app after it has received and buffered binary samples.

## Packet Requirements

The final ESP32 binary packet format still needs to be finalized, but each packet should include:

- Sequence number
- Timestamp or timing reference
- Sample count
- Channel count
- Packed `int16` samples
- Checksum or another integrity check

Sequence numbers are required so the phone can detect missed or out-of-order BLE notifications. Dropped-packet detection should be visible in the app during testing so early firmware or throughput issues surface quickly.

## Phone App Requirements

The phone app should buffer incoming packets before updating the UI. The UI should downsample or batch chart updates so the app remains responsive while still preserving the received data for later export.

Phone-side buffering also gives the app a place to track sequence numbers, detect dropped packets, and prepare a CSV export later.

## BLE Throughput Fallback

BLE binary notifications remain the preferred first live transport to test. If BLE throughput testing is unreliable for the full 20-channel, 500 Hz target, Wi-Fi should be considered as a fallback transport for live scans.
