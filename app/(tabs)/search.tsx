import { View, Text } from "react-native";

export default function SearchScreen() {
  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold">Recherche</Text>
        <Text className="text-gray-500 mt-2">Recherchez ici</Text>
      </View>
    </View>
  );
}
