import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";

type StepBadgeProps = {
  current: number;
  total: number;
};

export function StepBadge({ current, total }: StepBadgeProps) {
  return (
    <View className="flex-row items-center px-4 py-2 bg-secondary rounded-xl px-5 self-start">
      <AppText className="!text-dark font-montserrat-bold text-sm">
        Étape {current} ~ {total}
      </AppText>
    </View>
  );
}
