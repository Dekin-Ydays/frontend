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
              onMore={() => router.push("/(tabs)/(profile)/settings")}
            />
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{ header: () => <TopHeader backButton title="PARAMÈTRES" /> }}
      />
      <Stack.Screen
        name="edit"
        options={{ header: () => <TopHeader backButton title="MODIFIER LE PROFIL" /> }}
      />
      <Stack.Screen
        name="[userId]"
        options={{ header: () => <TopHeader backButton title="PROFIL" moreButton /> }}
      />
    </Stack>
  );
}
