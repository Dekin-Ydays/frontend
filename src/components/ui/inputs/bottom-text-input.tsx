import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";

export function BottomTextInput({ ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#919191"
      underlineColorAndroid="transparent"
      {...props}
      className={`h-16 rounded-full flex-1 bg-white/10 border border-white/5 backdrop-blur-sm px-5 font-montserrat text-white outline-none focus:border-secondary`}
    />
  );
}
