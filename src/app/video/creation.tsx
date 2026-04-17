import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Xmark, MusicNote, RefreshDouble } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { BottomBar } from "@/components/ui/bottom-bar";
import type { MusicItem } from "@/types/video";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";
import { MusicPickerBottomSheet } from "@/components/video/music-picker-bottom-sheet";

export default function VideoCreationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-[#1a1a1a]" />

      <View
        className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/80 to-black/0 flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center gap-5">
          <Pressable onPress={() => router.back()}>
            <Icon icon={Xmark} size={32} color="#FFFFFF" />
          </Pressable>
          <AppText variant="title">NOUVELLE VIDEO</AppText>
        </View>
        <Pressable
          className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
          onPress={() => setMusicModalVisible(true)}
        >
          <Icon icon={MusicNote} size={18} color="#FFFFFF" />
          <AppText className="text-sm">
            {selectedMusic ? selectedMusic.title : "Musique"}
          </AppText>
        </Pressable>
      </View>

      <BottomBar paddingExtra={12} className="flex-row items-center justify-between px-5">
        <View className="rounded-full border-2 border-white overflow-hidden h-[60px] w-[60px]">
          <Image source={{ uri: MOCK_THUMBNAIL_URI }} className="h-full w-full" resizeMode="cover" />
        </View>

        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-[#E84545] items-center justify-center"
          onPress={() => router.push("/video/perform")}
        >
          <View className="h-[48px] w-[48px] rounded-full bg-[#E84545]" />
        </Pressable>

        <Pressable className="h-[60px] w-[60px] rounded-full bg-white/10 border border-white/5 backdrop-blur-sm items-center justify-center">
          <Icon icon={RefreshDouble} size={32} color="#FFFFFF" />
        </Pressable>
      </BottomBar>

      <MusicPickerBottomSheet
        visible={musicModalVisible}
        onClose={() => setMusicModalVisible(false)}
        onSelect={(item) => setSelectedMusic(item)}
      />
    </View>
  );
}
