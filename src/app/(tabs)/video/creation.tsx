import { useCallback, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Xmark, MusicNote, RefreshDouble } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { useBottomBar } from "@/components/nav/bottom-bar-context";
import type { MusicItem } from "@/types/video";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";
import { MusicPickerBottomSheet } from "@/components/video/music-picker-bottom-sheet";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  header:
    "absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/80 to-black/0 flex-row items-center justify-between px-5",
  headerLeft: "flex-row items-center gap-5",
  musicPill:
    "flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10",
  bottomBar:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 flex-row items-center justify-between px-5",
  thumbnailBorder: "rounded-full border-2 border-white overflow-hidden",
  recordButton:
    "h-[60px] w-[60px] rounded-full bg-[#E84545] items-center justify-center",
  recordInner: "h-[48px] w-[48px] rounded-full bg-[#E84545]",
  flipButton:
    "h-[60px] w-[60px] rounded-full bg-white/10 border border-white/5 items-center justify-center",
} as const;

/*
// Main component
*/
export default function VideoCreationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hide, show } = useBottomBar();
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      hide();
      return show;
    }, [hide, show])
  );

  const handleSelectMusic = (item: MusicItem) => {
    setSelectedMusic(item);
  };

  return (
    <View className={styles.screen}>
      <View className="flex-1 bg-[#1a1a1a]" />

      <View className={styles.header} style={{ paddingTop: insets.top }}>
        <View className={styles.headerLeft}>
          <Pressable onPress={() => router.back()}>
            <Icon icon={Xmark} size={32} color="#FFFFFF" />
          </Pressable>
          <AppText variant="title">NOUVELLE VIDEO</AppText>
        </View>
        <Pressable
          className={styles.musicPill}
          onPress={() => setMusicModalVisible(true)}
        >
          <Icon icon={MusicNote} size={18} color="#FFFFFF" />
          <AppText className="text-sm">
            {selectedMusic ? selectedMusic.title : "Musique"}
          </AppText>
        </Pressable>
      </View>

      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className={`${styles.thumbnailBorder} h-[60px] w-[60px]`}>
          <Image
            source={{ uri: MOCK_THUMBNAIL_URI }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        <Pressable
          className={styles.recordButton}
          onPress={() => router.push("/(tabs)/video/perform")}
        >
          <View className={styles.recordInner} />
        </Pressable>

        <Pressable className={styles.flipButton}>
          <Icon icon={RefreshDouble} size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <MusicPickerBottomSheet
        visible={musicModalVisible}
        onClose={() => setMusicModalVisible(false)}
        onSelect={handleSelectMusic}
      />
    </View>
  );
}
