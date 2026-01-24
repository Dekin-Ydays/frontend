import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold">Profil</Text>
        <Text className="text-gray-500 mt-2">Gérez votre profil ici</Text>
      </View>
    </View>
  );
}
