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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { TopHeader } from "@/components/nav/top-header";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  stepBadge:
    "flex-row items-center h-8 bg-secondary rounded-[10px] px-5 self-start",
  stepBadgeText: "!text-dark font-montserrat-bold text-sm",
  instruction: "text-sm leading-5",
  codeRow: "flex-row items-center justify-between py-5",
  codeInput:
    "h-[60px] w-[60px] rounded-[20px] bg-white/10 border border-white/5 items-center justify-center",
  codeInputActive: "border-primary",
  codeInputText: "font-montserrat text-white text-sm text-center",
  resendSection: "items-center gap-y-2.5",
  resendLink: "!text-secondary text-sm",
  // Bottom action bar
  bottomBar:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 justify-center px-5",
  primaryButton:
    "h-[60px] w-full rounded-[20px] bg-primary items-center justify-center",
  primaryButtonText: "!text-dark",
} as const;

/*
// Main component
*/
export default function RegisterStep3Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        <View className="px-5 pt-24 pb-36 gap-y-6">
          {/* Step badge */}
          <View className={styles.stepBadge}>
            <AppText className={styles.stepBadgeText}>Etape 3 ~ 3</AppText>
          </View>

          {/* Instruction */}
          <AppText className={styles.instruction}>
            Vérifiez dans votre email et entrez le code à 4 chiffres ci-dessous
          </AppText>

          {/* Code inputs */}
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

          {/* Resend section */}
          <View className={styles.resendSection}>
            <AppText>Vous n'avez pas reçu le code ?</AppText>
            <Pressable>
              <AppText className={styles.resendLink}>Renvoyer le code</AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          className={styles.primaryButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <AppText variant="title" className={styles.primaryButtonText}>
            S'inscrire
          </AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
