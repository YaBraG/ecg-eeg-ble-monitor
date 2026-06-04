import { StyleSheet, Text, View } from 'react-native';

import { SignalChannel } from '../types/signal';

type ChannelWaveformProps = {
  channel: SignalChannel;
};

export function ChannelWaveform({ channel }: ChannelWaveformProps) {
  const min = Math.min(...channel.samples);
  const max = Math.max(...channel.samples);
  const range = Math.max(max - min, 1);
  const previewSamples = channel.samples.filter((_, index) => index % 2 === 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{channel.name}</Text>
        <Text style={styles.value}>{channel.latestValue}</Text>
      </View>
      <View style={styles.waveform}>
        {previewSamples.map((sample, index) => {
          const height = 8 + ((sample - min) / range) * 48;

          return <View key={`${channel.id}-${index}`} style={[styles.bar, { height }]} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#1f6f7a',
    borderRadius: 2,
    width: 3,
  },
  container: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  header: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  value: {
    color: '#325c9c',
    fontVariant: ['tabular-nums'],
    fontSize: 16,
    fontWeight: '800',
  },
  waveform: {
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 2,
    height: 64,
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
});
