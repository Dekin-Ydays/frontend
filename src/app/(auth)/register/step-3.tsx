import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/buttons/button";
import { BottomBar } from "@/components/ui/bottom-bar";
import { StepBadge } from "@/components/auth/step-badge";
import { CodeInput } from "@/components/ui/inputs/code-input";

const CODE_LENGTH = 4;

export default function RegisterStep3Screen() {
  const router = useRouter();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4 pb-24 gap-6">
          <StepBadge current={3} total={3} />

          <AppText className="text-sm leading-5">
            Vérifiez dans votre email et entrez le code à {CODE_LENGTH} chiffres
            ci-dessous
          </AppText>

          <CodeInput length={CODE_LENGTH} value={code} onChange={setCode} />

          <View className="items-center gap-2.5">
            <AppText>Vous n'avez pas reçu le code ?</AppText>
            <Pressable>
              <AppText className="!text-secondary text-sm">
                Renvoyer le code
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        <Button
          variant="primary"
          label="S'inscrire"
          onPress={() => router.replace("/feed" as Href)}
        />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
