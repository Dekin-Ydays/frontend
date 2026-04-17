import { useRouter } from "expo-router";
import { ArrowRight } from "iconoir-react-native";
import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/inputs/app-input";
import { Button } from "@/components/ui/button";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AuthConnectionMenu } from "@/components/auth/auth-connection-menu";
import { useRegister } from "@/contexts/register-context";
import type { Href } from "expo-router";

export default function RegisterStep1Screen() {
  const router = useRouter();
  const { data, update } = useRegister();

  return (
    <AuthScreen
      title="S'INSCRIRE"
      contentClassName="px-5 pt-24 pb-36 gap-y-12"
      footer={<AuthConnectionMenu activeTab="register" />}
    >
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

        <View className="flex-row gap-2.5">
          <Button variant="secondary" label="Google" className="flex-1" />
          <Button variant="secondary" label="Apple" className="flex-1" />
        </View>
      </View>
    </AuthScreen>
  );
}
