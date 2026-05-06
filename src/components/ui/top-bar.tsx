import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TopBarProps = {
  children: ReactNode;
  className?: string;
};

export function TopBar({ children, className }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-black/0 flex-row items-center justify-between gap-3 px-4 ${className || ""}`}
      style={{ paddingTop: insets.top }}
    >
      {children}
    </View>
  );
}
