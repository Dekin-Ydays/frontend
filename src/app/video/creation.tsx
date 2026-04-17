import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Xmark, MusicNote, RefreshDouble } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { BottomBar } from "@/components/ui/bottom-bar";
import type { MusicItem } from "@/types/video";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";
import { MusicPickerBottomSheet } from "@/components/video/music-picker-bottom-sheet";
import { TopBar } from "@/components/ui/top-bar";

export default function VideoCreationScreen() {
  const router = useRouter();
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-[#1a1a1a]" />

      <TopBar>
        <View className="flex-row items-center gap-5">
          <Pressable onPress={() => router.back()}>
            <Xmark className="size-8 text-white" />
          </Pressable>
          <AppText variant="title">NOUVELLE VIDEO</AppText>
        </View>
        <Pressable
          className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
          onPress={() => setMusicModalVisible(true)}
        >
          <MusicNote className="size-5 text-white" />
          <AppText className="text-sm">
            {selectedMusic ? selectedMusic.title : "Musique"}
          </AppText>
        </Pressable>
      </TopBar>

      <BottomBar className="!justify-between">
        <View className="rounded-full border-2 border-white overflow-hidden h-[60px] w-[60px]">
          <Image
            source={{ uri: MOCK_THUMBNAIL_URI }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-[#E84545] items-center justify-center"
          onPress={() => router.push("/video/perform")}
        >
          <View className="h-[48px] w-[48px] rounded-full bg-[#E84545]" />
        </Pressable>

        <Pressable className="h-[60px] w-[60px] rounded-full bg-white/10 border border-white/5 backdrop-blur-sm items-center justify-center">
          <RefreshDouble className="size-8 text-white" />
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
