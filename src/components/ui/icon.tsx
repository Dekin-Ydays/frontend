import type { ComponentType } from "react";
import type { StyleProp, ViewStyle } from "react-native";

type IconoirLikeProps = {
  color?: string;
  width?: number | string;
  height?: number | string;
  strokeWidth?: number | string;
  style?: StyleProp<ViewStyle>;
};

export type AppIconComponent = ComponentType<IconoirLikeProps>;

type IconProps = {
  icon: AppIconComponent;
  size?: 18 | 32;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function Icon({
  icon: IconComponent,
  size = 18,
  color = "#FFFFFF",
  strokeWidth = 1.8,
  style,
}: IconProps) {
  return (
    <IconComponent
      color={color}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}
