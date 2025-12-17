import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import MediaPipeDemo from '@/components/mediapipe-demo';

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
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="MediaPipe Body Tracking">
        <ThemedText>
          This demo uses{' '}
          <ThemedText
            type="defaultSemiBold"
            style={{ fontFamily: Fonts.mono }}
          >
            @mediapipe/tasks-vision
          </ThemedText>{' '}
          on web to perform real-time body pose tracking. It detects 33 body landmarks including face, torso, arms, and
          legs, then draws them on a canvas with head orientation tracking.
        </ThemedText>
        <ThemedText style={{ marginTop: 8, marginBottom: 8 }}>
          On mobile, the camera is accessible but full pose detection requires additional native modules or development
          builds.
        </ThemedText>
        <MediaPipeDemo />
        <ExternalLink href="https://developers.google.com/mediapipe">
          <ThemedText type="link">Learn more about MediaPipe</ThemedText>
        </ExternalLink>
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
