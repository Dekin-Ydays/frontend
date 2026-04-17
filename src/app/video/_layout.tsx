import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function VideoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="form"
        options={{ headerShown: true, header: () => <TopHeader backButton title="NOUVELLE VIDEO" /> }}
      />
      <Stack.Screen
        name="score"
        options={{ headerShown: true, header: () => <TopHeader backButton title="RÉSULTAT" /> }}
      />
    </Stack>
  );
}
