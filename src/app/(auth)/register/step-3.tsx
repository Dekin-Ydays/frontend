import { useCallback, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { AuthScreen } from "@/components/auth/auth-screen";
import { StepBadge } from "@/components/auth/step-badge";
import type { Href } from "expo-router";

const CODE_LENGTH = 4;

export default function RegisterStep3Screen() {
  const router = useRouter();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  const handleCodeChange = useCallback((value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code],
  );

  return (
    <AuthScreen
      title="S'INSCRIRE"
      backButton
      bottomBar={
        <Button
          variant="primary"
          label="S'inscrire"
          onPress={() => router.replace("/feed" as Href)}
        />
      }
    >
      <StepBadge current={3} total={3} />

      <AppText className="text-sm leading-5">
        Vérifiez dans votre email et entrez le code à {CODE_LENGTH} chiffres
        ci-dessous
      </AppText>

      <View className="flex-row items-center justify-between py-5">
        {code.map((digit, index) => (
          <View
            key={index}
            className={`h-[60px] w-[60px] rounded-[20px] bg-white/10 border border-white/5 items-center justify-center ${focusedIndex === index ? "border-primary" : ""}`}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(v) => handleCodeChange(v, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              className="font-montserrat text-white text-sm text-center"
              underlineColorAndroid="transparent"
            />
          </View>
        ))}
      </View>

      <View className="items-center gap-y-2.5">
        <AppText>Vous n'avez pas reçu le code ?</AppText>
        <Pressable>
          <AppText className="!text-secondary text-sm">
            Renvoyer le code
          </AppText>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
