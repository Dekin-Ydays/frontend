import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { AuthScreen } from "@/components/auth/auth-screen";
import { StepBadge } from "@/components/auth/step-badge";
import { CodeInput } from "@/components/auth/code-input";

const CODE_LENGTH = 4;

export default function RegisterStep3Screen() {
  const router = useRouter();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));

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
        Vérifiez dans votre email et entrez le code à {CODE_LENGTH} chiffres ci-dessous
      </AppText>

      <CodeInput length={CODE_LENGTH} value={code} onChange={setCode} />

      <View className="items-center gap-y-2.5">
        <AppText>Vous n'avez pas reçu le code ?</AppText>
        <Pressable>
          <AppText className="!text-secondary text-sm">Renvoyer le code</AppText>
        </Pressable>
      </View>
    </AuthScreen>
  );
}
