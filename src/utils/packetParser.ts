import { CHANNEL_COUNT } from '../constants/channels';
import { ParsedPacket, PacketParseResult } from '../types/packet';
import { decodeBase64ToBytes } from './base64';

const PACKET_FORMAT_NOTE =
  'Placeholder parser only. Final ESP32 binary packet layout, byte order, checksum, and sample packing still need to be finalized.';

export function parseBlePacket(base64Value: string): PacketParseResult {
  const rawBytes = decodeBase64ToBytes(base64Value);

  // Planned live data path:
  // - ESP32 sends compact binary BLE notifications.
  // - Each packet includes a sequence number so the phone can detect dropped packets.
  // - CSV live parsing is intentionally not the main plan because it wastes BLE bandwidth.
  // - CSV should be generated later by the phone app as an export format.
  //
  // This placeholder keeps the future packet shape visible without pretending the
  // current app can parse real ESP32 samples yet.
  const packet: ParsedPacket = {
    sequenceNumber: 0,
    timestampMs: Date.now(),
    sampleCount: 0,
    channelCount: CHANNEL_COUNT,
    samples: [],
    checksumValid: false,
    rawBytes,
  };

  return {
    packet,
    note: PACKET_FORMAT_NOTE,
  };
}
