import { Stack } from "expo-router";
import { TopFeed } from "@/components/nav/top-feed";

export default function FeedLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <TopFeed />,
      }}
    />
  );
}
