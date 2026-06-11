import { StyleSheet, Text, View } from 'react-native';

type ProcessingScreenProps = {
  mode: 'analysis' | 'placeholder';
};

export function ProcessingScreen({ mode }: ProcessingScreenProps) {
  const isAnalysis = mode === 'analysis';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{isAnalysis ? 'Running EEG analysis...' : 'Preparing EEG data...'}</Text>
      <Text style={styles.description}>
        {isAnalysis
          ? 'Python analysis is running locally on this Android device. This can take a while.'
          : 'Current processing is a placeholder for manual and auto recordings.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d7dee8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    margin: 16,
    padding: 18,
  },
  description: {
    color: '#475467',
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
  },
});
