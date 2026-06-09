import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import {
  ANALYSIS_CHANNEL_COUNT,
  ASSUMPTIONS,
  CHANNEL_ORDER,
  DEMO_EXPECTED_DURATION_SECONDS,
  DEMO_EXPECTED_SOURCE_COLUMNS,
  DEMO_SOURCE_FILE_NAME,
  SAMPLE_RATE_HZ,
} from '../config/demoConfig';
import { RecordingMetadata } from '../types/recording';
import { saveCurrentRecording } from './RecordingStorageService';

const DEMO_RECORDING_FILE_NAME = 'current-demo-recording.txt';

export async function importDemoTxtRecording() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['text/plain', 'text/*', 'application/octet-stream'],
  });

  if (result.canceled) {
    return null;
  }

  const selectedFile = result.assets[0];
  const extension = selectedFile.name.split('.').pop()?.toLowerCase();
  const localFileUri = `${FileSystem.documentDirectory}${DEMO_RECORDING_FILE_NAME}`;

  await FileSystem.copyAsync({
    from: selectedFile.uri,
    to: localFileUri,
  });

  const validationNotes = [
    selectedFile.name === DEMO_SOURCE_FILE_NAME
      ? 'File name matches the current demo assumption.'
      : `File name differs from the current demo assumption: ${DEMO_SOURCE_FILE_NAME}.`,
    extension === 'txt' ? 'File extension is .txt.' : 'Selected file extension differs from .txt.',
    selectedFile.size ? `Selected file size: ${selectedFile.size} bytes.` : 'Selected file size was not reported.',
    'Full numeric parsing is deferred to the future Python analysis step.',
    ...ASSUMPTIONS,
  ];

  const metadata: RecordingMetadata = {
    sourceFileName: selectedFile.name,
    localFileUri,
    importedAt: new Date().toISOString(),
    sampleRateHz: SAMPLE_RATE_HZ,
    sourceColumnCount: DEMO_EXPECTED_SOURCE_COLUMNS,
    analysisColumnCount: ANALYSIS_CHANNEL_COUNT,
    channelOrder: CHANNEL_ORDER,
    demoOnly: true,
    durationSecondsEstimate: DEMO_EXPECTED_DURATION_SECONDS,
    fileSizeBytes: selectedFile.size,
    validationNotes,
  };

  await saveCurrentRecording(metadata);

  return metadata;
}
