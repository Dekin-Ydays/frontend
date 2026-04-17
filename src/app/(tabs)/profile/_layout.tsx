import { Stack, useRouter } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function ProfileLayout() {
  const router = useRouter();

  return (
    <Stack screenOptions={{ headerTransparent: true }}>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <TopHeader
              title="MON PROFIL"
              moreButton
              onMore={() => router.push("/profile/settings")}
            />
          ),
        }}
      />
    </Stack>
  );
}
