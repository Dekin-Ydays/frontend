import { View, ScrollView } from "react-native";
import { ExternalLink } from "@/components/external-link";
import { FrameComparator } from "@/components/frame-comparator";
import MediaPipeDemo from "@/components/mediapipe-demo";
import { Collapsible } from "@/components/ui/collapsible";
import { VideoComparison } from "@/components/video-comparison";
import { VideoReplay } from "@/components/video-replay";
import { AppText } from "@/components/ui/app-text";

export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4 pb-32 bg-dark"
    >
      <View className="flex-row items-center gap-2">
        <AppText variant="title">Pose Analysis</AppText>
      </View>
      <AppText>
        Capture body poses with MediaPipe and compare videos using AI-powered
        scoring.
      </AppText>

      <Collapsible title="📹 Record Poses">
        <AppText>
          This demo uses{" "}
          <AppText className="font-semibold font-mono">
            @mediapipe/tasks-vision
          </AppText>{" "}
          on web to perform real-time body pose tracking. It detects 33 body
          landmarks including face, torso, arms, and legs.
        </AppText>
        <AppText className="mt-2 mb-2">
          Poses are automatically streamed to the backend and saved as videos
          for comparison.
        </AppText>
        <MediaPipeDemo />
        <ExternalLink href="https://developers.google.com/mediapipe">
          <AppText className="text-blue-500">
            Learn more about MediaPipe
          </AppText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="🆚 Frame Comparator">
        <AppText className="mb-3">
          Compare two videos visually by overlaying their pose landmarks. Green
          is the reference, Red is the comparison.
        </AppText>
        <FrameComparator />
      </Collapsible>

      <Collapsible title="⚖️ Compare Videos">
        <AppText className="mb-3">
          Compare two pose videos and get detailed scoring on position accuracy,
          joint angles, and timing. Perfect for dance, yoga, sports form
          analysis, and more.
        </AppText>
        <VideoComparison />
      </Collapsible>

      <Collapsible title="⏺ Replay Videos">
        <AppText className="mb-3">
          Replay recorded pose videos frame-by-frame on a canvas. Use the
          timeline to scrub and the controls to step through frames.
        </AppText>
        <VideoReplay />
      </Collapsible>
    </ScrollView>
  );
}
