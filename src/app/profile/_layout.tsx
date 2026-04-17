import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true }}>
      <Stack.Screen
        name="[userId]"
        options={{ header: () => <TopHeader backButton title="PROFIL" moreButton /> }}
      />
      <Stack.Screen
        name="settings"
        options={{ header: () => <TopHeader backButton title="PARAMÈTRES" /> }}
      />
      <Stack.Screen
        name="edit"
        options={{ header: () => <TopHeader backButton title="MODIFIER LE PROFIL" /> }}
      />
    </Stack>
  );
}
