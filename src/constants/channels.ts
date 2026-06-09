export const CHANNEL_COUNT = 20;
export const SAMPLE_RATE_HZ = 512;
export const SCAN_DURATION_SECONDS = 300;
export const TOTAL_CHANNEL_SAMPLES_PER_SCAN = CHANNEL_COUNT * SAMPLE_RATE_HZ * SCAN_DURATION_SECONDS;
export const SAMPLE_FORMAT = 'int16';
export const TRANSPORT_MODE = 'ble-binary-notifications';
export const SAMPLE_BUFFER_SIZE = 64;

export const CHANNEL_NAMES = Array.from({ length: CHANNEL_COUNT }, (_, index) =>
  `CH${String(index + 1).padStart(2, '0')}`,
);
