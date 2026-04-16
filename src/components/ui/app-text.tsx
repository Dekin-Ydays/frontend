import type { ReactNode } from "react";
import { Text } from "react-native";



/*
// Main component
*/
type AppTextProps = {
  children: ReactNode;
  variant?:
    | "title"
    | "baseText"
    | "largeText"
    | "bolderLargeText"
    | "bolderBaseText"
    | "secondaryText";
  className?: string;
  numberOfLines?: number;
  customStyle?: string;
};

export function AppText({
  children,
  variant = "baseText",
  className,
  numberOfLines,
}: AppTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      className={`${({"title": "text-2xl font-bebas text-white", "baseText": "font-montserrat text-white", "largeText": "font-montserrat text-xl text-white", "bolderLargeText": "font-montserrat-bold text-xl text-white", "bolderBaseText": "font-montserrat-bold text-white", "secondaryText": "font-montserrat text-sm text-gray"} as Record<string, string>)[variant]} ${className ?? ""}`}
    >
      {children}
    </Text>
  );
}
