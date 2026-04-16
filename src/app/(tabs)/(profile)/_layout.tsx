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
              editButton
              onEdit={() => router.push("/(tabs)/(profile)/edit")}
            />
          ),
        }}
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
