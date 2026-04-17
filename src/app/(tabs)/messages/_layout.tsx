import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";
import { MOCK_AVATARS } from "@/mocks/avatars";

const USER_AVATAR_URI = MOCK_AVATARS[0];

export default function MessagesLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true }}>
      <Stack.Screen
        name="index"
        options={{ header: () => <TopHeader title="MESSAGES" avatarUri={USER_AVATAR_URI} /> }}
      />
    </Stack>
  );
}
