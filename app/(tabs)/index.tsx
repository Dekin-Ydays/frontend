import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExternalLink } from '@/components/external-link';
import { FrameComparator } from '@/components/frame-comparator';
import MediaPipeDemo from '@/components/mediapipe-demo';
import { Collapsible } from '@/components/ui/collapsible';
import { VideoComparison } from '@/components/video-comparison';
import { VideoReplay } from '@/components/video-replay';
import { Fonts } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
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
      <ThemedText>Capture body poses with MediaPipe and compare videos using AI-powered scoring.</ThemedText>

      <Collapsible title="📹 Record Poses">
        <ThemedText>
          This demo uses{' '}
          <ThemedText
            type="defaultSemiBold"
            style={{ fontFamily: Fonts.mono }}
          >
            @mediapipe/tasks-vision
          </ThemedText>{' '}
          on web to perform real-time body pose tracking. It detects 33 body landmarks including face, torso, arms, and
          legs.
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
          Compare two pose videos and get detailed scoring on position accuracy, joint angles, and timing. Perfect for
          dance, yoga, sports form analysis, and more.
        </ThemedText>
        <VideoComparison />
      </Collapsible>

      <Collapsible title="⏺ Replay Videos">
        <ThemedText style={{ marginBottom: 12 }}>
          Replay recorded pose videos frame-by-frame on a canvas. Use the timeline to scrub and the controls to step
          through frames.
        </ThemedText>
        <VideoReplay />
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    position: 'absolute',
  },
});
