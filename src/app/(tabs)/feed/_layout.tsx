import { View } from "react-native";
import { Stack } from "expo-router";
import { TopFeed } from "@/components/nav/top-feed";

export default function FeedLayout() {
  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />
      <TopFeed />
    </View>
  );
}
