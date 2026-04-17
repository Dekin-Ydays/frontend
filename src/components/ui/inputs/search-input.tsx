import type { TextInputProps } from "react-native";
import { TextInput, View } from "react-native";
import { Search } from "iconoir-react-native";
import { Icon } from "@/components/ui/app-icon";

type SearchInputProps = Omit<TextInputProps, "className">;

export function SearchInput({
  placeholder = "Rechercher...",
  ...props
}: SearchInputProps) {
  return (
    <View className="h-14 px-4 gap-5 flex-row items-center w-full rounded-lg bg-white font-montserrat text-dark outline-none">
      <Icon icon={Search} size="lg" color="#919191" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#919191"
        underlineColorAndroid="transparent"
        {...props}
        className="h-14 w-full font-montserrat text-dark outline-none"
      />
    </View>
  );
}
