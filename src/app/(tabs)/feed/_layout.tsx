import { Stack } from "expo-router";
import { TopFeed } from "@/components/nav/top-feed";

export default function FeedLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        header: () => <TopFeed />,
        animation: "none",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="for-you" />
      <Stack.Screen name="following" />
      <Stack.Screen name="favorites" />
    </Stack>
  );
}
