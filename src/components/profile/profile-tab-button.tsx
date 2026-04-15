import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";

const styles = {
  pressable: "flex-1",
  content: "items-start",
  inactiveLabel: "text-lightgray",
  activeUnderline: "mt-2 h-px w-full bg-white",
  inactiveUnderline: "mt-2 h-px w-full bg-white/10",
} as const;

type ProfileTabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

export function ProfileTabButton({
  label,
  isActive,
  onPress,
}: ProfileTabButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={styles.pressable}
    >
      <View className={styles.content}>
        <AppText
          variant="baseText"
          className={isActive ? "" : styles.inactiveLabel}
        >
          {label}
        </AppText>
        <View
          className={
            isActive ? styles.activeUnderline : styles.inactiveUnderline
          }
        />
      </View>
    </Pressable>
  );
}
