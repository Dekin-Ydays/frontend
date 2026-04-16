import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";



/*
// Main component
*/
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
      className="flex-1"
    >
      <View className="items-start">
        <AppText
          variant="baseText"
          className={isActive ? "" : "text-lightgray"}
        >
          {label}
        </AppText>
        <View
          className={
            isActive ? "mt-2 h-px w-full bg-white" : "mt-2 h-px w-full bg-white/10"
          }
        />
      </View>
    </Pressable>
  );
}
