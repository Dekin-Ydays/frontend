import { Pressable, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../ui/app-text";

const styles = {
  bar: "absolute top-0 left-0 right-0 bg-gradient-to-t from-black/0 to-black/80 h-24 items-center justify-center",
  row: "flex-row items-center justify-center gap-7 px-4 w-full",
  underline: "absolute bottom-0 h-0.5 w-7 rounded-full bg-primary",
  transition: "transition-all duration-300",
} as const;

export function TopFeed() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const normalizedPath = pathname === "" ? "/" : pathname;

  const feedTabs = [
    { label: "Pour vous", path: "/" },
    { label: "Vos suivis", path: "/following" },
    { label: "Favoris", path: "/favorites" },
  ] as const;

  return (
    <View className={styles.bar} style={{ paddingTop: insets.top }}>
      <View className={styles.row}>
        {feedTabs.map((tab) => {
          const isActive = normalizedPath === tab.path;

          return (
            <Pressable
              key={tab.path}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => router.replace(tab.path)}
            >
              <View className="items-center">
                <AppText
                  variant="title"
                  className={isActive ? "text-primary" : ""}
                >
                  {tab.label}
                </AppText>
                {isActive && <View className={styles.underline} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
