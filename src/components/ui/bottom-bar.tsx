import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomBarProps = {
  children: ReactNode;
  className?: string;
};

export function BottomBar({ children, className }: BottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-black/0 to-black/80 flex-row items-center justify-center gap-3 px-4 ${className || ""}`}
      style={{ paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );
}
