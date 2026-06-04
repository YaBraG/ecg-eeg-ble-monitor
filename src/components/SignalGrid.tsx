import { StyleSheet, Text, View } from 'react-native';

import { SignalChannel } from '../types/signal';
import { ChannelWaveform } from './ChannelWaveform';

type SignalGridProps = {
  channels: SignalChannel[];
};

export function SignalGrid({ channels }: SignalGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>20-Channel Signal Preview</Text>
        <Text style={styles.subtitle}>Generated mock values update continuously.</Text>
      </View>
      <View style={styles.grid}>
        {channels.map((channel) => (
          <ChannelWaveform key={channel.id} channel={channel} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
  },
  grid: {
    gap: 10,
  },
  header: {
    gap: 2,
  },
  subtitle: {
    color: '#667085',
    fontSize: 14,
  },
  title: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '800',
  },
});
