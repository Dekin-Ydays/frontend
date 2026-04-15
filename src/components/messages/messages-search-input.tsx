import { Search } from "iconoir-react-native";
import { TextInput, View } from "react-native";
import { Icon } from "@/components/ui/icon";

const styles = {
  container: "relative",
  icon: "absolute left-4 z-10 h-14 justify-center",
  input:
    "h-14 w-full rounded-2xl bg-white pl-14 pr-4 font-montserrat text-dark placeholder:text-gray outline-none focus:outline-none",
} as const;

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
    <View className={styles.container}>
      <View className={styles.icon}>
        <Icon icon={Search} size={32} color="#919191" />
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        underlineColorAndroid="transparent"
        className={styles.input}
      />
    </View>
  );
}
