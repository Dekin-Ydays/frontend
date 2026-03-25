import { useState } from "react";
import { View } from "react-native";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";

export default function ProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("gérard.dupont@gmail.com");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 p-4 pt-16">
        <AppText variant="title" className="mb-8 text-5xl">
          Test AppInput
        </AppText>

        <View className="gap-3 mb-4">
          <AppText className="text-lightgray">Nom complet (text)</AppText>
          <AppInput
            type="text"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Gérard Dupont"
          />
        </View>

        <View className="gap-3 mb-4">
          <AppText className="text-lightgray">Email (email)</AppText>
          <AppInput
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemple.com"
          />
        </View>

        <View className="gap-3 mb-4">
          <AppText className="text-lightgray">Mot de passe (password)</AppText>
          <AppInput
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />
        </View>

        <View className="gap-3">
          <AppText className="text-lightgray">Âge (number)</AppText>
          <AppInput
            type="number"
            value={age}
            onChangeText={setAge}
            placeholder="26"
          />
        </View>
      </View>
    </View>
  );
}
