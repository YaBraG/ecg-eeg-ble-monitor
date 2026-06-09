import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEMO_ONLY_MESSAGE, RESULT_MESSAGE } from '../config/demoConfig';

type ResultScreenProps = {
  onExportPackage: () => void;
  onStartOver: () => void;
  onViewAllPlots: () => void;
  onViewKeyPlots: () => void;
};

export function ResultScreen({ onExportPackage, onStartOver, onViewAllPlots, onViewKeyPlots }: ResultScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Result</Text>
      <Text style={styles.resultText}>{RESULT_MESSAGE}</Text>
      <Text style={styles.demoOnlyText}>{DEMO_ONLY_MESSAGE}</Text>
      <View style={styles.buttonGrid}>
        <ActionButton label="View Key Plots" onPress={onViewKeyPlots} />
        <ActionButton label="View All Plots" onPress={onViewAllPlots} />
        <ActionButton label="Export Package placeholder" onPress={onExportPackage} />
        <ActionButton label="Start Over" onPress={onStartOver} />
      </View>
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
});
