import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { ArrowRight } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/inputs/app-input";
import { Button } from "@/components/ui/buttons/button";
import { AuthConnectionMenu } from "@/components/auth/auth-connection-menu";
import { useRegister } from "@/contexts/register-context";

export default function RegisterStep1Screen() {
  const router = useRouter();
  const { data, update } = useRegister();

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
              Bienvenue ! Prêt à danser ?
            </AppText>
          </View>

          <View className="gap-6">
            <AppInput
              label="Email"
              labelClassName="!text-white"
              type="email"
              value={data.email}
              onChangeText={(v) => update({ email: v })}
              placeholder="gérard@example.com"
              placeholderTextColor="#919191"
            />

            <Button
              variant="primary"
              label="Suivant"
              Icon={ArrowRight}
              onPress={() => router.push("/register/step-2" as Href)}
            />

            <View className="flex-row gap-3">
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
