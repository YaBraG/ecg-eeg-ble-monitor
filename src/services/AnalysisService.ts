import { runNativeEegAnalysis } from '../native/EegAnalysisNativeModule';
import { AnalysisResult, AnalysisSummary } from '../types/analysis';
import { RecordingMetadata } from '../types/recording';

function parseSummary(summaryJson: string): AnalysisSummary | null {
  if (!summaryJson.trim()) {
    return null;
  }

  return JSON.parse(summaryJson) as AnalysisSummary;
}

export async function runAnalysisForRecording(recording: RecordingMetadata): Promise<AnalysisResult> {
  try {
    const nativeResult = await runNativeEegAnalysis(recording.localFileUri);
    let summary: AnalysisSummary | null = null;

    try {
      summary = parseSummary(nativeResult.summaryJson);
    } catch {
      return {
        success: false,
        summary: null,
        outputDir: nativeResult.outputDir || null,
        exportZipPath: nativeResult.exportZipPath || null,
        exportZipExists: nativeResult.exportZipExists,
        nativeResult,
        errorMessage: 'EEG analysis returned an invalid summary.',
      };
    }

    if (!nativeResult.success) {
      return {
        success: false,
        summary,
        outputDir: nativeResult.outputDir || null,
        exportZipPath: nativeResult.exportZipPath || null,
        exportZipExists: nativeResult.exportZipExists,
        nativeResult,
        errorMessage: nativeResult.error || 'EEG analysis failed.',
      };
    }

    if (!summary) {
      return {
        success: false,
        summary: null,
        outputDir: nativeResult.outputDir || null,
        exportZipPath: nativeResult.exportZipPath || null,
        exportZipExists: nativeResult.exportZipExists,
        nativeResult,
        errorMessage: 'EEG analysis finished without a readable summary.',
      };
    }

    return {
      success: true,
      summary,
      outputDir: nativeResult.outputDir || null,
      exportZipPath: nativeResult.exportZipPath || null,
      exportZipExists: nativeResult.exportZipExists,
      nativeResult,
      errorMessage: null,
    };
  } catch (error) {
    return {
      success: false,
      summary: null,
      outputDir: null,
      exportZipPath: null,
      exportZipExists: false,
      errorMessage: error instanceof Error ? error.message : 'Unable to run EEG analysis.',
    };
  }
}
