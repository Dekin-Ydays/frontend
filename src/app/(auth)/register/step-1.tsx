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
import { TopHeader } from "@/components/nav/top-header";
import { AuthConnectionMenu } from "@/components/auth/auth-connection-menu";

export default function RegisterStep1Screen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
    >
      <TopHeader title="S'INSCRIRE" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-24 pb-36 gap-y-12">
          <View className="gap-y-3">
            <AppText variant="title" className="text-5xl">
              DEKIN
            </AppText>
            <AppText className="!text-primary text-sm">
              Bienvenue ! Prêt à danser ?
            </AppText>
          </View>

          <View className="gap-y-6">
            <AppInput
              label="Email"
              labelClassName="!text-white"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder="gérard@example.com"
              placeholderTextColor="#919191"
            />

            <Button
              variant="primary"
              label="Suivant"
              Icon={ArrowRight}
              onPress={() => router.push("/(auth)/register/step-2")}
            />

            <View className="flex-row gap-2.5">
              <Button variant="secondary" label="Google" className="flex-1" />
              <Button variant="secondary" label="Apple" className="flex-1" />
            </View>
          </View>
        </View>
      </ScrollView>

      <AuthConnectionMenu activeTab="register" />
    </KeyboardAvoidingView>
  );
}
