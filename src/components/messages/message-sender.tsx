import { Pressable } from "react-native";
import { SendDiagonal } from "iconoir-react-native";
import { BottomBar } from "@/components/ui/bottom-bar";
import { BottomTextInput } from "@/components/ui/inputs/bottom-text-input";

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
  return (
    <BottomBar>
      <BottomTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="flex-1"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Envoyer"
        onPress={onSend}
        className="h-[60px] w-[60px] items-center justify-center rounded-full bg-white/10 border border-white/5 backdrop-blur-sm"
      >
        <SendDiagonal className="size-8 text-white" />
      </Pressable>
    </BottomBar>
  );
}
