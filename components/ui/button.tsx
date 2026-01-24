import type { ComponentType } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components/ui/app-text";

/*
// Tailwind styles
*/
const styles = {
  base: "flex-row justify-center items-center gap-2 px-4 py-2",
  primary: "h-16 rounded-2xl bg-primary w-full justify-between",
  secondary: "h-16 rounded-2xl bg-white w-full items-center",
  primaryRounded: "rounded-full bg-primary w-fit",
  secondaryRounded: "rounded-full bg-white/10 w-fit",
  iconLarge: "h-8 w-8",
  iconSmall: "h-4 w-4",
  disabled: "opacity-50 pointer-events-none",
} as const;

/*
// Main component
*/
type ButtonProps = {
  variant: "primary" | "secondary" | "primaryRounded" | "secondaryRounded";
  label?: string;
  onPress?: () => void;
  Icon?: ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant,
  Icon,
  className,
  disabled = false,
}: ButtonProps) {
  const iconSize =
    variant === "primary" || variant === "secondary"
      ? styles.iconLarge
      : styles.iconSmall;
  const textVariant =
    variant === "primary" || variant === "secondary" ? "title" : "baseText";
  const textColor = variant === "secondaryRounded" ? "text-white" : "text-dark";
  const iconRight = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? "Button"}
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`${styles.base} ${styles[variant]} ${disabled ? styles.disabled : ""} ${className ?? ""}`}
    >
      {Icon && !iconRight && <Icon className={` ${iconSize}`} />}
      {label && (
        <AppText variant={textVariant} className={textColor}>
          {label}
        </AppText>
      )}
      {Icon && iconRight && <Icon className={` ${iconSize}`} />}
    </Pressable>
  );
}
