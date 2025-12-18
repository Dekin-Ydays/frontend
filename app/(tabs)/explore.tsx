import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import MediaPipeDemo from '@/components/mediapipe-demo';
import { FrameComparator } from '@/components/frame-comparator';
import { VideoComparison } from '@/components/video-comparison';
import { VideoReplay } from '@/components/video-replay';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Pose Analysis
        </ThemedText>
      </ThemedView>
      <ThemedText>
        Capture body poses with MediaPipe and compare videos using AI-powered scoring.
      </ThemedText>

      <Collapsible title="📹 Record Poses">
        <ThemedText>
          This demo uses{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            @mediapipe/tasks-vision
          </ThemedText>{' '}
          on web to perform real-time body pose tracking. It detects 33 body landmarks including
          face, torso, arms, and legs.
        </ThemedText>
        <ThemedText style={{ marginTop: 8, marginBottom: 8 }}>
          Poses are automatically streamed to the backend and saved as videos for comparison.
        </ThemedText>
        <MediaPipeDemo />
        <ExternalLink href="https://developers.google.com/mediapipe">
          <ThemedText type="link">Learn more about MediaPipe</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="🆚 Frame Comparator">
        <ThemedText style={{ marginBottom: 12 }}>
          Compare two videos visually by overlaying their pose landmarks. Green is the reference, Red is the comparison.
        </ThemedText>
        <FrameComparator />
      </Collapsible>

      <Collapsible title="⚖️ Compare Videos">
        <ThemedText style={{ marginBottom: 12 }}>
          Compare two pose videos and get detailed scoring on position accuracy, joint angles, and
          timing. Perfect for dance, yoga, sports form analysis, and more.
        </ThemedText>
        <VideoComparison />
      </Collapsible>

      <Collapsible title="⏺ Replay Videos">
        <ThemedText style={{ marginBottom: 12 }}>
          Replay recorded pose videos frame-by-frame on a canvas. Use the timeline to scrub and the
          controls to step through frames.
        </ThemedText>
        <VideoReplay />
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
