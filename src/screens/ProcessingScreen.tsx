import { StyleSheet, Text, View } from 'react-native';

export function ProcessingScreen() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Preparing EEG data...</Text>
      <Text style={styles.description}>Python analysis integration pending.</Text>
      <Text style={styles.description}>Current processing is a placeholder.</Text>
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
