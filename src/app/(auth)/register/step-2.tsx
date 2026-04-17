import { useRouter } from "expo-router";
import { ArrowRight } from "iconoir-react-native";
import { View } from "react-native";
import { AppInput } from "@/components/ui/inputs/app-input";
import { Button } from "@/components/ui/button";
import { AuthScreen } from "@/components/auth/auth-screen";
import { StepBadge } from "@/components/auth/step-badge";
import { useRegister } from "@/contexts/register-context";
import type { Href } from "expo-router";

export default function RegisterStep2Screen() {
  const router = useRouter();
  const { data, update } = useRegister();

  return (
    <AuthScreen
      title="S'INSCRIRE"
      backButton
      bottomBar={
        <Button
          variant="primary"
          label="Suivant"
          Icon={ArrowRight}
          onPress={() => router.push("/register/step-3" as Href)}
        />
      }
    >
      <StepBadge current={2} total={3} />

      <View className="gap-y-6">
        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <AppInput
              label="Prénom"
              labelClassName="!text-white"
              value={data.firstName}
              onChangeText={(v) => update({ firstName: v })}
              placeholder="Un prénom"
              placeholderTextColor="#919191"
            />
          </View>
          <View className="flex-1">
            <AppInput
              label="Nom"
              labelClassName="!text-white"
              value={data.lastName}
              onChangeText={(v) => update({ lastName: v })}
              placeholder="Un nom"
              placeholderTextColor="#919191"
            />
          </View>
        </View>

        <AppInput
          label="Pseudo"
          labelClassName="!text-white"
          value={data.pseudo}
          onChangeText={(v) => update({ pseudo: v })}
          placeholder="monpseudo"
          placeholderTextColor="#919191"
          autoCapitalize="none"
        />

        <AppInput
          label="Date de naissance"
          labelClassName="!text-white"
          value={data.birthDate}
          onChangeText={(v) => update({ birthDate: v })}
          placeholder="jj/mm/aaaa"
          placeholderTextColor="#919191"
          keyboardType="numbers-and-punctuation"
        />

        <AppInput
          label="Mot de passe"
          labelClassName="!text-white"
          type="password"
          value={data.password}
          onChangeText={(v) => update({ password: v })}
          placeholder="••••••••"
          placeholderTextColor="#919191"
        />

        <AppInput
          label="Confirmer le mot de passe"
          labelClassName="!text-white"
          type="password"
          value=""
          onChangeText={() => {}}
          placeholder="••••••••"
          placeholderTextColor="#919191"
        />
      </View>
    </AuthScreen>
  );
}
