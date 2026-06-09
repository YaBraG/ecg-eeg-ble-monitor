import { Pressable, StyleSheet, Text, View } from 'react-native';

type StoppedEarlyScreenProps = {
  onDiscard: () => void;
  onProcess: () => void;
};

export function StoppedEarlyScreen({ onDiscard, onProcess }: StoppedEarlyScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recording stopped early. Do you want to process scanned data?</Text>
      <View style={styles.buttonGrid}>
        <Pressable style={styles.primaryButton} onPress={onProcess}>
          <Text style={styles.primaryButtonText}>Process scanned data</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onDiscard}>
          <Text style={styles.secondaryButtonText}>Discard and return</Text>
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
    gap: 14,
    margin: 16,
    padding: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1f6f7a',
    borderRadius: 8,
    flex: 1,
    minWidth: 170,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#b9c5d4',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 170,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '900',
  },
  title: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 29,
  },
});
