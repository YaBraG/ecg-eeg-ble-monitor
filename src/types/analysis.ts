export type PlotPlaceholder = {
  id: string;
  title: string;
  description: string;
};

export type AnalysisStatus = 'pending-python-integration' | 'placeholder-complete';

export type NativeEegAnalysisResult = {
  success: boolean;
  inputTxtPath: string;
  outputDir: string;
  summaryPath: string;
  summaryExists: boolean;
  exportZipPath: string;
  exportZipExists: boolean;
  error: string | null;
  summaryJson: string;
};

export type AnalysisEventWindow = {
  label?: string;
  onsetSeconds?: number;
  offsetSeconds?: number;
  requestedOnsetSeconds?: number;
  requestedOffsetSeconds?: number;
  wasClippedToRecordingDuration?: boolean;
  durationSeconds?: number;
};

export type AnalysisSummary = {
  analysisComplete: boolean;
  demoOnly: boolean;
  sampleRateHz: number;
  sampleCount: number;
  channelCount: number;
  durationSeconds: number;
  sourceColumnCount: number;
  analysisColumnCount: number;
  channelOrder: string[];
  seizureLikeActivityDetected: boolean;
  resultMessage: string;
  disclaimer: string;
  keyPlots: string[];
  allPlots: string[];
  warnings: string[];
  eventWindow?: AnalysisEventWindow | null;
  exportZip?: string | null;
};

export type AnalysisResult = {
  success: boolean;
  summary: AnalysisSummary | null;
  errorMessage: string | null;
  nativeResult?: NativeEegAnalysisResult;
};
