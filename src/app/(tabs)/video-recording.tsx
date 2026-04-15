import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  // Camera bottom bar (single centered stop button)
  bottomBar:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 items-center justify-center",
  stopButton:
    "h-[60px] w-[60px] rounded-full bg-white border border-white/5 items-center justify-center",
  stopInner: "h-[25px] w-[25px] rounded-[5px] bg-dangerous",
} as const;

/*
// Main component
*/
export default function VideoRecordingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className={styles.screen}>
      {/* Camera placeholder */}
      <View className="flex-1 bg-[#1a1a1a]" />

      {/* Bottom bar — stop button centered */}
      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          className={styles.stopButton}
          onPress={() => router.push("/(tabs)/video-review")}
          accessibilityRole="button"
          accessibilityLabel="Arrêter l'enregistrement"
        >
          <View className={styles.stopInner} />
        </Pressable>
      </View>
    </View>
  );
}
