import { StyleSheet, Text, View } from 'react-native';

import { BleStatus } from '../types/ble';

const STATUS_LABELS: Record<BleStatus, string> = {
  mock: 'Mock Mode',
  unavailable: 'Bluetooth unavailable',
  ready: 'Ready',
  scanning: 'Scanning',
  connected: 'Connected',
  error: 'Error',
};

const STATUS_COLORS: Record<BleStatus, string> = {
  mock: '#2f6f73',
  unavailable: '#8a4b15',
  ready: '#256b35',
  scanning: '#325c9c',
  connected: '#1f7a4d',
  error: '#a23232',
};

type StatusCardProps = {
  status: BleStatus;
  detail?: string | null;
};

export function StatusCard({ status, detail }: StatusCardProps) {
  return (
    <View style={[styles.container, { borderLeftColor: STATUS_COLORS[status] }]}>
      <Text style={styles.label}>BLE Status</Text>
      <Text style={[styles.status, { color: STATUS_COLORS[status] }]}>{STATUS_LABELS[status]}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderLeftWidth: 5,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  detail: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  label: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
});
