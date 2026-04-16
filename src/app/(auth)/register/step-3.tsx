import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { TopHeader } from "@/components/nav/top-header";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-5 pt-24 pb-36 gap-y-6",
  codeRow: "flex-row items-center justify-between py-5",
  resendSection: "items-center gap-y-2.5",
  stepBadge:
    "flex-row items-center h-8 bg-secondary rounded-[10px] px-5 self-start",
  stepBadgeText: "!text-dark font-montserrat-bold text-sm",
  codeInput:
    "h-[60px] w-[60px] rounded-[20px] bg-white/10 border border-white/5 items-center justify-center",
  codeInputActive: "border-primary",
  codeInputText: "font-montserrat text-white text-sm text-center",
} as const;

export default function RegisterStep3Screen() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const handleCodeChange = useCallback(
    (value: string, index: number) => {
      const digit = value.replace(/[^0-9]/g, "").slice(-1);
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);
      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [code],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={styles.screen}
    >
      <TopHeader title="S'INSCRIRE" backButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className={styles.content}>
          <View className={styles.stepBadge}>
            <AppText className={styles.stepBadgeText}>Etape 3 ~ 3</AppText>
          </View>

          <AppText className="text-sm leading-5">
            Vérifiez dans votre email et entrez le code à 4 chiffres ci-dessous
          </AppText>

          <View className={styles.codeRow}>
            {code.map((digit, index) => (
              <View
                key={index}
                className={`${styles.codeInput} ${focusedIndex === index ? styles.codeInputActive : ""}`}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  className={styles.codeInputText}
                  underlineColorAndroid="transparent"
                />
              </View>
            ))}
          </View>

          <View className={styles.resendSection}>
            <AppText>Vous n'avez pas reçu le code ?</AppText>
            <Pressable>
              <AppText className="!text-secondary text-sm">
                Renvoyer le code
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomActionBar>
        <Button
          variant="primary"
          label="S'inscrire"
          onPress={() => router.replace("/(tabs)")}
        />
      </BottomActionBar>
    </KeyboardAvoidingView>
  );
}
