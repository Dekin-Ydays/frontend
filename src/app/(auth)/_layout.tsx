import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login"
        options={{ headerShown: true, header: () => <TopHeader title="SE CONNECTER" /> }}
      />
    </Stack>
  );
}
