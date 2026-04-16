import { Pressable, TextInput, View } from "react-native";
import { SendDiagonal } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";



/*
// Main component
*/
type MessageSenderProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
};

export function MessageSender({
  value,
  onChangeText,
  onSend,
  placeholder = "Votre message...",
}: MessageSenderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-center gap-3 px-5 h-[100px] bg-gradient-to-b from-black/0 to-black/80"
      style={{ paddingBottom: insets.bottom }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#919191"
        underlineColorAndroid="transparent"
        className="flex-1 h-[60px] rounded-full bg-white/10 border border-white/5 px-5 font-montserrat text-white focus:border-secondary"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Envoyer"
        onPress={onSend}
        className="h-[60px] w-[60px] items-center justify-center rounded-full bg-white/10 border border-white/5"
      >
        <Icon icon={SendDiagonal} size={32} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
