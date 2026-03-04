import { ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/app-text";

export default function FollowingScreen() {
  return (
    <ScrollView className="flex-1 bg-dark py-24">
      <View className="gap-2">
        <AppText variant="title">Vos suivis</AppText>
        <AppText>Le contenu de vos suivis apparaîtra ici.</AppText>
      </View>
    </ScrollView>
  );
}
