import { Pressable, TextInput, View } from "react-native";
import { SendDiagonal } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";

/*
// Tailwind styles
*/
const styles = {
  container:
    "flex-row items-center justify-center gap-3 px-5 h-[100px] bg-gradient-to-b from-black/0 to-black/80",
  input:
    "flex-1 h-[60px] rounded-full bg-white/10 border border-white/5 px-5 font-montserrat text-white focus:border-secondary",
  sendButton:
    "h-[60px] w-[60px] items-center justify-center rounded-full bg-white/10 border border-white/5",
} as const;

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
      className={styles.container}
      style={{ paddingBottom: insets.bottom }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#919191"
        underlineColorAndroid="transparent"
        className={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Envoyer"
        onPress={onSend}
        className={styles.sendButton}
      >
        <Icon icon={SendDiagonal} size={32} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
