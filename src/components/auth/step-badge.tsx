import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";

type StepBadgeProps = {
  current: number;
  total: number;
};

export function StepBadge({ current, total }: StepBadgeProps) {
  return (
    <View className="flex-row items-center h-8 bg-secondary rounded-[10px] px-5 self-start">
      <AppText className="!text-dark font-montserrat-bold text-sm">
        Étape {current} / {total}
      </AppText>
    </View>
  );
}
