import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { ArrowLeft, ArrowRight, Play } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { useBottomBar } from "@/components/nav/bottom-bar-context";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  header:
    "absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/80 to-black/0 flex-row items-center justify-between px-5",
  bottomBar:
    "absolute bottom-0 left-0 right-0 bg-gradient-to-b from-black/0 to-black/80 gap-3 pt-3",
  progressTrack: "h-[2px] bg-white/20 rounded-full mx-5",
  progressFill: "h-full w-1/2 bg-primary rounded-full",
  controlsRow: "flex-row items-center justify-between px-5",
  controlPill:
    "flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10",
  playButton:
    "h-[60px] w-[60px] rounded-full bg-white border border-white/5 items-center justify-center",
} as const;

export default function VideoReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hide, show } = useBottomBar();

  useFocusEffect(
    useCallback(() => {
      hide();
      return show;
    }, [hide, show])
  );

  return (
    <View className={styles.screen}>
      <View className="flex-1 bg-[#1a1a1a]" />

      <View className={styles.header} style={{ paddingTop: insets.top }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Icon icon={ArrowLeft} size={32} color="#FFFFFF" />
        </Pressable>
        <AppText variant="title">NOUVELLE VIDEO</AppText>
        <Pressable
          onPress={() => router.push("/(tabs)/video/form" as any)}
          accessibilityRole="button"
          accessibilityLabel="Suivant"
        >
          <AppText className="!text-primary text-sm font-montserrat-semibold">Suivant</AppText>
        </Pressable>
      </View>

      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className={styles.progressTrack}>
          <View className={styles.progressFill} />
        </View>

        <View className={styles.controlsRow}>
          <Pressable
            className={styles.controlPill}
            accessibilityRole="button"
            accessibilityLabel="Retour en arrière"
          >
            <Icon icon={ArrowLeft} size={18} color="#FFFFFF" />
          </Pressable>

          <Pressable
            className={styles.playButton}
            accessibilityRole="button"
            accessibilityLabel="Lire"
          >
            <Icon icon={Play} size={32} color="#0E0E0E" />
          </Pressable>

          <Pressable
            className={styles.controlPill}
            accessibilityRole="button"
            accessibilityLabel="Avancer"
          >
            <Icon icon={ArrowRight} size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
