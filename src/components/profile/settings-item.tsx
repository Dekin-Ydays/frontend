import { Pressable } from "react-native";
import { NavArrowRight } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { AppIcon, type AppIconComponent } from "@/components/ui/app-icon";

const DANGER_COLOR = "#E84545";
const DEFAULT_COLOR = "#FFFFFF";

/*
// Main component
*/
type SettingsItemProps = {
  icon: AppIconComponent;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  trailingIcon?: AppIconComponent;
};

export function SettingsItem({
  icon,
  label,
  onPress,
  danger = false,
  trailingIcon = NavArrowRight,
}: SettingsItemProps) {
  const color = danger ? DANGER_COLOR : DEFAULT_COLOR;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-4 bg-white/10 border border-white/5 rounded-xl px-5 h-[60px]"
    >
      <AppIcon icon={icon} size="sm" color={color} />
      <AppText
        variant="bolderBaseText"
        className={`flex-1 ${danger ? "!text-dangerous" : ""}`}
      >
        {label}
      </AppText>
      <AppIcon icon={trailingIcon} size="sm" color={color} />
    </Pressable>
  );
}
