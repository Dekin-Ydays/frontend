import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import {
  compareVideos,
  ComparisonConfig,
  ScoringResult,
  COMPARISON_PRESETS,
} from '@/services/video-parser-api';
import { ScoreVisualization } from './score-visualization';

type PresetType = keyof typeof COMPARISON_PRESETS;

export function VideoComparison() {
  const [referenceId, setReferenceId] = useState('');
  const [comparisonId, setComparisonId] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('dance');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const handleCompare = async () => {
    if (!referenceId.trim() || !comparisonId.trim()) {
      Alert.alert('Error', 'Please enter both video IDs');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const config: ComparisonConfig = COMPARISON_PRESETS[selectedPreset];
      const comparisonResult = await compareVideos({
        referenceVideoId: referenceId.trim(),
        comparisonVideoId: comparisonId.trim(),
        config,
      });

      setResult(comparisonResult);
    } catch (error) {
      Alert.alert(
        'Comparison Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setReferenceId('');
    setComparisonId('');
    setResult(null);
  };

  return (
    <ThemedView style={styles.container}>
      {!result ? (
        <View style={styles.inputContainer}>
          <ThemedText type="subtitle" style={styles.title}>
            Compare Videos
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Reference Video ID
            </ThemedText>
            <TextInput
              style={styles.input}
              value={referenceId}
              onChangeText={setReferenceId}
              placeholder="Enter reference video ID"
              placeholderTextColor="rgba(128, 128, 128, 0.5)"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ThemedText style={styles.hint}>
              The video to compare against (teacher/reference)
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Comparison Video ID
            </ThemedText>
            <TextInput
              style={styles.input}
              value={comparisonId}
              onChangeText={setComparisonId}
              placeholder="Enter comparison video ID"
              placeholderTextColor="rgba(128, 128, 128, 0.5)"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ThemedText style={styles.hint}>
              The video to analyze (student/comparison)
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Comparison Preset
            </ThemedText>
            <View style={styles.presetContainer}>
              {(Object.keys(COMPARISON_PRESETS) as PresetType[]).map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    selectedPreset === preset && styles.presetButtonActive,
                  ]}
                  onPress={() => setSelectedPreset(preset)}
                >
                  <ThemedText
                    style={[
                      styles.presetButtonText,
                      selectedPreset === preset && styles.presetButtonTextActive,
                    ]}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <ThemedText style={styles.hint}>
              {selectedPreset === 'dance' &&
                'Position & angles balanced (50/50)'}
              {selectedPreset === 'yoga' &&
                'Focus on angles, rotation-invariant'}
              {selectedPreset === 'sports' &&
                'Focus on position, higher visibility threshold'}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.compareButton, loading && styles.compareButtonDisabled]}
            onPress={handleCompare}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.compareButtonText}>
                Compare Videos
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <ThemedText type="subtitle">Comparison Results</ThemedText>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <ThemedText style={styles.clearButtonText}>New Comparison</ThemedText>
            </TouchableOpacity>
          </View>

          <ScoreVisualization result={result} />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    padding: 20,
    gap: 24,
  },
  title: {
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    alignItems: 'center',
  },
  presetButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: '#fff',
  },
  compareButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  compareButtonDisabled: {
    opacity: 0.6,
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  clearButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
