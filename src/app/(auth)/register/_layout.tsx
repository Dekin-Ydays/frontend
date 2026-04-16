import { Stack } from "expo-router";
import { RegisterProvider } from "@/contexts/register-context";

export default function RegisterLayout() {
  return (
    <RegisterProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
    </RegisterProvider>
  );
}
