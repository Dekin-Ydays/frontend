import type { ComponentType } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components/ui/app-text";

/*
// Tailwind styles
*/
const styles = {
  base: "flex-row justify-center items-center gap-3 px-4 py-2 h-16 rounded-2xl w-full",
  primary: "bg-primary justify-between",
  secondary: "bg-white items-center",
  icon: "h-8 w-8 text-dark",
  disabled: "opacity-50 pointer-events-none",
} as const;

/*
// Main component
*/
type ButtonProps = {
  variant: "primary" | "secondary";
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
  const iconRight = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? "Button"}
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`${styles.base} ${styles[variant]} ${disabled ? styles.disabled : ""} ${className ?? ""}`}
    >
      {Icon && !iconRight && <Icon className={` ${styles.icon} `} />}
      {label && (
        <AppText variant="title" className="!text-dark">
          {label}
        </AppText>
      )}
      {Icon && iconRight && <Icon className={` ${styles.icon} `} />}
    </Pressable>
  );
}
