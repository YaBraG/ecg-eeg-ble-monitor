import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SAMPLE_RATE_HZ, TARGET_SCAN_DURATION_SECONDS } from '../config/demoConfig';
import { BleDeviceInfo } from '../types/ble';
import { RecordingMetadata } from '../types/recording';

type ConnectedStartScreenProps = {
  connectedDevice: BleDeviceInfo;
  importError?: string | null;
  recording: RecordingMetadata | null;
  onAutoStart: () => void;
  onDisconnect: () => void;
  onImportTxt: () => void;
  onManualStart: () => void;
};

export function ConnectedStartScreen({
  connectedDevice,
  importError,
  recording,
  onAutoStart,
  onDisconnect,
  onImportTxt,
  onManualStart,
}: ConnectedStartScreenProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>EEG Device Connected</Text>
          <Text style={styles.deviceName}>{connectedDevice.name}</Text>
        </View>
        <Pressable style={styles.disconnectButton} onPress={onDisconnect}>
          <Text style={styles.disconnectText}>Disconnect</Text>
        </Pressable>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Sampling rate assumption: {SAMPLE_RATE_HZ} Hz</Text>
        <Text style={styles.infoText}>Recording target: {Math.round(TARGET_SCAN_DURATION_SECONDS / 60)} minutes</Text>
        {recording ? <Text style={styles.infoText}>Current EEG TXT: {recording.sourceFileName}</Text> : null}
      </View>

      {importError ? <Text style={styles.errorText}>{importError}</Text> : null}

      <View style={styles.startSection}>
        <Text style={styles.sectionTitle}>Start Recording</Text>
        <View style={styles.buttonGrid}>
          <ActionButton
            label="Manual Start"
            detail="Starts placeholder acquisition for manual recording."
            onPress={onManualStart}
          />
          <ActionButton
            label="Auto Start"
            detail="Starts placeholder acquisition while ESP32 auto-start is pending."
            onPress={onAutoStart}
          />
          <ActionButton
            label="Import EEG TXT"
            detail="Select an EEG TXT sample from this Android device."
            onPress={onImportTxt}
          />
        </View>
      </View>
    </View>
  );
}

type ActionButtonProps = {
  detail: string;
  label: string;
  onPress: () => void;
};

function ActionButton({ detail, label, onPress }: ActionButtonProps) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionDetail}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: '#f8fafc',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 170,
    padding: 12,
  },
  actionDetail: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  actionLabel: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '900',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    margin: 16,
    padding: 18,
  },
  deviceName: {
    color: '#475467',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 3,
  },
  disconnectButton: {
    backgroundColor: '#ffffff',
    borderColor: '#b9c5d4',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  disconnectText: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '900',
  },
  errorText: {
    color: '#a23232',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#edf3f8',
    borderRadius: 8,
    gap: 4,
    padding: 12,
  },
  infoText: {
    color: '#475467',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  startSection: {
    gap: 8,
  },
  title: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
  },
});
