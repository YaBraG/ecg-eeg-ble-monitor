export const PLATFORM_TARGET = 'android-only';
export const SAMPLE_RATE_HZ = 500;
export const TASK_PROTOCOL_SECONDS = 300;
export const NO_MOVEMENT_SECONDS = 120;
export const TARGET_SCAN_DURATION_SECONDS = 420;
export const DEMO_SOURCE_FILE_NAME = 'sz1_cleaned (5minB 2minA).txt';
export const DEMO_EXPECTED_SOURCE_COLUMNS = 32;
export const ANALYSIS_CHANNEL_COUNT = 20;
export const ANALYSIS_USES_FIRST_N_COLUMNS = 20;

export const CHANNEL_ORDER = [
  'C3',
  'C4',
  'CZ',
  'F3',
  'F4',
  'F7',
  'F8',
  'FZ',
  'FP1',
  'FP2',
  'FPZ',
  'O1',
  'O2',
  'P3',
  'P4',
  'PZ',
  'T3',
  'T4',
  'T5',
  'T6',
];

export const RESULT_MESSAGE =
  'No seizure-like activity was detected in this recording.\n\nThis result is not a medical diagnosis and should be reviewed by a qualified clinician.';
export const DISCLAIMER_MESSAGE =
  'This result is not a medical diagnosis and should be reviewed by a qualified clinician.';
export const DEMO_ONLY_MESSAGE = 'Demo mode only. Not for clinical decision-making.';

export const ASSUMPTIONS = [
  'Demo source file name is sz1_cleaned (5minB 2minA).txt.',
  'The TXT file is whitespace-delimited numeric data.',
  'The TXT file has no header row.',
  'The full sample TXT has approximately 200,963 rows and 32 columns.',
  'At 500 Hz, the sample is about 401.926 seconds.',
  'All 32 source columns are preserved as source metadata.',
  'The first 20 columns are used as EEG input for analysis.',
  'Columns 21-32 are preserved and reported but not analyzed yet.',
  'A1/A2 are assumed to be reference electrodes, not data channels.',
  'FPZ is assumed to be an actual EEG data channel.',
  'These assumptions are temporary and centralized in demoConfig.ts.',
];
