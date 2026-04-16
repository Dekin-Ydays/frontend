import { useEffect } from "react";
import { Image, Pressable, View } from "react-native";
import { Cancel, RefreshDouble } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { useBottomBar } from "@/components/nav/bottom-bar-context";

const styles = {
  screen: "flex-1 bg-dark",
  header:
    "absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/80 to-black/0 flex-row items-center px-5",
  bottomBar:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 flex-row items-center justify-between px-5",
  thumbnailBorder: "rounded-full border-2 border-white overflow-hidden",
  recordButton:
    "h-[60px] w-[60px] rounded-full bg-dangerous items-center justify-center",
  recordInner: "h-[48px] w-[48px] rounded-full bg-dangerous",
  flipButton:
    "h-[60px] w-[60px] rounded-full bg-white/10 border border-white/5 items-center justify-center",
} as const;

const THUMBNAIL_URI =
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=200&q=80";

export default function VideoPerformScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hide, show } = useBottomBar();

  useEffect(() => {
    hide();
    return show;
  }, [hide, show]);

  return (
    <View className={styles.screen}>
      <View className="flex-1 bg-[#1a1a1a]" />

      <View className={styles.header} style={{ paddingTop: insets.top }}>
        <Pressable onPress={() => router.back()}>
          <Icon icon={Cancel} size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none"
      >
        <View className="absolute" style={{ right: "22%", top: "28%" }}>
          <AppText variant="title" className="text-[80px] opacity-20">
            2
          </AppText>
        </View>
        <AppText variant="title" className="text-[140px]">
          3
        </AppText>
      </View>

      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className={`${styles.thumbnailBorder} h-[60px] w-[60px]`}>
          <Image
            source={{ uri: THUMBNAIL_URI }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        <Pressable
          className={styles.recordButton}
          onPress={() => router.push("/(tabs)/(video)/recording")}
        >
          <View className={styles.recordInner} />
        </Pressable>

        <Pressable className={styles.flipButton}>
          <Icon icon={RefreshDouble} size={32} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
