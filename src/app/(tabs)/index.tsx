import { ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/app-text";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-dark py-24">
      <View className="gap-2">
        <AppText variant="title">Pour vous</AppText>
        <AppText>Le flux principal apparaîtra ici.</AppText>
      </View>
    </ScrollView>
  );
}
