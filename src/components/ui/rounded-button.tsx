import type { ComponentType } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components/ui/app-text";



/*
// Main component
*/
type RoundedButtonProps = {
  variant: "primary" | "secondary";
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? "Button"}
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`flex-row justify-center items-center gap-2 px-4 py-2 rounded-full w-fit ${({"base": "flex-row justify-center items-center gap-2 px-4 py-2 rounded-full w-fit", "primary": "bg-primary", "secondary": "bg-white/10", "icon": "h-4 w-4", "disabled": "opacity-50 pointer-events-none"} as Record<string, string>)[variant]} ${disabled ? "opacity-50 pointer-events-none" : ""} ${className ?? ""}`}
    >
      {Icon && <Icon className={` h-4 w-4 ${color}`} />}
      {label && (
        <AppText variant="baseText" className={color}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
