import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AppText } from "./ui/app-text";
import {
  compareVideos,
  ComparisonConfig,
  ScoringResult,
  COMPARISON_PRESETS,
} from "@/services/video-parser-api";
import { ScoreVisualization } from "./score-visualization";
import { VideoSelector } from "./video-selector";
import { FrameComparator } from "./frame-comparator";

type PresetType = keyof typeof COMPARISON_PRESETS;

interface VideoInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  hint: string;
}

const VideoInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
}: VideoInputProps) => (
  <View style={styles.inputGroup}>
    <AppText variant="bolderBaseText">{label}</AppText>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(128, 128, 128, 0.5)"
      autoCapitalize="none"
      autoCorrect={false}
    />
    <AppText variant="baseText">{hint}</AppText>
  </View>
);

interface ComparisonFormProps {
  referenceId: string;
  setReferenceId: (id: string) => void;
  comparisonId: string;
  setComparisonId: (id: string) => void;
  selectedPreset: PresetType;
  setSelectedPreset: (preset: PresetType) => void;
  loading: boolean;
  onCompare: () => void;
}

const ComparisonForm = ({
  referenceId,
  setReferenceId,
  comparisonId,
  setComparisonId,
  selectedPreset,
  setSelectedPreset,
  loading,
  onCompare,
}: ComparisonFormProps) => (
  <View style={styles.inputContainer}>
    <AppText variant="bolderBaseText">Compare Videos</AppText>

    <View style={styles.inputGroup}>
      <AppText variant="bolderBaseText">Reference Video</AppText>
      <AppText variant="baseText">
        The video to compare against (teacher/reference)
      </AppText>
      <VideoSelector
        selectedVideoId={referenceId || null}
        onSelectVideo={setReferenceId}
      />
      <VideoInput
        label="…or paste an ID"
        value={referenceId}
        onChangeText={setReferenceId}
        placeholder="Reference video ID"
        hint=""
      />
    </View>

    <View style={styles.inputGroup}>
      <AppText variant="bolderBaseText">Comparison Video</AppText>
      <AppText variant="baseText">
        The video to analyze (student/comparison)
      </AppText>
      <VideoSelector
        selectedVideoId={comparisonId || null}
        onSelectVideo={setComparisonId}
      />
      <VideoInput
        label="…or paste an ID"
        value={comparisonId}
        onChangeText={setComparisonId}
        placeholder="Comparison video ID"
        hint=""
      />
    </View>

    <View style={styles.inputGroup}>
      <AppText variant="bolderBaseText">Comparison Preset</AppText>
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
            <AppText variant="baseText">
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
      <AppText variant="baseText">
        {selectedPreset === "dance" && "Position & angles balanced (50/50)"}
        {selectedPreset === "yoga" && "Focus on angles, rotation-invariant"}
        {selectedPreset === "sports" &&
          "Focus on position, higher visibility threshold"}
      </AppText>
    </View>

    <TouchableOpacity
      style={[styles.compareButton, loading && styles.compareButtonDisabled]}
      onPress={onCompare}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <AppText variant="baseText">Compare Videos</AppText>
      )}
    </TouchableOpacity>
  </View>
);

interface ComparisonResultsProps {
  result: ScoringResult;
  referenceId: string;
  comparisonId: string;
  onClear: () => void;
}

const ComparisonResults = ({
  result,
  referenceId,
  comparisonId,
  onClear,
}: ComparisonResultsProps) => (
  <View style={styles.resultContainer}>
    <View style={styles.resultHeader}>
      <AppText variant="bolderBaseText">Comparison Results</AppText>
      <TouchableOpacity onPress={onClear} style={styles.clearButton}>
        <AppText variant="baseText">New Comparison</AppText>
      </TouchableOpacity>
    </View>

    <ScoreVisualization result={result} />

    <View style={styles.overlaySection}>
      <AppText variant="bolderBaseText">Skeleton overlay</AppText>
      <AppText variant="baseText">
        Reference (green) vs comparison (red), frame by frame.
      </AppText>
      <FrameComparator
        initialReferenceId={referenceId}
        initialComparisonId={comparisonId}
      />
    </View>
  </View>
);

interface VideoComparisonProps {
  initialReferenceId?: string;
  initialComparisonId?: string;
  onCompareSuccess?: (referenceId: string, comparisonId: string) => void;
}

export function VideoComparison({
  initialReferenceId = "",
  initialComparisonId = "",
  onCompareSuccess,
}: VideoComparisonProps = {}) {
  const [referenceId, setReferenceId] = useState(initialReferenceId);
  const [comparisonId, setComparisonId] = useState(initialComparisonId);
  const [selectedPreset, setSelectedPreset] = useState<PresetType>("dance");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);

  useEffect(() => {
    if (initialReferenceId) setReferenceId(initialReferenceId);
  }, [initialReferenceId]);

  useEffect(() => {
    if (initialComparisonId) setComparisonId(initialComparisonId);
  }, [initialComparisonId]);

  const handleCompare = async () => {
    if (!referenceId.trim() || !comparisonId.trim()) {
      Alert.alert("Error", "Please enter both video IDs");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const config: ComparisonConfig = COMPARISON_PRESETS[selectedPreset];
      const trimmedReference = referenceId.trim();
      const trimmedComparison = comparisonId.trim();
      const comparisonResult = await compareVideos({
        referenceVideoId: trimmedReference,
        comparisonVideoId: trimmedComparison,
        config,
      });

      setResult(comparisonResult);
      onCompareSuccess?.(trimmedReference, trimmedComparison);
    } catch (error) {
      Alert.alert(
        "Comparison Failed",
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setReferenceId("");
    setComparisonId("");
    setResult(null);
  };

  return (
    <View style={styles.container}>
      {!result ? (
        <ComparisonForm
          referenceId={referenceId}
          setReferenceId={setReferenceId}
          comparisonId={comparisonId}
          setComparisonId={setComparisonId}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          loading={loading}
          onCompare={handleCompare}
        />
      ) : (
        <ComparisonResults
          result={result}
          referenceId={referenceId}
          comparisonId={comparisonId}
          onClear={handleClear}
        />
      )}
    </View>
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
    borderColor: "rgba(128, 128, 128, 0.3)",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
  },
  presetContainer: {
    flexDirection: "row",
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.3)",
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    alignItems: "center",
  },
  presetButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  presetButtonTextActive: {
    color: "#fff",
  },
  compareButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  compareButtonDisabled: {
    opacity: 0.6,
  },
  compareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  clearButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  overlaySection: {
    padding: 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.15)",
  },
});
