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

        <View className="mb-4">
          <AppInput
            label="Nom complet (text)"
            type="text"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Gérard Dupont"
          />
        </View>

        <View className="mb-4">
          <AppInput
            label="Email (email)"
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemple.com"
          />
        </View>

        <View className="mb-4">
          <AppInput
            label="Mot de passe (password)"
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />
        </View>

        <View>
          <AppInput
            label="Âge (number)"
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
