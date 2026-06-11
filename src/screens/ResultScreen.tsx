import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEMO_ONLY_MESSAGE, RESULT_MESSAGE } from '../config/demoConfig';
import { AnalysisResult } from '../types/analysis';

type ResultScreenProps = {
  analysisResult: AnalysisResult | null;
  onExportPackage: () => void;
  onStartOver: () => void;
  onViewAllPlots: () => void;
  onViewKeyPlots: () => void;
};

export function ResultScreen({
  analysisResult,
  onExportPackage,
  onStartOver,
  onViewAllPlots,
  onViewKeyPlots,
}: ResultScreenProps) {
  const summary = analysisResult?.summary;
  const isFailure = analysisResult ? !analysisResult.success : false;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Result</Text>
      <Text style={isFailure ? styles.statusFailure : styles.statusSuccess}>
        {isFailure ? 'Analysis failed' : summary ? 'Analysis complete' : 'Placeholder result'}
      </Text>
      <Text style={isFailure ? styles.errorText : styles.resultText}>
        {isFailure
          ? analysisResult?.errorMessage || 'EEG analysis failed.'
          : summary?.resultMessage || RESULT_MESSAGE}
      </Text>
      <Text style={styles.demoOnlyText}>{summary?.disclaimer || DEMO_ONLY_MESSAGE}</Text>

      {summary ? (
        <View style={styles.summaryBox}>
          <SummaryRow label="Sample rate" value={`${summary.sampleRateHz} Hz`} />
          <SummaryRow label="Sample count" value={String(summary.sampleCount)} />
          <SummaryRow label="Duration" value={`${summary.durationSeconds.toFixed(3)} seconds`} />
          <SummaryRow label="Key plots" value={String(summary.keyPlots.length)} />
          <SummaryRow label="All plots" value={String(summary.allPlots.length)} />
          <SummaryRow
            label="Export package"
            value={analysisResult?.exportZipExists ? 'Available' : 'Pending'}
          />
          {analysisResult?.exportZipExists && analysisResult.exportZipPath ? (
            <SummaryRow label="Export ZIP" value={analysisResult.exportZipPath} />
          ) : null}
        </View>
      ) : null}

      {summary?.warnings?.length ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Warnings</Text>
          {summary.warnings.map((warning) => (
            <Text key={warning} style={styles.warningText}>
              {warning}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.buttonGrid}>
        <ActionButton label="View Key Plots" onPress={onViewKeyPlots} />
        <ActionButton label="View All Plots" onPress={onViewAllPlots} />
        <ActionButton label="Export Package" onPress={onExportPackage} />
        <ActionButton label="Start Over" onPress={onStartOver} />
      </View>
    </View>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
};

function ActionButton({ label, onPress }: ActionButtonProps) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 160,
    padding: 12,
  },
  actionLabel: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '900',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    margin: 16,
    padding: 18,
  },
  demoOnlyText: {
    color: '#9a3412',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  errorText: {
    color: '#a23232',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 25,
  },
  resultText: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
  },
  title: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
  },
  summaryBox: {
    backgroundColor: '#edf3f8',
    borderRadius: 8,
    gap: 8,
    padding: 12,
  },
  summaryLabel: {
    color: '#667085',
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  summaryValue: {
    color: '#101828',
    flex: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  statusFailure: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee4e2',
    borderRadius: 999,
    color: '#912018',
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusSuccess: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfae6',
    borderRadius: 999,
    color: '#067647',
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  warningBox: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  warningText: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 18,
  },
  warningTitle: {
    color: '#9a3412',
    fontSize: 13,
    fontWeight: '900',
  },
});
