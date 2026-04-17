import { useState } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/inputs/app-input";
import { Button } from "@/components/ui/buttons/button";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AuthConnectionMenu } from "@/components/auth/auth-connection-menu";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthScreen
      title="SE CONNECTER"
      contentClassName="px-5 pt-24 pb-36 gap-y-12"
      footer={<AuthConnectionMenu activeTab="login" />}
    >
      <View className="gap-y-3">
        <AppText variant="title" className="text-5xl">
          DEKIN
        </AppText>
        <AppText className="!text-primary text-sm">
          Encore toi ! Prêt à danser ?
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
            <AppText className="!text-secondary text-sm">
              Mot de passe oublié ?
            </AppText>
          </Pressable>
        </View>

        <Button
          variant="primary"
          label="Se connecter"
          onPress={() => router.replace("/feed" as Href)}
        />

        <View className="flex-row gap-2.5">
          <Button variant="secondary" label="Google" className="flex-1" />
          <Button variant="secondary" label="Apple" className="flex-1" />
        </View>
      </View>
    </AuthScreen>
  );
}
