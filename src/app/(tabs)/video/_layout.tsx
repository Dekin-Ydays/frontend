import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function VideoLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true }}>
      <Stack.Screen name="creation" options={{ headerShown: false }} />
      <Stack.Screen
        name="form"
        options={{ header: () => <TopHeader backButton title="NOUVELLE VIDEO" /> }}
      />
      <Stack.Screen name="perform" options={{ headerShown: false }} />
      <Stack.Screen name="recording" options={{ headerShown: false }} />
      <Stack.Screen name="review" options={{ headerShown: false }} />
      <Stack.Screen
        name="score"
        options={{ header: () => <TopHeader backButton title="RÉSULTAT" /> }}
      />
    </Stack>
  );
}
