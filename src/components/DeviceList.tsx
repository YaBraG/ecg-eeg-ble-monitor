import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BleDeviceInfo } from '../types/ble';

type DeviceListProps = {
  devices: BleDeviceInfo[];
  onConnect: (device: BleDeviceInfo) => void;
};

export function DeviceList({ devices, onConnect }: DeviceListProps) {
  if (devices.length === 0) {
    return <Text style={styles.emptyText}>No devices discovered yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {devices.map((device) => (
        <Pressable key={device.id} style={styles.deviceRow} onPress={() => onConnect(device)}>
          <View style={styles.deviceText}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceId}>{device.id}</Text>
          </View>
          <Text style={styles.signal}>{device.rssi ? `${device.rssi} dBm` : 'RSSI --'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  deviceId: {
    color: '#667085',
    fontSize: 12,
    marginTop: 2,
  },
  deviceName: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '700',
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
    paddingVertical: 6,
  },
  list: {
    gap: 8,
  },
  signal: {
    color: '#325c9c',
    fontSize: 12,
    fontWeight: '700',
  },
});
