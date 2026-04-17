import type { ComponentType } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components/ui/app-text";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  variant: ButtonVariant;
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
      className={`flex-row items-center gap-3 px-5 h-16 rounded-2xl w-full ${variant === "primary" ? "bg-primary justify-between" : "bg-white items-center justify-center"} ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
    >
      {Icon && !iconRight && <Icon className="h-8 w-8 text-dark" />}

      {label && (
        <AppText variant="title" className="!text-dark">
          {label}
        </AppText>
      )}
      {Icon && iconRight && <Icon className="h-8 w-8 text-dark" />}
    </Pressable>
  );
}
