import { Pressable, View } from "react-native";
import { ArrowLeft, ArrowRight, Play } from "iconoir-react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { BottomBar } from "@/components/ui/bottom-bar";
import { TopBar } from "@/components/ui/top-bar";

export default function VideoReviewScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-dark" />

      <TopBar>
        <View className="flex-row items-center gap-5">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <ArrowLeft className="size-8 text-white" />
          </Pressable>
          <AppText variant="title">NOUVELLE VIDÉO</AppText>
        </View>
      </TopBar>
      <BottomBar className="!justify-between">
        <Pressable
          className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
          accessibilityRole="button"
          accessibilityLabel="Retour en arrière"
        >
          <ArrowLeft className="size-5 text-white" />
        </Pressable>

        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-white border border-white/5 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Lire"
        >
          <Play className="size-8 text-dark" />
        </Pressable>

        <Pressable
          onPress={() => router.push("/video/form")}
          className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
          accessibilityRole="button"
          accessibilityLabel="Avancer"
        >
          <ArrowRight className="size-5 text-white" />
        </Pressable>
      </BottomBar>
    </View>
  );
}
