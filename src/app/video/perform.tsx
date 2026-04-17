import { Image, Pressable, View } from "react-native";
import { Xmark, RefreshDouble } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { BottomBar } from "@/components/ui/bottom-bar";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";

export default function VideoPerformScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-[#1a1a1a]" />

      <View
        className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/80 to-black/0 flex-row items-center px-5"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => router.back()}>
          <Icon icon={Xmark} size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        <View className="absolute" style={{ right: "22%", top: "28%" }}>
          <AppText variant="title" className="text-[80px] opacity-20">2</AppText>
        </View>
        <AppText variant="title" className="text-[140px]">3</AppText>
      </View>

      <BottomBar paddingExtra={12} className="flex-row items-center justify-between px-5">
        <View className="rounded-full border-2 border-white overflow-hidden h-[60px] w-[60px]">
          <Image source={{ uri: MOCK_THUMBNAIL_URI }} className="h-full w-full" resizeMode="cover" />
        </View>

        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-dangerous items-center justify-center"
          onPress={() => router.push("/video/recording")}
        >
          <View className="h-[48px] w-[48px] rounded-full bg-dangerous" />
        </Pressable>

        <Pressable className="h-[60px] w-[60px] rounded-full bg-white/10 border border-white/5 backdrop-blur-sm items-center justify-center">
          <Icon icon={RefreshDouble} size={32} color="#FFFFFF" />
        </Pressable>
      </BottomBar>
    </View>
  );
}
