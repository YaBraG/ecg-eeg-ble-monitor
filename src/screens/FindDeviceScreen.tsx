import { Pressable, StyleSheet, Text, View } from 'react-native';

type FindDeviceScreenProps = {
  errorMessage?: string | null;
  onFindDevice: () => void;
};

export function FindDeviceScreen({ errorMessage, onFindDevice }: FindDeviceScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Find EEG Device</Text>
      <Text style={styles.description}>Connect to the EEG device to start a recording or import a demo EEG sample.</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={onFindDevice}>
        <Text style={styles.primaryButtonText}>Find EEG Device</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  errorText: {
    color: '#a23232',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1f6f7a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  title: {
    color: '#101828',
    fontSize: 24,
    fontWeight: '900',
  },
});
