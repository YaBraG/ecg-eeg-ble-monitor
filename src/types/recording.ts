export type RecordingMetadata = {
  sourceFileName: string;
  localFileUri: string;
  importedAt: string;
  sampleRateHz: number;
  sourceColumnCount: number;
  analysisColumnCount: number;
  channelOrder: string[];
  demoOnly: boolean;
  durationSecondsEstimate?: number;
  fileSizeBytes?: number;
  validationNotes: string[];
};
