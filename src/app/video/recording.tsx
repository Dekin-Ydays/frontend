import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { BottomBar } from "@/components/ui/bottom-bar";

export default function VideoRecordingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-[#1a1a1a]" />

      <BottomBar paddingExtra={12} className="items-center justify-center">
        <Pressable
          className="h-[60px] w-[60px] rounded-full bg-white border border-white/5 items-center justify-center"
          onPress={() => router.push("/video/review")}
          accessibilityRole="button"
          accessibilityLabel="Arrêter l'enregistrement"
        >
          <View className="h-[25px] w-[25px] rounded-[5px] bg-dangerous" />
        </Pressable>
      </BottomBar>
    </View>
  );
}
