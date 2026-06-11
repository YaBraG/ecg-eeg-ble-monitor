import { NativeModules } from 'react-native';

import { NativeEegAnalysisResult } from '../types/analysis';

type EegAnalysisNativeModule = {
  runAnalysis(inputTxtUri: string): Promise<NativeEegAnalysisResult>;
};

const nativeModule = NativeModules.EegAnalysis as EegAnalysisNativeModule | undefined;

export function runNativeEegAnalysis(inputTxtUri: string): Promise<NativeEegAnalysisResult> {
  if (!nativeModule) {
    return Promise.reject(new Error('Native EEG analysis module is not available in this Android build.'));
  }

  return nativeModule.runAnalysis(inputTxtUri);
}
