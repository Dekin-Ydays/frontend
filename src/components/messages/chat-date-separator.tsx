import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";

/*
// Tailwind styles
*/
const styles = {
  container: "items-center py-4",
} as const;

/*
// Main component
*/
type ChatDateSeparatorProps = {
  date: string;
};

export function ChatDateSeparator({ date }: ChatDateSeparatorProps) {
  return (
    <View className={styles.container}>
      <AppText variant="secondaryText">{date}</AppText>
    </View>
  );
}
