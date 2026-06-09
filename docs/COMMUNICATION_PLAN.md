# Communication Plan

This app is targeting a 20-channel ECG/EEG monitor that streams live samples from an ESP32 to a phone.

## Target Data Shape

| Item | Value |
| --- | --- |
| Channels | 20 ECG/EEG channels |
| Sample rate | 512 samples per second per channel |
| Scan duration target | 5 minutes |
| Total channel-samples per scan | 3,072,000 |
| Sample format | Raw `int16` samples |
| Recommended live transport | Binary BLE notifications |

The total channel-samples per scan is:

```text
20 channels * 512 samples/second * 300 seconds = 3,072,000 channel-samples
```

At 2 bytes per `int16` sample, the estimated raw binary sample data size is:

```text
3,072,000 channel-samples * 2 bytes = 6,144,000 bytes
```

That is about 5.86 MiB before packet headers, timestamps, sequence numbers, checksums, BLE overhead, or exported file metadata.

## Recommended Live Transport

The recommended live transport is binary BLE notifications.

Binary packets are a better fit for live BLE streaming because they keep each sample compact. CSV is text, so every number needs multiple characters plus separators and line endings. That extra size increases BLE bandwidth pressure and makes dropped data more likely during a high-rate 20-channel scan.

Live CSV streaming is not recommended for this version. CSV should be generated later by the phone app as an export format after the phone has received and buffered binary samples.

## Packet Requirements

The final ESP32 binary packet format still needs to be finalized, but each packet should include:

- Sequence number
- Timestamp or timing reference
- Sample count
- Channel count
- Packed `int16` samples
- Checksum or another integrity check

Sequence numbers are required so the phone can detect missed or out-of-order BLE notifications. Dropped-packet detection should be visible in the app during testing so early firmware or throughput issues are not hidden.

## Phone App Requirements

The phone app should buffer incoming packets before updating the UI. It should not redraw the charts at 512 frames per second. Instead, the UI should downsample or batch updates so the app remains responsive while still preserving the received data for later export.

Phone-side buffering also gives the app a place to track sequence numbers, detect dropped packets, and prepare a CSV export later.

## BLE Throughput Fallback

BLE binary notifications are the preferred first transport to test. If BLE throughput testing is unreliable for the full 20-channel, 512 Hz target, Wi-Fi should be considered as a fallback transport for live scans.
