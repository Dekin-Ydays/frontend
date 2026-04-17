import { Pressable, View } from "react-native";
import { NavArrowRight } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";

/*
// Main component
*/
type SettingsItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onPress?: () => void;
  danger?: boolean;
  trailingIcon?: React.ComponentType<{ className?: string }>;
};

export function SettingsItem({
  icon: Icon,
  label,
  onPress,
  danger = false,
  trailingIcon: TrailingIcon = NavArrowRight,
}: SettingsItemProps) {
  const iconClass = `size-5 ${danger ? "text-dangerous" : "text-white"}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-3 bg-white/10 border border-white/5 rounded-3xl px-5 h-16"
    >
      {!danger && (
        <View className="p-2 items-center justify-center rounded-full bg-white/10">
          <Icon className={iconClass} />
        </View>
      )}
      <AppText
        variant="bolderBaseText"
        className={`flex-1 ${danger ? "!text-dangerous" : ""}`}
      >
        {label}
      </AppText>
      <TrailingIcon className={iconClass} />
    </Pressable>
  );
}
