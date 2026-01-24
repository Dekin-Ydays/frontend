import { View, Text } from "react-native";

export default function MessagesScreen() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold">Messages</Text>
      <Text className="text-gray-500 mt-2">
        Vos conversations apparaîtront ici
      </Text>
    </View>
  );
}
