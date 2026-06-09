import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TARGET_SCAN_DURATION_SECONDS, TASK_PROTOCOL_SECONDS } from '../config/demoConfig';
import { useBleConnection } from '../hooks/useBleConnection';
import { useMockSignalFeed } from '../hooks/useMockSignalFeed';
import { AcquisitionScreen } from '../screens/AcquisitionScreen';
import { ConnectedStartScreen } from '../screens/ConnectedStartScreen';
import { FindDeviceScreen } from '../screens/FindDeviceScreen';
import { PlotsScreen } from '../screens/PlotsScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ReconnectingScreen } from '../screens/ReconnectingScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { ScanningDeviceScreen } from '../screens/ScanningDeviceScreen';
import { StoppedEarlyScreen } from '../screens/StoppedEarlyScreen';
import { importDemoTxtRecording } from '../services/DemoImportService';
import { getRecordingPackagePlan } from '../services/ExportService';
import { clearCurrentRecording, loadCurrentRecording } from '../services/RecordingStorageService';
import { BleDeviceInfo } from '../types/ble';
import { RecordingMetadata } from '../types/recording';
import { WorkflowState } from '../types/workflow';

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
      // TODO: Try reconnecting to a saved EEG device here once device persistence is added.
      setWorkflow('find-device');
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

  async function startDeviceSearch() {
    setImportError(null);
    setWorkflow('scanning-device');
    await ble.startScan();
  }

  function cancelDeviceSearch() {
    ble.stopScan();
    setWorkflow('find-device');
  }

  async function connectAndContinue(device: BleDeviceInfo) {
    const connected = await ble.connect(device);

    if (connected) {
      ble.stopScan();
      setWorkflow('connected');
    }
  }

  async function disconnectAndReturn() {
    await ble.disconnect();
    setImportError(null);
    setWorkflow('find-device');
  }

  function startAcquisition() {
    setElapsedSeconds(0);
    setWorkflow('acquisition');
  }

  async function startDemoImport() {
    setImportError(null);

    try {
      const importedRecording = await importDemoTxtRecording();

      if (!importedRecording) {
        return;
      }

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
      'The app stores one current recording. Importing a new EEG TXT sample will replace the saved demo metadata.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import EEG TXT', style: 'destructive', onPress: startDemoImport },
      ],
    );
  }

  function stopAcquisitionEarly() {
    setWorkflow('stopped-early');
  }

  function discardEarlyRecording() {
    setElapsedSeconds(0);
    setWorkflow(ble.connectedDevice ? 'connected' : 'find-device');
  }

  async function startOver() {
    await clearCurrentRecording();
    setRecording(null);
    setElapsedSeconds(0);
    setWorkflow(ble.connectedDevice ? 'connected' : 'find-device');
  }

  function showExportPlaceholder() {
    Alert.alert('Export Package Placeholder', getRecordingPackagePlan().join('\n'));
  }

  function renderWorkflow() {
    if (workflow === 'reconnecting') {
      return <ReconnectingScreen />;
    }

    if (workflow === 'find-device') {
      return <FindDeviceScreen errorMessage={ble.errorMessage} onFindDevice={startDeviceSearch} />;
    }

    if (workflow === 'scanning-device') {
      return (
        <ScanningDeviceScreen
          devices={ble.devices}
          errorMessage={ble.errorMessage}
          onCancel={cancelDeviceSearch}
          onSelectDevice={connectAndContinue}
        />
      );
    }

    if (workflow === 'connected') {
      if (!ble.connectedDevice) {
        return <FindDeviceScreen errorMessage={ble.errorMessage} onFindDevice={startDeviceSearch} />;
      }

      return (
        <ConnectedStartScreen
          connectedDevice={ble.connectedDevice}
          importError={importError}
          recording={recording}
          onAutoStart={startAcquisition}
          onDisconnect={disconnectAndReturn}
          onImportTxt={confirmDemoImport}
          onManualStart={startAcquisition}
        />
      );
    }

    if (workflow === 'acquisition') {
      return (
        <AcquisitionScreen
          channels={channels}
          elapsedLabel={formatClock(elapsedSeconds)}
          phaseLabel={phaseLabel}
          targetLabel={formatClock(TARGET_SCAN_DURATION_SECONDS)}
          onStop={stopAcquisitionEarly}
        />
      );
    }

    if (workflow === 'stopped-early') {
      return (
        <StoppedEarlyScreen
          onDiscard={discardEarlyRecording}
          onProcess={() => setWorkflow('processing')}
        />
      );
    }

    if (workflow === 'processing') {
      return <ProcessingScreen />;
    }

    if (workflow === 'result') {
      return (
        <ResultScreen
          onExportPackage={showExportPlaceholder}
          onStartOver={startOver}
          onViewAllPlots={() => setWorkflow('all-plots')}
          onViewKeyPlots={() => setWorkflow('key-plots')}
        />
      );
    }

    if (workflow === 'key-plots') {
      return (
        <PlotsScreen
          plots={KEY_PLOTS}
          title="Key Plots"
          onBackToResult={() => setWorkflow('result')}
          onStartOver={startOver}
        />
      );
    }

    return (
      <PlotsScreen
        includeNote
        plots={ALL_PLOTS}
        title="All Plots"
        onBackToResult={() => setWorkflow('result')}
        onStartOver={startOver}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Android EEG Demo</Text>
          <Text style={styles.subtitle}>Clean demo workflow for device connection, recording, and EEG TXT import.</Text>
        </View>
        {renderWorkflow()}
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
