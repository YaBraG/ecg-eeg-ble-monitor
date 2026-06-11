import { Pressable, StyleSheet, Text, View } from 'react-native';

type PlotsScreenProps = {
  hasAnalysisOutputs?: boolean;
  includeNote?: boolean;
  onBackToResult: () => void;
  onStartOver: () => void;
  plots: string[];
  title: string;
};

export function PlotsScreen({
  hasAnalysisOutputs = false,
  includeNote = false,
  onBackToResult,
  onStartOver,
  plots,
  title,
}: PlotsScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {includeNote ? (
        <Text style={styles.description}>
          {hasAnalysisOutputs
            ? 'Python generated these PNG files. Image display is pending.'
            : 'Python analysis will populate this list with PNG files after Import EEG TXT.'}
        </Text>
      ) : null}
      <View style={styles.plotList}>
        {plots.map((plotTitle) => (
          <View key={plotTitle} style={styles.plotCard}>
            <Text style={styles.plotTitle}>{plotTitle}</Text>
            <Text style={styles.plotDescription}>
              {hasAnalysisOutputs ? 'PNG display pending.' : 'Placeholder plot image pending Python analysis.'}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.buttonGrid}>
        <Pressable style={styles.secondaryButton} onPress={onBackToResult}>
          <Text style={styles.secondaryButtonText}>Back to Result</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onStartOver}>
          <Text style={styles.secondaryButtonText}>Start Over</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 12,
    margin: 16,
    padding: 18,
  },
  description: {
    color: '#475467',
    fontSize: 15,
    lineHeight: 22,
  },
  plotCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e4e7ec',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 92,
    padding: 12,
  },
  plotDescription: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  plotList: {
    gap: 8,
  },
  plotTitle: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#b9c5d4',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 150,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '900',
  },
  title: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
  },
});
