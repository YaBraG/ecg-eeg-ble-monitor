import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ConnectionPanel } from '../components/ConnectionPanel';
import { SignalGrid } from '../components/SignalGrid';
import { useBleConnection } from '../hooks/useBleConnection';
import { useMockSignalFeed } from '../hooks/useMockSignalFeed';

export function AppRoot() {
  const ble = useBleConnection();
  const channels = useMockSignalFeed(ble.isMockMode);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>ECG/EEG BLE Monitor</Text>
          <Text style={styles.subtitle}>Expo development build milestone with mock 20-channel signals.</Text>
        </View>
        <ConnectionPanel
          connectedDevice={ble.connectedDevice}
          devices={ble.devices}
          errorMessage={ble.errorMessage}
          isMockMode={ble.isMockMode}
          status={ble.status}
          onConnect={ble.connect}
          onDisconnect={ble.disconnect}
          onMockModeChange={ble.setIsMockMode}
          onStartScan={ble.startScan}
          onStopScan={ble.stopScan}
        />
        <SignalGrid channels={channels} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  screen: {
    backgroundColor: '#f4f7fb',
    flex: 1,
  },
  subtitle: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: '#101828',
    fontSize: 26,
    fontWeight: '900',
  },
  titleBlock: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#d7dee8',
    borderBottomWidth: 1,
    gap: 4,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 58,
  },
});
