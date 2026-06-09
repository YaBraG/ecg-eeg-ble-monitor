import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SignalGrid } from '../components/SignalGrid';
import { SignalChannel } from '../types/signal';

type AcquisitionScreenProps = {
  channels: SignalChannel[];
  elapsedLabel: string;
  phaseLabel: string;
  targetLabel: string;
  onStop: () => void;
};

export function AcquisitionScreen({
  channels,
  elapsedLabel,
  phaseLabel,
  targetLabel,
  onStop,
}: AcquisitionScreenProps) {
  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.title}>Recording</Text>
        <Text style={styles.timerText}>
          {elapsedLabel} / {targetLabel}
        </Text>
        <Text style={styles.description}>Phase: {phaseLabel}</Text>
        <View style={styles.metricGrid}>
          <MetricCard label="Packets" value="Pending" />
          <MetricCard label="Dropped packets" value="0 placeholder" />
          <MetricCard label="Signal quality" value="Placeholder" />
        </View>
        <Pressable style={styles.stopButton} onPress={onStop}>
          <Text style={styles.stopButtonText}>Stop</Text>
        </Pressable>
      </View>
      <SignalGrid channels={channels} />
    </View>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    margin: 16,
    padding: 18,
  },
  description: {
    color: '#475467',
    fontSize: 15,
    lineHeight: 22,
  },
  metricCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e4e7ec',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
    padding: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricLabel: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  stopButton: {
    alignItems: 'center',
    backgroundColor: '#a23232',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  timerText: {
    color: '#1f6f7a',
    fontSize: 34,
    fontWeight: '900',
  },
  title: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
  },
});
