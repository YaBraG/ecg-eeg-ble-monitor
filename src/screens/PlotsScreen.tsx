import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { joinFileUri } from '../utils/fileUri';

type PlotsScreenProps = {
  hasAnalysisOutputs?: boolean;
  includeNote?: boolean;
  onBackToResult: () => void;
  onStartOver: () => void;
  outputDir?: string | null;
  plots: string[];
  title: string;
};

export function PlotsScreen({
  hasAnalysisOutputs = false,
  includeNote = false,
  onBackToResult,
  onStartOver,
  outputDir,
  plots,
  title,
}: PlotsScreenProps) {
  const [failedPlots, setFailedPlots] = useState<Record<string, boolean>>({});
  const canShowImages = hasAnalysisOutputs && Boolean(outputDir);

  function markImageFailed(plotPath: string) {
    setFailedPlots((currentValue) => ({
      ...currentValue,
      [plotPath]: true,
    }));
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {includeNote ? (
        <Text style={styles.description}>
          {hasAnalysisOutputs
            ? 'Python generated these PNG plot images.'
            : 'Python analysis will populate this list with PNG files after Import EEG TXT.'}
        </Text>
      ) : null}
      <View style={styles.plotList}>
        {plots.map((plotPath) => {
          const imageUri = canShowImages && outputDir ? joinFileUri(outputDir, plotPath) : null;
          const fileName = plotPath.split(/[\\/]/).pop() || plotPath;

          return (
            <View key={plotPath} style={styles.plotCard}>
              <Text style={styles.plotTitle}>{fileName}</Text>
              {imageUri && !failedPlots[plotPath] ? (
                <Image
                  resizeMode="contain"
                  source={{ uri: imageUri }}
                  style={styles.plotImage}
                  onError={() => markImageFailed(plotPath)}
                />
              ) : (
                <View style={styles.imageFallback}>
                  <Text style={styles.plotDescription}>
                    {imageUri
                      ? 'This PNG could not be loaded from local storage.'
                      : 'Placeholder plot image pending Python analysis.'}
                  </Text>
                </View>
              )}
              {hasAnalysisOutputs ? <Text style={styles.plotPath}>{plotPath}</Text> : null}
            </View>
          );
        })}
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
    gap: 8,
    minHeight: 92,
    padding: 12,
  },
  plotDescription: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  plotImage: {
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    borderColor: '#e4e7ec',
    borderRadius: 6,
    borderWidth: 1,
    height: 260,
    width: '100%',
  },
  plotList: {
    gap: 8,
  },
  plotPath: {
    color: '#667085',
    fontSize: 12,
    lineHeight: 16,
  },
  plotTitle: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  imageFallback: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e4e7ec',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 120,
    padding: 12,
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
