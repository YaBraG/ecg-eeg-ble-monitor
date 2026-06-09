export type ParsedPacket = {
  sequenceNumber: number;
  timestampMs: number;
  sampleCount: number;
  channelCount: number;
  samples: number[];
  checksumValid: boolean;
  rawBytes: number[];
};

export type PacketParseResult = {
  packet: ParsedPacket;
  note: string;
};
