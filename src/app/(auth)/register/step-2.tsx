import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { Button } from "@/components/ui/button";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { TopHeader } from "@/components/nav/top-header";

const styles = {
  stepBadge:
    "flex-row items-center h-8 bg-secondary rounded-[10px] px-5 self-start",
  stepBadgeText: "!text-dark font-montserrat-bold text-sm",
  rowFields: "flex-row gap-2.5",
} as const;

export default function RegisterStep2Screen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
    >
      <TopHeader title="S'INSCRIRE" backButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-24 pb-36 gap-y-6">
          <View className={styles.stepBadge}>
            <AppText className={styles.stepBadgeText}>Etape 2 ~ 3</AppText>
          </View>

          <View className="gap-y-6">
            <View className={styles.rowFields}>
              <View className="flex-1">
                <AppInput
                  label="Prénom"
                  labelClassName="!text-white"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Un prénom"
                  placeholderTextColor="#919191"
                />
              </View>
              <View className="flex-1">
                <AppInput
                  label="Nom"
                  labelClassName="!text-white"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Un nom"
                  placeholderTextColor="#919191"
                />
              </View>
            </View>

            <AppInput
              label="Pseudo"
              labelClassName="!text-white"
              value={pseudo}
              onChangeText={setPseudo}
              placeholder="monpseudo"
              placeholderTextColor="#919191"
              autoCapitalize="none"
            />

            <AppInput
              label="Date de naissance"
              labelClassName="!text-white"
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="jj/mm/aaaa"
              placeholderTextColor="#919191"
              keyboardType="numbers-and-punctuation"
            />

            <AppInput
              label="Mot de passe"
              labelClassName="!text-white"
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#919191"
            />

            <AppInput
              label="Confirmer le mot de passe"
              labelClassName="!text-white"
              type="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#919191"
            />
          </View>
        </View>
      </ScrollView>

      <BottomActionBar>
        <Button
          variant="primary"
          label="Suivant"
          Icon={ArrowRight}
          onPress={() => router.push("/(auth)/register/step-3")}
        />
      </BottomActionBar>
    </KeyboardAvoidingView>
  );
}
