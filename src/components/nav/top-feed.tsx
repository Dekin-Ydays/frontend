import { Pressable, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../ui/app-text";

export function TopFeed() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const normalizedPath = pathname === "" ? "/feed/for-you" : pathname;

  const feedTabs = [
    { label: "Pour vous", path: "/feed/for-you" },
    { label: "Vos suivis", path: "/feed/following" },
    { label: "Favoris", path: "/feed/favorites" },
  ] as const;

  return (
    <View
      className="absolute top-0 left-0 right-0 bg-gradient-to-t from-black/0 to-black/80 h-24 items-center justify-center"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-center gap-7 px-4 w-full">
        {feedTabs.map((tab) => {
          const isActive = normalizedPath === tab.path;

          return (
            <Pressable
              key={tab.path}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => router.replace(tab.path as Href)}
            >
              <View className="items-center">
                <AppText
                  variant="title"
                  className={isActive ? "text-primary" : ""}
                >
                  {tab.label}
                </AppText>
                {isActive && (
                  <View className="absolute bottom-0 h-0.5 w-7 rounded-full bg-primary" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
