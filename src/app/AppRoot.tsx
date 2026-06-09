import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  DEMO_ONLY_MESSAGE,
  RESULT_MESSAGE,
  SAMPLE_RATE_HZ,
  TARGET_SCAN_DURATION_SECONDS,
  TASK_PROTOCOL_SECONDS,
} from '../config/demoConfig';
import { ConnectionPanel } from '../components/ConnectionPanel';
import { SignalGrid } from '../components/SignalGrid';
import { useBleConnection } from '../hooks/useBleConnection';
import { useMockSignalFeed } from '../hooks/useMockSignalFeed';
import { importDemoTxtRecording } from '../services/DemoImportService';
import { getRecordingPackagePlan } from '../services/ExportService';
import { clearCurrentRecording, loadCurrentRecording } from '../services/RecordingStorageService';
import { BleDeviceInfo } from '../types/ble';
import { RecordingMetadata } from '../types/recording';
import { StartMode, WorkflowState } from '../types/workflow';

const KEY_PLOTS = [
  'Recording overview using selected channels',
  '20-channel time-domain EEG',
  'Welch PSD per channel',
  'Bandpower summary: delta, theta, alpha, beta, gamma',
  'Group A vs Group B time-domain',
  'Group A vs Group B PSD',
  'Wavelet / time-frequency plot',
  'PCA loadings / dominant electrodes',
];

