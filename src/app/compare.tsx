import React, { useCallback } from "react";
import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/ui/app-text";
import { VideoComparison } from "@/components/video-comparison";

export default function CompareScreen() {
  const { reference, comparison } = useLocalSearchParams<{
    reference?: string;
    comparison?: string;
  }>();

  const handleSuccess = useCallback(
    (referenceId: string, comparisonId: string) => {
      router.setParams({
        reference: referenceId,
        comparison: comparisonId,
      });
    },
    [],
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <AppText variant="baseText">‹ Back</AppText>
        </Pressable>
        <AppText variant="title">Compare</AppText>
      </View>
      <VideoComparison
        initialReferenceId={reference ?? ""}
        initialComparisonId={comparison ?? ""}
        onCompareSuccess={handleSuccess}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0E0E0E",
  },
  content: {
    paddingTop: 48,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
