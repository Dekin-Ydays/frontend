import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { BottomBar } from "../ui/bottom-bar";

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function TabButton({ label, isActive, onPress }: TabButtonProps) {
  return (
    <Pressable
      className={`flex-1 h-full items-center justify-center rounded-full ${isActive ? "!bg-white/5" : ""} transition-all duration-300`}
      disabled={isActive}
      onPress={onPress}
    >
      <AppText className={`text-sm ${isActive ? "!text-secondary" : ""}`}>
        {label}
      </AppText>
    </Pressable>
  );
}

type AuthConnectionMenuProps = {
  activeTab: "login" | "register";
};

export function AuthConnectionMenu({ activeTab }: AuthConnectionMenuProps) {
  const router = useRouter();

  return (
    <BottomBar>
      <View className="h-16 flex-1 backdrop-blur-sm flex-row items-center justify-center rounded-full bg-white/10 border border-white/5 p-1">
        <TabButton
          label="Se connecter"
          isActive={activeTab === "login"}
          onPress={() => router.replace("/login" as Href)}
        />
        <TabButton
          label="S'inscrire"
          isActive={activeTab === "register"}
          onPress={() => router.replace("/register" as Href)}
        />
      </View>
    </BottomBar>
  );
}