const ALL_PLOTS = [
  ...KEY_PLOTS,
  'Per-channel artifact flags',
  'Reference channel summary',
  'Segment-level bandpower trends',
  'Processing quality report',
];

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function AppRoot() {
  const ble = useBleConnection();
  const [workflow, setWorkflow] = useState<WorkflowState>('reconnecting');
  const [recording, setRecording] = useState<RecordingMetadata | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startMode, setStartMode] = useState<StartMode | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const channels = useMockSignalFeed(ble.isMockMode || workflow === 'acquisition');

  const phaseLabel = useMemo(() => {
    if (elapsedSeconds < TASK_PROTOCOL_SECONDS) {
      return 'Task / movement protocol';
    }

    return 'No movement / stay still';
  }, [elapsedSeconds]);

  useEffect(() => {
    let isMounted = true;

    async function loadPreviousState() {
      const previousRecording = await loadCurrentRecording();

      if (!isMounted) {
        return;
      }

      setRecording(previousRecording);
      setWorkflow(previousRecording ? 'connected' : 'find-device');
    }

    loadPreviousState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (workflow !== 'acquisition') {
      return undefined;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((currentValue) => {
        if (currentValue >= TARGET_SCAN_DURATION_SECONDS) {
          clearInterval(timer);
          setWorkflow('processing');
          return currentValue;
        }

        return currentValue + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [workflow]);

  useEffect(() => {
    if (workflow !== 'processing') {
      return undefined;
    }

    const timer = setTimeout(() => {
      setWorkflow('result');
    }, 1200);

    return () => clearTimeout(timer);
  }, [workflow]);

  function startAcquisition(nextMode: StartMode) {
    setStartMode(nextMode);
    setElapsedSeconds(0);
    setWorkflow('acquisition');
  }

  async function connectAndContinue(device: BleDeviceInfo) {
    await ble.connect(device);
    setWorkflow('connected');
  }

  async function startDemoImport() {
    setImportError(null);

    try {
      const importedRecording = await importDemoTxtRecording();

      if (!importedRecording) {
        return;
      }

      setStartMode('demo-txt');
      setRecording(importedRecording);
      setWorkflow('processing');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unable to import the selected TXT file.');
    }
  }

  function confirmDemoImport() {
    if (!recording) {
      startDemoImport();
      return;
    }

    Alert.alert(
      'Replace current recording?',
      'Only one previous/current recording is stored. Importing a new TXT file will overwrite the saved demo recording metadata.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import TXT', style: 'destructive', onPress: startDemoImport },
      ],
    );
  }

  function stopAcquisitionEarly() {
    setWorkflow('stopped-early');
    Alert.alert('Recording stopped early. Do you want to process scanned data?', undefined, [
      {
        text: 'Discard and return',
        style: 'destructive',
        onPress: () => {
          setElapsedSeconds(0);
          setWorkflow('connected');
        },
      },
      {
        text: 'Process scanned data',
        onPress: () => setWorkflow('processing'),
      },
    ]);
  }

  async function startOver() {
    await clearCurrentRecording();
    setRecording(null);
    setElapsedSeconds(0);
    setStartMode(null);
    setWorkflow('connected');
  }

  function showExportPlaceholder() {
    Alert.alert('Export Package Placeholder', getRecordingPackagePlan().join('\n'));
  }

  function renderReconnectState() {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Trying to reconnect to previous device...</Text>
        <Text style={styles.bodyText}>The app is loading the one saved recording metadata entry.</Text>
      </View>
    );
  }

  function renderFindDeviceState() {
    return (
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Find EEG Device</Text>
          <Text style={styles.bodyText}>
            Real ESP32 hardware is not required for Demo From TXT. Use scanning for early BLE testing or keep mock mode
            enabled.
          </Text>
          <Pressable style={styles.largeButton} onPress={ble.startScan}>
            <Text style={styles.largeButtonText}>Find EEG Device</Text>
          </Pressable>
        </View>
        <ConnectionPanel
          connectedDevice={ble.connectedDevice}
          devices={ble.devices}
          errorMessage={ble.errorMessage}
          isMockMode={ble.isMockMode}
          status={ble.status}
          onConnect={connectAndContinue}
          onDisconnect={ble.disconnect}
          onMockModeChange={ble.setIsMockMode}
          onStartScan={ble.startScan}
          onStopScan={ble.stopScan}
        />
      </View>
    );
  }

  function renderConnectedState() {
    return (
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Android EEG Demo</Text>
          <Text style={styles.bodyText}>
            Sampling rate assumption: {SAMPLE_RATE_HZ} Hz. Recording target: {formatClock(TARGET_SCAN_DURATION_SECONDS)}.
          </Text>
          {recording ? <Text style={styles.metaText}>Current TXT: {recording.sourceFileName}</Text> : null}
          {importError ? <Text style={styles.errorText}>{importError}</Text> : null}
          <View style={styles.buttonGrid}>
            <ActionButton
              label="Manual Start"
              detail="Placeholder for device-button/manual recording later."
              onPress={() => startAcquisition('manual')}
            />
            <ActionButton
              label="Auto Start"
              detail="Placeholder that will wait for a future ESP32 start signal."
              onPress={() => startAcquisition('auto')}
            />
            <ActionButton
              label="Demo From TXT"
              detail="Select and import the Android demo TXT sample. ZIP is not expected."
              onPress={confirmDemoImport}
            />
          </View>
        </View>
        <ConnectionPanel
          connectedDevice={ble.connectedDevice}
          devices={ble.devices}
          errorMessage={ble.errorMessage}
          isMockMode={ble.isMockMode}
          status={ble.status}
          onConnect={connectAndContinue}
          onDisconnect={ble.disconnect}
          onMockModeChange={ble.setIsMockMode}
          onStartScan={ble.startScan}
          onStopScan={ble.stopScan}
        />
      </View>
    );
  }

  function renderAcquisitionState() {
    return (
      <View style={styles.stack}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Acquisition</Text>
          <Text style={styles.timerText}>
            {formatClock(elapsedSeconds)} / {formatClock(TARGET_SCAN_DURATION_SECONDS)}
          </Text>
          <Text style={styles.bodyText}>Phase: {phaseLabel}</Text>
          <Text style={styles.metaText}>Start mode: {startMode ?? 'placeholder'}</Text>
          <View style={styles.placeholderGrid}>
            <MetricCard label="Packets" value="Pending" />
            <MetricCard label="Dropped packets" value="0 placeholder" />
            <MetricCard label="Signal quality" value="Placeholder" />
          </View>
          <Pressable style={styles.stopButton} onPress={stopAcquisitionEarly}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </Pressable>
        </View>
        <SignalGrid channels={channels} />
      </View>
    );
  }

  function renderProcessingState() {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Preparing EEG data...</Text>
        <Text style={styles.bodyText}>Python analysis integration pending.</Text>
        <Text style={styles.bodyText}>Current processing is a placeholder.</Text>
      </View>
    );
  }

  function renderResultState() {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Result</Text>
        <Text style={styles.resultText}>{RESULT_MESSAGE}</Text>
        <Text style={styles.demoOnlyText}>{DEMO_ONLY_MESSAGE}</Text>
        <View style={styles.buttonGrid}>
          <ActionButton label="View Key Plots" onPress={() => setWorkflow('key-plots')} />
          <ActionButton label="View All Plots" onPress={() => setWorkflow('all-plots')} />
          <ActionButton label="Export Package placeholder" onPress={showExportPlaceholder} />
          <ActionButton label="Start Over" onPress={startOver} />
        </View>
      </View>
    );
  }

  function renderPlots(title: string, plots: string[], includeNote: boolean) {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{title}</Text>
        {includeNote ? (
          <Text style={styles.bodyText}>Converted Python analysis will populate this list with PNG images later.</Text>
        ) : null}
        <View style={styles.plotList}>
          {plots.map((plotTitle) => (
            <View key={plotTitle} style={styles.plotCard}>
              <Text style={styles.plotTitle}>{plotTitle}</Text>
              <Text style={styles.metaText}>Placeholder plot image pending Python analysis.</Text>
            </View>
          ))}
        </View>
        <View style={styles.buttonGrid}>
          <ActionButton label="Back to Result" onPress={() => setWorkflow('result')} />
          <ActionButton label="Start Over" onPress={startOver} />
        </View>
      </View>
    );
  }

  function renderWorkflow() {
    if (workflow === 'reconnecting') {
      return renderReconnectState();
    }

    if (workflow === 'find-device') {
      return renderFindDeviceState();
    }

    if (workflow === 'connected') {
      return renderConnectedState();
    }

    if (workflow === 'acquisition' || workflow === 'stopped-early') {
      return renderAcquisitionState();
    }

    if (workflow === 'processing') {
      return renderProcessingState();
    }

    if (workflow === 'result') {
      return renderResultState();
    }

    if (workflow === 'key-plots') {
      return renderPlots('Key Plots', KEY_PLOTS, false);
    }

    return renderPlots('All Plots', ALL_PLOTS, true);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Android EEG Demo</Text>
          <Text style={styles.subtitle}>Demo mode only. TXT import and analysis screens are placeholders.</Text>
        </View>
        {renderWorkflow()}
      </ScrollView>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  detail?: string;
  onPress: () => void;
};

