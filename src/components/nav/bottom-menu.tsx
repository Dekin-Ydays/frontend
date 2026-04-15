import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { AppIconComponent } from "@/components/ui/icon";
import { useEffect, useRef } from "react";
import { HomeSimple, Search, Send, User } from "iconoir-react-native";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Icon } from "../ui/icon";
import { useBottomBar } from "./bottom-bar-context";

/*
// Tailwind styles
*/
const styles = {
  bar: "absolute bottom-0 left-0 right-0 bg-gradient-to-b from-black/0 to-black/80 h-24 items-center justify-center",
  row: "flex-row items-center justify-center gap-3 px-4 w-full",
  container:
    "h-16 backdrop-blur-sm w-fit flex-row items-center justify-center rounded-full bg-white/10 border border-white/5 p-1",
  pressable: "flex items-center justify-center h-full w-16 rounded-full",
  pressableActive: "!bg-white/20",
  searchInput:
    "h-16 flex-1 rounded-full bg-white/10 border border-white/5 px-5 text-white placeholder:text-gray outline-none focus:border-secondary",
  transition: "transition-all duration-300",
} as const;

/*
// Secondary components
*/
type MenuButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon: AppIconComponent;
};

function MenuButton({ label, isActive, onPress, icon }: MenuButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`${styles.pressable} ${isActive ? styles.pressableActive : ""} ${styles.transition}`}
    >
      <Icon icon={icon} size={32} color={isActive ? "#3CFFD0" : "#FFFFFF"} />
    </Pressable>
  );
}

type SearchBarProps = {
  onSearch: (query: string) => void;
};

function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <TextInput
      placeholder="Rechercher..."
      placeholderTextColor="#919191"
      underlineColorAndroid="transparent"
      onChangeText={onSearch}
      className={`${styles.searchInput} ${styles.transition}`}
    />
  );
}

/*
// Main component
*/
export function BottomMenu({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { isVisible } = useBottomBar();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeRoute = state.routes[state.index]?.name;
  const isFocused = (name: string) => activeRoute === name;
  const isSearchActive = activeRoute === "search";
  const lastNonSearchRoute = useRef<string>("index");

  useEffect(() => {
    if (activeRoute && activeRoute !== "search") {
      lastNonSearchRoute.current = activeRoute;
    }
  }, [activeRoute]);

  const routesWithoutMenu = [
    "conversation",
    "edit-profile",
    "score-result",
    "video-creation",
    "video-form",
    "other-profile",
    "send",
    "video-perform",
    "video-recording",
    "video-review",
  ];
  if (!isVisible || routesWithoutMenu.includes(activeRoute)) return null;

  return (
    <View className={styles.bar} style={{ paddingBottom: insets.bottom }}>
      <View className={styles.row}>
        {/* Main nav pills — hidden when search is active */}
        {!isSearchActive && (
          <View className={styles.container}>
            <MenuButton
              label={descriptors.index?.options?.title ?? "Home"}
              isActive={isFocused("index")}
              onPress={() => navigation.navigate("index")}
              icon={HomeSimple}
            />
            <MenuButton
              label={descriptors.messages?.options?.title ?? "Messages"}
              isActive={isFocused("messages")}
              onPress={() => navigation.navigate("messages")}
              icon={Send}
            />
            <MenuButton
              label={descriptors.profile?.options?.title ?? "Profil"}
              isActive={isFocused("profile")}
              onPress={() => navigation.navigate("profile")}
              icon={User}
            />
          </View>
        )}

        {/* Search pill — always visible, acts as back button when search is active */}
        <View className={styles.container}>
          <MenuButton
            label={descriptors.search?.options?.title ?? "Recherche"}
            isActive={isFocused("search")}
            onPress={() => {
              if (isSearchActive) {
                navigation.navigate(lastNonSearchRoute.current);
                return;
              }
              navigation.navigate("search");
            }}
            icon={Search}
          />
        </View>

        {/* Search input — appears when search is active, connects to search screen */}
        {isSearchActive && (
          <SearchBar onSearch={(q) => router.setParams({ q })} />
        )}
      </View>
    </View>
  );
}
