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
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { TopHeader } from "@/components/nav/top-header";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  logo: "gap-y-3",
  logoText: "text-5xl",
  subtitle: "!text-primary text-sm",
  form: "gap-y-6",
  forgotPassword: "!text-secondary text-sm mt-1",
  primaryButton:
    "h-[60px] w-full rounded-[20px] bg-primary items-center justify-center",
  primaryButtonText: "!text-dark",
  socialRow: "flex-row gap-2.5",
  socialButton:
    "flex-1 h-[60px] rounded-[20px] bg-white flex-row items-center justify-center",
  socialButtonText: "!text-dark",
  // Bottom connection menu
  bottomMenu:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 justify-center px-5",
  menuPill:
    "flex-row items-center gap-2.5 bg-white/10 rounded-full border border-white/5 p-1.5",
  menuTabActive:
    "flex-1 h-[50px] items-center justify-center rounded-full bg-white/5",
  menuTabInactive: "flex-1 h-[50px] items-center justify-center rounded-full",
  menuTabTextActive: "!text-secondary text-sm",
  menuTabTextInactive: "text-sm",
} as const;

/*
// Main component
*/
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={styles.screen}
    >
      <TopHeader title="SE CONNECTER" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-24 pb-36 gap-y-12">
          {/* Logo + subtitle */}
          <View className={styles.logo}>
            <AppText variant="title" className={styles.logoText}>
              DEKIN
            </AppText>
            <AppText className={styles.subtitle}>
              Encore toi ! Prêt à danser ?
            </AppText>
          </View>

          {/* Form */}
          <View className={styles.form}>
            <AppInput
              label="Email"
              labelClassName="!text-white"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder="gérard@example.com"
              placeholderTextColor="#919191"
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
              <Pressable>
                <AppText className={styles.forgotPassword}>
                  Mot de passe oublié ?
                </AppText>
              </Pressable>
            </View>

            <Pressable className={styles.primaryButton}>
              <AppText variant="title" className={styles.primaryButtonText}>
                Se connecter
              </AppText>
            </Pressable>

            <View className={styles.socialRow}>
              <Pressable className={styles.socialButton}>
                <AppText variant="title" className={styles.socialButtonText}>
                  Google
                </AppText>
              </Pressable>
              <Pressable className={styles.socialButton}>
                <AppText variant="title" className={styles.socialButtonText}>
                  Apple
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom connection menu */}
      <View
        className={styles.bottomMenu}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className={styles.menuPill}>
          <View className={styles.menuTabActive}>
            <AppText className={styles.menuTabTextActive}>Se connecter</AppText>
          </View>
          <Pressable
            className={styles.menuTabInactive}
            onPress={() => router.replace("/(auth)/register-1")}
          >
            <AppText className={styles.menuTabTextInactive}>S'inscrire</AppText>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
