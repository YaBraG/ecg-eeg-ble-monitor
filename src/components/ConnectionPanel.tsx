import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { BleDeviceInfo, BleStatus } from '../types/ble';
import { DeviceList } from './DeviceList';
import { StatusCard } from './StatusCard';

type ConnectionPanelProps = {
  connectedDevice: BleDeviceInfo | null;
  devices: BleDeviceInfo[];
  errorMessage: string | null;
  isMockMode: boolean;
  status: BleStatus;
  onConnect: (device: BleDeviceInfo) => void;
  onDisconnect: () => void;
  onMockModeChange: (isEnabled: boolean) => void;
  onStartScan: () => void;
  onStopScan: () => void;
};

export function ConnectionPanel({
  connectedDevice,
  devices,
  errorMessage,
  isMockMode,
  status,
  onConnect,
  onDisconnect,
  onMockModeChange,
  onStartScan,
  onStopScan,
}: ConnectionPanelProps) {
  const detail = connectedDevice
    ? `Connected to ${connectedDevice.name}`
    : errorMessage ?? 'Use mock mode for generated test data without BLE hardware.';

  return (
    <View style={styles.container}>
      <StatusCard status={status} detail={detail} />

      <View style={styles.mockRow}>
        <View>
          <Text style={styles.mockTitle}>Mock data</Text>
          <Text style={styles.mockText}>Generate ECG/EEG-like test signals.</Text>
        </View>
        <Switch value={isMockMode} onValueChange={onMockModeChange} />
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.primaryButton} onPress={onStartScan}>
          <Text style={styles.primaryText}>Start Scan</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onStopScan}>
          <Text style={styles.secondaryText}>Stop Scan</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onDisconnect}>
          <Text style={styles.secondaryText}>Disconnect</Text>
        </Pressable>
      </View>

      <View style={styles.devices}>
        <Text style={styles.sectionTitle}>Discovered Devices</Text>
        <DeviceList devices={devices} onConnect={onConnect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  container: {
    backgroundColor: '#edf3f8',
    borderBottomColor: '#d7dee8',
    borderBottomWidth: 1,
    gap: 12,
    padding: 16,
  },
  devices: {
    gap: 8,
  },
  mockRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  mockText: {
    color: '#667085',
    fontSize: 13,
    marginTop: 2,
  },
  mockTitle: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#1f6f7a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#b9c5d4',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryText: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
