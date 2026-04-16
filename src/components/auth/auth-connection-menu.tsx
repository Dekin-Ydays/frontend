import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";

/*
// Tailwind styles
*/
const styles = {
  container:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 justify-center px-5",
  tabsRow:
    "flex-row items-center gap-2.5 bg-white/10 rounded-full border border-white/5 p-1.5",
  activeTab:
    "flex-1 h-[50px] items-center justify-center rounded-full bg-white/5",
  inactiveTab: "flex-1 h-[50px] items-center justify-center rounded-full",
} as const;

/*
// Main component
*/
type AuthConnectionMenuProps = {
  activeTab: "login" | "register";
};

export function AuthConnectionMenu({ activeTab }: AuthConnectionMenuProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={styles.container}
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View className={styles.tabsRow}>
        {activeTab === "login" ? (
          <View className={styles.activeTab}>
            <AppText className="!text-secondary text-sm">Se connecter</AppText>
          </View>
        ) : (
          <Pressable
            className={styles.inactiveTab}
            onPress={() => router.replace("/(auth)/login")}
          >
            <AppText className="text-sm">Se connecter</AppText>
          </Pressable>
        )}
        {activeTab === "register" ? (
          <View className={styles.activeTab}>
            <AppText className="!text-secondary text-sm">S'inscrire</AppText>
          </View>
        ) : (
          <Pressable
            className={styles.inactiveTab}
            onPress={() => router.replace("/(auth)/register/step-1")}
          >
            <AppText className="text-sm">S'inscrire</AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
