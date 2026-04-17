import type { ComponentType } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components/ui/app-text";

type ButtonVariant = "primary" | "primary-alt" | "secondary";

type RoundedButtonProps = {
  variant: ButtonVariant;
  label?: string;
  onPress?: () => void;
  Icon?: ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
};

export function RoundedButton({
  label,
  onPress,
  variant,
  Icon,
  className,
  disabled = false,
}: RoundedButtonProps) {
  const color = variant === "secondary" ? "text-white" : "!text-dark";
  const bgColor =
    variant === "primary"
      ? "bg-primary"
      : variant === "primary-alt"
        ? "bg-secondary"
        : "bg-white/10";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? "Button"}
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`flex-row justify-center items-center gap-2 px-4 py-2 rounded-full w-fit ${bgColor} ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
    >
      {Icon && <Icon className={`size-4 ${color}`} />}
      {label && (
        <AppText variant="baseText" className={color}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
