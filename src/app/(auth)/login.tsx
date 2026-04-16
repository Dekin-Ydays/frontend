import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/nav/top-header";
import { AuthConnectionMenu } from "@/components/auth/auth-connection-menu";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-5 pt-24 pb-36 gap-y-12",
  logoSection: "gap-y-3",
  subtitle: "!text-primary text-sm",
  form: "gap-y-6",
  forgotPassword: "!text-secondary text-sm",
  socialRow: "flex-row gap-2.5",
} as const;

/*
// Main component
*/
export default function LoginScreen() {
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
        <View className={styles.content}>
          <View className={styles.logoSection}>
            <AppText variant="title" className="text-5xl">
              DEKIN
            </AppText>
            <AppText className={styles.subtitle}>
              Encore toi ! Prêt à danser ?
            </AppText>
          </View>

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
              <Pressable className="mt-1">
                <AppText className={styles.forgotPassword}>
                  Mot de passe oublié ?
                </AppText>
              </Pressable>
            </View>

            <Button variant="primary" label="Se connecter" />

            <View className={styles.socialRow}>
              <Button variant="secondary" label="Google" className="flex-1" />
              <Button variant="secondary" label="Apple" className="flex-1" />
            </View>
          </View>
        </View>
      </ScrollView>

      <AuthConnectionMenu activeTab="login" />
    </KeyboardAvoidingView>
  );
}
