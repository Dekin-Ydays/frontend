import { Pressable, TextInput, View } from "react-native";
import { SendDiagonal } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";

/*
// Tailwind styles
*/
const styles = {
  container:
    "flex-row items-center gap-3 px-4 pt-8 bg-gradient-to-b from-black/0 to-black/80",
  input:
    "flex-1 h-[60px] rounded-full bg-white/10 border border-white/5 px-5 font-montserrat text-white",
  sendButton:
    "h-[60px] w-[60px] items-center justify-center rounded-full bg-white/10 border border-white/10",
} as const;

/*
// Main component
*/
type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
};

export function ChatInput({ value, onChangeText, onSend }: ChatInputProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={styles.container}
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Votre message..."
        placeholderTextColor="#919191"
        underlineColorAndroid="transparent"
        className={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Envoyer le message"
        onPress={onSend}
        className={styles.sendButton}
      >
        <Icon icon={SendDiagonal} size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
