import AsyncStorage from '@react-native-async-storage/async-storage';

import { RecordingMetadata } from '../types/recording';

const CURRENT_RECORDING_KEY = 'current-demo-recording-metadata';

export async function loadCurrentRecording() {
  const storedValue = await AsyncStorage.getItem(CURRENT_RECORDING_KEY);

  if (!storedValue) {
    return null;
  }

  return JSON.parse(storedValue) as RecordingMetadata;
}

export async function saveCurrentRecording(recording: RecordingMetadata) {
  await AsyncStorage.setItem(CURRENT_RECORDING_KEY, JSON.stringify(recording));
}

export async function clearCurrentRecording() {
  await AsyncStorage.removeItem(CURRENT_RECORDING_KEY);
}
