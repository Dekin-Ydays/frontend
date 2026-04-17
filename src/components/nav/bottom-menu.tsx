import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { AppIconComponent } from "@/components/ui/app-icon";
import { useEffect, useRef } from "react";
import { HomeSimple, Search, Send, User } from "iconoir-react-native";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "../ui/app-icon";
import { BottomTextInput } from "../ui/inputs/bottom-text-input";
import { BottomBar } from "../ui/bottom-bar";

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
      className={`flex items-center justify-center h-full w-16 rounded-full ${isActive ? "!bg-white/5" : ""} transition-all duration-300`}
    >
      <Icon icon={icon} size="lg" color={isActive ? "#3CFFD0" : "#FFFFFF"} />
    </Pressable>
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
    <BottomBar>
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

      {isSearchActive && (
        <BottomTextInput
          placeholder="Rechercher..."
          onChangeText={(q) => router.setParams({ q })}
        />
      )}
    </BottomBar>
  );
}
