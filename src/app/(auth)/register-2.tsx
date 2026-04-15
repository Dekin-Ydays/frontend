import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { TopHeader } from "@/components/nav/top-header";
import { Icon } from "@/components/ui/icon";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  stepBadge:
    "flex-row items-center h-8 bg-secondary rounded-[10px] px-5 self-start",
  stepBadgeText: "!text-dark font-montserrat-bold text-sm",
  form: "gap-y-6",
  rowFields: "flex-row gap-2.5",
  errorText: "!text-dangerous text-sm mt-1",
  primaryButton:
    "h-[60px] w-full rounded-[20px] bg-primary flex-row items-center justify-between px-5",
  primaryButtonText: "!text-dark",
  // Bottom action bar
  bottomBar:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 justify-center px-5",
} as const;

/*
// Main component
*/
export default function RegisterStep2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
            <AppText className={styles.stepBadgeText}>Etape 2 ~ 3</AppText>
          </View>

          {/* Form */}
          <View className={styles.form}>
            {/* Prénom + Nom side by side */}
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

            <View>
              <AppInput
                label="Mot de passe"
                labelClassName="!text-white"
                type="password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#919191"
              />
            </View>

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

      {/* Bottom action bar */}
      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          className={styles.primaryButton}
          onPress={() => router.push("/(auth)/register-3")}
        >
          <AppText variant="title" className={styles.primaryButtonText}>
            Suivant
          </AppText>
          <Icon icon={ArrowRight} size={24} color="#0E0E0E" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
