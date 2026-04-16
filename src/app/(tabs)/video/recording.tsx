import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useBottomBar } from "@/components/nav/bottom-bar-context";



export default function VideoRecordingScreen() {
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

      <View
        className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 items-center justify-center"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-white border border-white/5 items-center justify-center"
          onPress={() => router.push("/(tabs)/video/review")}
          accessibilityRole="button"
          accessibilityLabel="Arrêter l'enregistrement"
        >
          <View className="h-[25px] w-[25px] rounded-[5px] bg-dangerous" />
        </Pressable>
      </View>
    </View>
  );
}
