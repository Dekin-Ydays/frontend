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
    <View className="relative">
      <View className="absolute left-4 z-10 h-14 justify-center">
        <Icon icon={Search} size="lg" color="#919191" />
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#919191"
        underlineColorAndroid="transparent"
        {...props}
        className="h-14 w-full rounded-[10px] bg-white pl-12 pr-5 font-montserrat text-dark outline-none"
      />
    </View>
  );
}
