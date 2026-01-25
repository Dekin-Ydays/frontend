import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentType } from "react";
import { useEffect, useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeAlt, Telegram, Search, User } from "iconoir-react-native";

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
  icon: "h-8 w-8 text-white",
  iconActive: "!text-secondary",
  textInput:
    "h-16 w-full rounded-full bg-white/10 border border-white/5 px-4 text-white placeholder:text-gray outline-none focus:border-secondary",
  transition: "transition-all duration-300",
} as const;

/*
// Secondary components
*/
type MenuButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  Icon: ComponentType<{ className?: string }>;
};

function MenuButton({ label, isActive, onPress, Icon }: MenuButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`${styles.pressable} ${isActive ? styles.pressableActive : ""} ${styles.transition}`}
    >
      <Icon
        className={`${styles.icon} ${isActive ? styles.iconActive : ""} ${styles.transition}`}
      />
    </Pressable>
  );
}

function SearchBar() {
  return (
    <TextInput
      placeholder="Rechercher une danse..."
      underlineColorAndroid="transparent"
      className={`${styles.textInput} ${styles.transition}`}
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
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;
  const isFocused = (name: string) => activeRoute === name;
  const isSearchActive = activeRoute === "search";
  const lastNonSearchRoute = useRef<string>("index");

  useEffect(() => {
    if (activeRoute && activeRoute !== "search") {
      lastNonSearchRoute.current = activeRoute;
    }
  }, [activeRoute]);

  return (
    <View className={styles.bar} style={{ paddingBottom: insets.bottom }}>
      <View className={styles.row}>
        {!isSearchActive && (
          <View className={styles.container}>
            <MenuButton
              label={descriptors.index?.options?.title ?? "Home"}
              isActive={isFocused("index")}
              onPress={() => navigation.navigate("index")}
              Icon={HomeAlt}
            />
            <MenuButton
              label={descriptors.messages?.options?.title ?? "Messages"}
              isActive={isFocused("messages")}
              onPress={() => navigation.navigate("messages")}
              Icon={Telegram}
            />
            <MenuButton
              label={descriptors.profile?.options?.title ?? "Profil"}
              isActive={isFocused("profile")}
              onPress={() => navigation.navigate("profile")}
              Icon={User}
            />
          </View>
        )}
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
            Icon={Search}
          />
        </View>
        {isSearchActive && <SearchBar />}
      </View>
    </View>
  );
}
