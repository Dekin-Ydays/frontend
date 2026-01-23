import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  compareVideos,
  ComparisonConfig,
  ScoringResult,
  COMPARISON_PRESETS,
} from "@/services/video-parser-api";
import { ScoreVisualization } from "./score-visualization";

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
    <Text style={[styles.label, styles.semiBold]}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(128, 128, 128, 0.5)"
      autoCapitalize="none"
      autoCorrect={false}
    />
    <Text style={styles.hint}>{hint}</Text>
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
    <Text style={[styles.title, styles.subtitle]}>Compare Videos</Text>

    <VideoInput
      label="Reference Video ID"
      value={referenceId}
      onChangeText={setReferenceId}
      placeholder="Enter reference video ID"
      hint="The video to compare against (teacher/reference)"
    />

    <VideoInput
      label="Comparison Video ID"
      value={comparisonId}
      onChangeText={setComparisonId}
      placeholder="Enter comparison video ID"
      hint="The video to analyze (student/comparison)"
    />

    <View style={styles.inputGroup}>
      <Text style={[styles.label, styles.semiBold]}>Comparison Preset</Text>
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
            <Text
              style={[
                styles.presetButtonText,
                selectedPreset === preset && styles.presetButtonTextActive,
              ]}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>
        {selectedPreset === "dance" && "Position & angles balanced (50/50)"}
        {selectedPreset === "yoga" && "Focus on angles, rotation-invariant"}
        {selectedPreset === "sports" &&
          "Focus on position, higher visibility threshold"}
      </Text>
    </View>

    <TouchableOpacity
      style={[styles.compareButton, loading && styles.compareButtonDisabled]}
      onPress={onCompare}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.compareButtonText}>Compare Videos</Text>
      )}
    </TouchableOpacity>
  </View>
);

interface ComparisonResultsProps {
  result: ScoringResult;
  onClear: () => void;
}

const ComparisonResults = ({ result, onClear }: ComparisonResultsProps) => (
  <View style={styles.resultContainer}>
    <View style={styles.resultHeader}>
      <Text style={styles.subtitle}>Comparison Results</Text>
      <TouchableOpacity onPress={onClear} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>New Comparison</Text>
      </TouchableOpacity>
    </View>

    <ScoreVisualization result={result} />
  </View>
);

export function VideoComparison() {
  const [referenceId, setReferenceId] = useState("");
  const [comparisonId, setComparisonId] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<PresetType>("dance");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const handleCompare = async () => {
    if (!referenceId.trim() || !comparisonId.trim()) {
      Alert.alert("Error", "Please enter both video IDs");
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
        <ComparisonResults result={result} onClear={handleClear} />
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
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  semiBold: {
    fontWeight: "600",
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
});
