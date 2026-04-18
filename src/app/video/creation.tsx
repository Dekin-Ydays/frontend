import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Xmark, MusicNote } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import type { MusicItem } from "@/types/video";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";
import { MusicPickerBottomSheet } from "@/components/video/music-picker-bottom-sheet";
import { VideoRecordingControls } from "@/components/video/video-recording-controls";
import { TopBar } from "@/components/ui/top-bar";

export default function VideoCreationScreen() {
  const router = useRouter();
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-charcoal" />

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

      <VideoRecordingControls
        thumbnailUri={MOCK_THUMBNAIL_URI}
        onRecord={() => router.push("/video/perform")}
      />

      <MusicPickerBottomSheet
        visible={musicModalVisible}
        onClose={() => setMusicModalVisible(false)}
        onSelect={(item) => setSelectedMusic(item)}
      />
    </View>
  );
}
