import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BleDeviceInfo } from '../types/ble';

type ScanningDeviceScreenProps = {
  devices: BleDeviceInfo[];
  errorMessage?: string | null;
  onCancel: () => void;
  onSelectDevice: (device: BleDeviceInfo) => void;
};

export function ScanningDeviceScreen({
  devices,
  errorMessage,
  onCancel,
  onSelectDevice,
}: ScanningDeviceScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Looking for EEG device...</Text>
      <Text style={styles.description}>Keep the EEG device nearby and powered on.</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.deviceList}>
        {devices.length === 0 ? <Text style={styles.emptyText}>No devices found yet.</Text> : null}
        {devices.map((device) => (
          <Pressable key={device.id} style={styles.deviceRow} onPress={() => onSelectDevice(device)}>
            <View style={styles.deviceText}>
              <Text style={styles.deviceName}>{device.name}</Text>
              {device.isLikelyEsp32 ? <Text style={styles.deviceHint}>Likely EEG device</Text> : null}
            </View>
            <Text style={styles.connectText}>Connect</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.secondaryButton} onPress={onCancel}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </Pressable>
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
  connectText: {
    color: '#1f6f7a',
    fontSize: 13,
    fontWeight: '900',
  },
  description: {
    color: '#475467',
    fontSize: 15,
    lineHeight: 22,
  },
  deviceHint: {
    color: '#067647',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  deviceList: {
    gap: 8,
  },
  deviceName: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  deviceRow: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e4e7ec',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  deviceText: {
    flex: 1,
  },
  emptyText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#a23232',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#b9c5d4',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '900',
  },
  title: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
  },
});
