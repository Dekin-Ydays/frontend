import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "./ui/app-text";
import {
  getPoseHealth,
  type PoseExtractionHealth,
} from "@/services/video-parser-api";

export function PipelineHealthBanner() {
  const [health, setHealth] = useState<PoseExtractionHealth | null>(null);
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPoseHealth()
      .then((h) => {
        if (!cancelled) {
          setHealth(h);
          setUnreachable(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHealth(null);
          setUnreachable(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (unreachable) {
    return (
      <View style={styles.errorBanner}>
        <AppText variant="bolderBaseText">⚠ Server unreachable</AppText>
        <AppText variant="baseText">
          Could not reach the video-parser. Recordings cannot be processed.
        </AppText>
      </View>
    );
  }

  if (!health || health.ready) {
    return null;
  }

  return (
    <View style={styles.warningBanner}>
      <AppText variant="bolderBaseText">
        ⚠ Server precise-extraction pipeline not ready
      </AppText>
      {!health.workerScript.present ? (
        <AppText variant="baseText">
          Missing python worker at {health.workerScript.path}
        </AppText>
      ) : null}
      {!health.model.present ? (
        <AppText variant="baseText">
          Missing heavy pose model at {health.model.path}
        </AppText>
      ) : null}
      {health.storage && !health.storage.ready ? (
        <AppText variant="baseText">
          Object storage unreachable at {health.storage.endpoint} (bucket{" "}
          {health.storage.bucket})
          {health.storage.error ? `: ${health.storage.error}` : ""}
        </AppText>
      ) : null}
      <AppText variant="baseText">
        Recordings will upload but extraction will fail until this is fixed.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  warningBanner: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.5)",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
});
