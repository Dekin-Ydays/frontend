import { View, Pressable } from "react-native";
import { Xmark } from "iconoir-react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";
import { VideoRecordingControls } from "@/components/video/video-recording-controls";
import { TopBar } from "@/components/ui/top-bar";

export default function VideoPerformScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-dark" />

      <TopBar>
        <Pressable onPress={() => router.back()}>
          <Xmark className="size-8 text-white" />
        </Pressable>
      </TopBar>

      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none"
      >
        <AppText variant="title" className="text-[140px]">
          3
        </AppText>
      </View>

      <VideoRecordingControls
        thumbnailUri={MOCK_THUMBNAIL_URI}
        onRecord={() => router.push("/video/recording")}
      />
    </View>
  );
}
