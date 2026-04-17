import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { AppIconComponent } from "@/components/ui/icon";
import { useEffect, useRef } from "react";
import { HomeSimple, Search, Send, User } from "iconoir-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Icon } from "../ui/icon";
import { BottomTextInput } from "../ui/inputs/bottom-text-input";

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
      className={`flex items-center justify-center h-full w-16 rounded-full ${isActive ? "!bg-white/20" : ""} transition-all duration-300`}
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
    <BottomTextInput
      placeholder="Rechercher..."
      onChangeText={onSearch}
      className="h-16 flex-1"
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
  const router = useRouter();
  const activeRoute = state.routes[state.index]?.name;
  const isFocused = (name: string) => activeRoute === name;
  const isSearchActive = activeRoute === "search";
  const lastNonSearchRoute = useRef<string>("feed");

  useEffect(() => {
    if (activeRoute && activeRoute !== "search") {
      lastNonSearchRoute.current = activeRoute;
    }
  }, [activeRoute]);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-black/0 to-black/80 h-24 items-center justify-center"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center justify-center gap-3 px-4 w-full">
        {/* Main nav pills — hidden when search is active */}
        {!isSearchActive && (
          <View className="h-16 backdrop-blur-sm w-fit flex-row items-center justify-center rounded-full bg-white/10 border border-white/5 p-1">
            <MenuButton
              label={descriptors["feed"]?.options?.title ?? "Home"}
              isActive={isFocused("feed")}
              onPress={() => navigation.navigate("feed")}
              icon={HomeSimple}
            />
            <MenuButton
              label={descriptors["messages"]?.options?.title ?? "Messages"}
              isActive={isFocused("messages")}
              onPress={() => navigation.navigate("messages")}
              icon={Send}
            />
            <MenuButton
              label={descriptors["profile"]?.options?.title ?? "Profil"}
              isActive={isFocused("profile")}
              onPress={() => navigation.navigate("profile")}
              icon={User}
            />
          </View>
        )}

        {/* Search pill — always visible, acts as back button when search is active */}
        <View className="h-16 backdrop-blur-sm w-fit flex-row items-center justify-center rounded-full bg-white/10 border border-white/5 p-1">
          <MenuButton
            label={descriptors["search"]?.options?.title ?? "Recherche"}
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
