import { CHANNEL_NAMES, SAMPLE_BUFFER_SIZE } from '../constants/channels';
import { SignalChannel } from '../types/signal';
import { appendSample, createEmptySamples } from '../utils/signalBuffer';

export function createInitialChannels(): SignalChannel[] {
  return CHANNEL_NAMES.map((name) => ({
    id: name,
    name,
    latestValue: 0,
    samples: createEmptySamples(SAMPLE_BUFFER_SIZE),
  }));
}

export function createNextMockChannels(channels: SignalChannel[], tick: number): SignalChannel[] {
  return channels.map((channel, index) => {
    const ecgPulse = Math.sin((tick + index * 3) / 4) > 0.92 ? 420 : 0;
    const eegWave = Math.sin((tick + index * 6) / (9 + index * 0.25)) * 85;
    const slowDrift = Math.sin((tick + index) / 36) * 22;
    const smallNoise = Math.sin((tick * 1.7 + index * 11) / 2.8) * 12;
    const nextValue = Math.round(ecgPulse + eegWave + slowDrift + smallNoise);

    return {
      ...channel,
      latestValue: nextValue,
      samples: appendSample(channel.samples, nextValue, SAMPLE_BUFFER_SIZE),
    };
  });
}
