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
import { AppInput } from "@/components/ui/inputs/app-input";
import { Button } from "@/components/ui/buttons/button";
import { AuthConnectionMenu } from "@/components/auth/auth-connection-menu";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4 pb-24 gap-12">
          <View className="gap-3">
            <AppText variant="title" className="text-5xl">
              DEKIN
            </AppText>
            <AppText className="!text-primary">
              Encore toi ! Prêt à danser ?
            </AppText>
          </View>

          <View className="gap-6">
            <AppInput
              label="Email"
              labelClassName="!text-white"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder="gérard@example.com"
              placeholderTextColor="#919191"
            />
            <View className="gap-2.5">
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
                <AppText className="!text-secondary">
                  Mot de passe oublié ?
                </AppText>
              </Pressable>
            </View>

            <Button
              variant="primary"
              label="Se connecter"
              onPress={() => router.replace("/feed" as Href)}
            />

            <View className="flex-row gap-3">
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
