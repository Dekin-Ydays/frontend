import { useCallback, useRef, useState } from "react";
import { TextInput, View } from "react-native";

type CodeInputProps = {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
};

export function CodeInput({ length = 4, value, onChange }: CodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(length).fill(null));

  const handleChange = useCallback(
    (v: string, index: number) => {
      const digit = v.replace(/[^0-9]/g, "").slice(-1);
      const next = [...value];
      next[index] = digit;
      onChange(next);
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange, length],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [value],
  );

  return (
    <View className="flex-row items-center justify-between py-5">
      {value.map((digit, index) => (
        <View
          key={index}
          className={`h-[60px] w-[60px] rounded-[20px] bg-white/10 border border-white/5 items-center justify-center ${focusedIndex === index ? "border-primary" : ""}`}
        >
          <TextInput
            ref={(ref) => { inputRefs.current[index] = ref; }}
            value={digit}
            onChangeText={(v) => handleChange(v, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            underlineColorAndroid="transparent"
            className="font-montserrat text-white text-sm text-center outline-none"
          />
        </View>
      ))}
    </View>
  );
}
