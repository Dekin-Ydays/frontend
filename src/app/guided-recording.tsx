import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { Camera, RefreshDouble } from "iconoir-react-native";

import { AppText } from "@/components/ui/app-text";
import { useVideoList } from "@/hooks/use-video-list";
import {
  getVideo,
  type VideoFrame,
  type VideoMetadata,
} from "@/services/video-parser-api";

function formatDuration(ms: number | null): string {
  if (!ms) return "0:00";
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function isUsableReference(video: VideoMetadata): boolean {
  return video.endTime !== null && video.frameCount > 0 && video.duration !== null;
}

export default function GuidedRecordingScreen() {
  const { videos, loading, error, refresh } = useVideoList();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [referenceFrames, setReferenceFrames] = useState<VideoFrame[]>([]);
  const [loadingFrames, setLoadingFrames] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const references = useMemo(
    () => videos.filter(isUsableReference),
    [videos],
  );

  useEffect(() => {
    if (!selectedId) {
      setReferenceFrames([]);
      setSelectionError(null);
      return;
    }

    let cancelled = false;
    setLoadingFrames(true);
    setSelectionError(null);
    setReferenceFrames([]);

    getVideo(selectedId)
      .then((video) => {
        if (cancelled) return;
        if (video.frames.length === 0) {
          setSelectionError("No skeleton frames were found for this video.");
          return;
        }
        setReferenceFrames(video.frames);
      })
      .catch((err) => {
        if (cancelled) return;
        setSelectionError(
          err instanceof Error ? err.message : "Failed to load reference video",
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingFrames(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const canStartGuided =
    !!selectedId && referenceFrames.length > 0 && !loadingFrames && !selectionError;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <AppText variant="baseText">&lt; Back</AppText>
        </Pressable>
        <View style={styles.headerText}>
          <AppText variant="title">REFERENCE</AppText>
          <AppText variant="secondaryText">Choisissez un squelette</AppText>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#fff" />
            <AppText variant="baseText">Loading videos...</AppText>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <AppText variant="baseText">{error}</AppText>
            <Pressable
              onPress={refresh}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel="Recharger les videos"
            >
              <RefreshDouble className="size-5 text-white" />
              <AppText variant="baseText">Retry</AppText>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && references.length === 0 ? (
          <View style={styles.centerBox}>
            <AppText variant="bolderBaseText">
              No processed videos available
            </AppText>
            <AppText variant="baseText">
              Record and process a video before starting a guided session.
            </AppText>
          </View>
        ) : null}

        {references.map((video) => {
          const selected = selectedId === video.id;
          return (
            <Pressable
              key={video.id}
              onPress={() => setSelectedId(video.id)}
              style={[styles.videoRow, selected && styles.videoRowSelected]}
              accessibilityRole="button"
              accessibilityLabel={`Selectionner la video ${formatTimestamp(video.startTime)}`}
            >
              <View style={styles.videoHeader}>
                <AppText variant="bolderBaseText" numberOfLines={1}>
                  {formatTimestamp(video.startTime)}
                </AppText>
                <View style={styles.frameBadge}>
                  <AppText variant="baseText">{video.frameCount} frames</AppText>
                </View>
              </View>
              <AppText variant="secondaryText">
                {formatDuration(video.duration)} - ID {video.id}
              </AppText>
            </Pressable>
          );
        })}

        {selectionError ? (
          <View style={styles.errorBox}>
            <AppText variant="baseText">{selectionError}</AppText>
          </View>
        ) : null}

        {loadingFrames ? (
          <View style={styles.inlineStatus}>
            <ActivityIndicator color="#fff" />
            <AppText variant="baseText">Loading skeleton...</AppText>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push("/camera" as Href)}
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel="Enregistrer sans reference"
        >
          <Camera className="size-5 text-white" />
          <AppText variant="baseText">Record without reference</AppText>
        </Pressable>

        <Pressable
          onPress={() =>
            selectedId &&
            router.push({
              pathname: "/camera",
              params: { reference: selectedId },
            })
          }
          disabled={!canStartGuided}
          style={[styles.primaryButton, !canStartGuided && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Demarrer avec la reference"
        >
          <Camera className="size-6 text-dark" />
          <AppText variant="bolderBaseText" className="!text-dark">
            Start guided recording
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0E0E0E",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
    gap: 12,
  },
  centerBox: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 10,
  },
  videoRow: {
    gap: 10,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  videoRowSelected: {
    borderColor: "#9BFF68",
    backgroundColor: "rgba(155,255,104,0.12)",
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  frameBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  errorBox: {
    padding: 14,
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  inlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 12,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0E0E0E",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 8,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#9BFF68",
  },
  disabled: {
    opacity: 0.45,
  },
});
