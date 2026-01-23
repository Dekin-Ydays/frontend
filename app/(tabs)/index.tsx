import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ExternalLink } from "@/components/external-link";
import { FrameComparator } from "@/components/frame-comparator";
import MediaPipeDemo from "@/components/mediapipe-demo";
import { Collapsible } from "@/components/ui/collapsible";
import { VideoComparison } from "@/components/video-comparison";
import { VideoReplay } from "@/components/video-replay";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title} className="font-bebas">
          Pose Analysis
        </Text>
      </View>
      <Text>
        Capture body poses with MediaPipe and compare videos using AI-powered
        scoring.
      </Text>

      <Collapsible title="📹 Record Poses">
        <Text>
          This demo uses{" "}
          <Text style={styles.semiBold} className="font-mono">
            @mediapipe/tasks-vision
          </Text>{" "}
          on web to perform real-time body pose tracking. It detects 33 body
          landmarks including face, torso, arms, and legs.
        </Text>
        <Text style={{ marginTop: 8, marginBottom: 8 }}>
          Poses are automatically streamed to the backend and saved as videos
          for comparison.
        </Text>
        <MediaPipeDemo />
        <ExternalLink href="https://developers.google.com/mediapipe">
          <Text style={styles.link}>Learn more about MediaPipe</Text>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="🆚 Frame Comparator">
        <Text style={{ marginBottom: 12 }}>
          Compare two videos visually by overlaying their pose landmarks. Green
          is the reference, Red is the comparison.
        </Text>
        <FrameComparator />
      </Collapsible>

      <Collapsible title="⚖️ Compare Videos">
        <Text style={{ marginBottom: 12 }}>
          Compare two pose videos and get detailed scoring on position accuracy,
          joint angles, and timing. Perfect for dance, yoga, sports form
          analysis, and more.
        </Text>
        <VideoComparison />
      </Collapsible>

      <Collapsible title="⏺ Replay Videos">
        <Text style={{ marginBottom: 12 }}>
          Replay recorded pose videos frame-by-frame on a canvas. Use the
          timeline to scrub and the controls to step through frames.
        </Text>
        <VideoReplay />
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 32,
  },
  semiBold: {
    fontWeight: "600",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
