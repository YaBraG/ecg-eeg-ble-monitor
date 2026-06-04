export const CHANNEL_COUNT = 20;
export const SAMPLE_BUFFER_SIZE = 64;

export const CHANNEL_NAMES = Array.from({ length: CHANNEL_COUNT }, (_, index) =>
  `CH${String(index + 1).padStart(2, '0')}`,
);
