import type { ComponentType } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components/ui/app-text";



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
      className={`flex-row justify-center items-center gap-3 px-5 h-[60px] rounded-[20px] w-full ${({"base": "flex-row justify-center items-center gap-3 px-5 h-[60px] rounded-[20px] w-full", "primary": "bg-primary justify-between", "secondary": "bg-white items-center", "icon": "h-8 w-8 text-dark", "disabled": "opacity-50 pointer-events-none"} as Record<string, string>)[variant]} ${disabled ? "opacity-50 pointer-events-none" : ""} ${className ?? ""}`}
    >
      {Icon && !iconRight && <Icon className={` h-8 w-8 text-dark `} />}
      {label && (
        <AppText variant="title" className="!text-dark">
          {label}
        </AppText>
      )}
      {Icon && iconRight && <Icon className={` h-8 w-8 text-dark `} />}
    </Pressable>
  );
}
