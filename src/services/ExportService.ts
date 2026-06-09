export function getRecordingPackagePlan() {
  // Placeholder only. ZIP export will be added after the recording package shape
  // and Python analysis outputs are stable enough to avoid fragile native work.
  return [
    'recording_package/',
    'metadata.json',
    'source_txt_file.txt',
    'analysis_summary.json',
    'plots/key/',
    'plots/all/',
  ];
}
