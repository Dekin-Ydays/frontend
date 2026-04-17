import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";

type BottomTextInputProps = Omit<TextInputProps, "className"> & {
  className?: string;
};

export function BottomTextInput({ className = "", ...props }: BottomTextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#919191"
      underlineColorAndroid="transparent"
      {...props}
      className={`h-[60px] rounded-full bg-white/10 border border-white/5 backdrop-blur-sm px-5 font-montserrat text-white focus:border-secondary ${className}`}
    />
  );
}
