import { ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/app-text";

export default function FavoritesScreen() {
  return (
    <ScrollView className="flex-1 bg-dark py-24">
      <View className="gap-2">
        <AppText variant="title">Favoris</AppText>
        <AppText>Vos contenus favoris apparaîtront ici.</AppText>
      </View>
    </ScrollView>
  );
}
