import { Stack } from "expo-router";
import { TopHeader } from "@/components/nav/top-header";
import { RegisterProvider } from "@/contexts/register-context";

export default function RegisterLayout() {
  return (
    <RegisterProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="step-1"
          options={{ headerShown: true, header: () => <TopHeader title="S'INSCRIRE" /> }}
        />
        <Stack.Screen
          name="step-2"
          options={{ headerShown: true, header: () => <TopHeader title="S'INSCRIRE" backButton /> }}
        />
        <Stack.Screen
          name="step-3"
          options={{ headerShown: true, header: () => <TopHeader title="S'INSCRIRE" backButton /> }}
        />
      </Stack>
    </RegisterProvider>
  );
}
