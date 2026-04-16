import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { ArrowLeft, ArrowRight, Play } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import { useBottomBar } from "@/components/nav/bottom-bar-context";



export default function VideoReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hide, show } = useBottomBar();

  useFocusEffect(
    useCallback(() => {
      hide();
      return show;
    }, [hide, show])
  );

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-[#1a1a1a]" />

      <View className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/80 to-black/0 flex-row items-center justify-between px-5" style={{ paddingTop: insets.top }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Icon icon={ArrowLeft} size={32} color="#FFFFFF" />
        </Pressable>
        <AppText variant="title">NOUVELLE VIDEO</AppText>
        <Pressable
          onPress={() => router.push("/(tabs)/video/form" as any)}
          accessibilityRole="button"
          accessibilityLabel="Suivant"
        >
          <AppText className="!text-primary text-sm font-montserrat-semibold">Suivant</AppText>
        </Pressable>
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-black/0 to-black/80 gap-3 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="h-[2px] bg-white/20 rounded-full mx-5">
          <View className="h-full w-1/2 bg-primary rounded-full" />
        </View>

        <View className="flex-row items-center justify-between px-5">
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
            className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
            accessibilityRole="button"
            accessibilityLabel="Avancer"
          >
            <Icon icon={ArrowRight} size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
