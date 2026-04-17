import { Search } from "iconoir-react-native";
import { TextInput, View } from "react-native";
import { Icon } from "@/components/ui/icon";

type MessagesSearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function MessagesSearchInput({
  value,
  onChangeText,
  placeholder = "Rechercher un contact...",
}: MessagesSearchInputProps) {
  return (
    <View className="relative">
      <View className="absolute left-4 z-10 h-14 justify-center">
        <Icon icon={Search} size={32} color="#919191" />
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        underlineColorAndroid="transparent"
        className="h-14 w-full rounded-[10px] bg-white pl-14 pr-4 font-montserrat text-dark placeholder:text-gray outline-none focus:outline-none"
      />
    </View>
  );
}
