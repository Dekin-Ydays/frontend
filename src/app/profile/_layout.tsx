import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[userId]"
        options={{ headerShown: true, header: () => <TopHeader backButton title="PROFIL" moreButton /> }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: true, header: () => <TopHeader backButton title="PARAMÈTRES" /> }}
      />
      <Stack.Screen
        name="edit"
        options={{ headerShown: true, header: () => <TopHeader backButton title="MODIFIER LE PROFIL" /> }}
      />
    </Stack>
  );
}
