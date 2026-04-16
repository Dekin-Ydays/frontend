import { Pressable } from "react-native";
import { NavArrowRight } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { Icon, type AppIconComponent } from "@/components/ui/icon";

/*
// Tailwind styles
*/
const styles = {
  container: "flex-row items-center gap-4 bg-white/10 border border-white/5 rounded-[20px] px-5 h-[60px]",
  label: "flex-1",
  dangerText: "!text-dangerous",
} as const;

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
      className={styles.container}
    >
      <Icon icon={icon} size={18} color={color} />
      <AppText
        variant="bolderBaseText"
        className={`${styles.label} ${danger ? styles.dangerText : ""}`}
      >
        {label}
      </AppText>
      <Icon icon={trailingIcon} size={18} color={color} />
    </Pressable>
  );
}
