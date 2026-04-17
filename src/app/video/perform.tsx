import { Image, Pressable, View } from "react-native";
import { Xmark, RefreshDouble } from "iconoir-react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/app-icon";
import { BottomBar } from "@/components/ui/bottom-bar";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";
import { TopBar } from "@/components/ui/top-bar";

export default function VideoPerformScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-[#1a1a1a]" />

      <TopBar>
        <Pressable onPress={() => router.back()}>
          <Icon icon={Xmark} size="lg" color="#FFFFFF" />
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

      <BottomBar className="!justify-between">
        <View className="rounded-full border-2 border-white overflow-hidden h-[60px] w-[60px]">
          <Image
            source={{ uri: MOCK_THUMBNAIL_URI }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-dangerous items-center justify-center"
          onPress={() => router.push("/video/recording")}
        >
          <View className="h-[48px] w-[48px] rounded-full bg-dangerous" />
        </Pressable>

        <Pressable className="h-[60px] w-[60px] rounded-full bg-white/10 border border-white/5 backdrop-blur-sm items-center justify-center">
          <Icon icon={RefreshDouble} size="lg" color="#FFFFFF" />
        </Pressable>
      </BottomBar>
    </View>
  );
}
