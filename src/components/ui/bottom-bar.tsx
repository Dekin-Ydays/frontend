import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomBarProps = {
  children: ReactNode;
  paddingExtra?: number;
  className?: string;
};

export function BottomBar({ children, paddingExtra = 0, className = "" }: BottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 ${className}`}
      style={{ paddingBottom: insets.bottom + paddingExtra }}
    >
      {children}
    </View>
  );
}
