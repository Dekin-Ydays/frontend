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

const iconSizes = { sm: 18, lg: 32 } as const;

type IconSize = keyof typeof iconSizes;

type IconProps = {
  icon: AppIconComponent;
  size?: IconSize;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function Icon({
  icon: IconComponent,
  size = "sm",
  color = "#FFFFFF",
  strokeWidth = 1.8,
  style,
}: IconProps) {
  const px = iconSizes[size];
  return (
    <IconComponent
      color={color}
      width={px}
      height={px}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}
