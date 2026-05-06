import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { BottomBar } from "@/components/ui/bottom-bar";

export default function VideoRecordingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 bg-dark" />

      <BottomBar>
        <Pressable
          className="h-16 w-16 rounded-full bg-white border border-white/5 items-center justify-center"
          onPress={() => router.push("/video/review")}
          accessibilityRole="button"
          accessibilityLabel="Arrêter l'enregistrement"
        >
          <View className="h-6 w-6 rounded-md bg-dangerous" />
        </Pressable>
      </BottomBar>
    </View>
  );
}
