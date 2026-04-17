import type { ComponentType } from "react";

type IconoirLikeProps = {
  color?: string;
  strokeWidth?: number | string;
};

export type AppIconComponent = ComponentType<IconoirLikeProps>;

const iconSizes = { sm: "w-5 h-5", lg: "w-8 h-8" } as const;

type AppIconSize = keyof typeof iconSizes;

type AppIconProps = {
  icon: AppIconComponent;
  size?: AppIconSize;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function AppIcon({
  icon: IconComponent,
  size = "sm",
  color = "#FFFFFF",
  strokeWidth = 1.8,
  className,
}: AppIconProps) {
  const sizeClasses = iconSizes[size];
  return (
    <IconComponent
      color={color}
      strokeWidth={strokeWidth}
      className={`${sizeClasses} !text-red-500 ${className ?? ""}`}
    />
  );
}
