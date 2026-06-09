import { StyleSheet, Text, View } from 'react-native';

export function ReconnectingScreen() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Connecting to EEG device...</Text>
      <Text style={styles.description}>Loading the current demo recording and device state.</Text>
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
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '900',
  },
});
