import { Pressable, View } from "react-native";
import { ArrowLeft, ArrowRight, Play } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { BottomBar } from "@/components/ui/bottom-bar";
import { TopBar } from "@/components/ui/top-bar";

export default function VideoReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-[#1a1a1a]" />

      <TopBar>
        <View className="flex-row items-center gap-5">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Icon icon={ArrowLeft} size={32} color="#FFFFFF" />
          </Pressable>
          <AppText variant="title">Nouvelle vidéo</AppText>
        </View>
      </TopBar>
      <BottomBar className="!justify-between">
        <Pressable
          className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
          accessibilityRole="button"
          accessibilityLabel="Retour en arrière"
        >
          <Icon icon={ArrowLeft} size={18} color="#FFFFFF" />
        </Pressable>

        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-white border border-white/5 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Lire"
        >
          <Icon icon={Play} size={32} color="#0E0E0E" />
        </Pressable>

        <Pressable
          onPress={() => router.push("/video/form")}
          className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
          accessibilityRole="button"
          accessibilityLabel="Avancer"
        >
          <Icon icon={ArrowRight} size={18} color="#FFFFFF" />
        </Pressable>
      </BottomBar>
    </View>
  );
}