function ActionButton({ label, detail, onPress }: ActionButtonProps) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionLabel}>{label}</Text>
      {detail ? <Text style={styles.actionDetail}>{detail}</Text> : null}
    </Pressable>
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
  actionButton: {
    backgroundColor: '#ffffff',
    borderColor: '#b9c5d4',
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
    fontWeight: '800',
  },
  bodyText: {
    color: '#475467',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    paddingBottom: 24,
  },
  demoOnlyText: {
    color: '#9a3412',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  errorText: {
    color: '#a23232',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  largeButton: {
    alignItems: 'center',
    backgroundColor: '#1f6f7a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  largeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  metaText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
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
  panel: {
    backgroundColor: '#edf3f8',
    borderBottomColor: '#d7dee8',
    borderBottomWidth: 1,
    gap: 12,
    padding: 16,
  },
  panelTitle: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '900',
  },
  placeholderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plotCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 92,
    padding: 12,
  },
  plotList: {
    gap: 8,
  },
  plotTitle: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  resultText: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
  },
  screen: {
    backgroundColor: '#f4f7fb',
    flex: 1,
  },
  stack: {
    gap: 0,
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
  subtitle: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },
  timerText: {
    color: '#1f6f7a',
    fontSize: 34,
    fontWeight: '900',
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
