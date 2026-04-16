import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";



/*
// Main component
*/
type ChatDateSeparatorProps = {
  date: string;
};

export function ChatDateSeparator({ date }: ChatDateSeparatorProps) {
  return (
    <View className="items-center py-4">
      <AppText variant="secondaryText">{date}</AppText>
    </View>
  );
}
