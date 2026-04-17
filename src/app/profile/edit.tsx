import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/inputs/app-input";
import { Button } from "@/components/ui/buttons/button";
import { BottomBar } from "@/components/ui/bottom-bar";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { MOCK_AVATARS } from "@/mocks/avatars";

export default function EditProfileScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("Adrien");
  const [lastName, setLastName] = useState("Cambier");
  const [pseudo, setPseudo] = useState("TheGoat1438");
  const [email, setEmail] = useState("gérard.dupont@gmail.com");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4 pb-24 gap-12">
          <View className="items-center gap-3">
            <ProfilePicture uri={MOCK_AVATARS[0]} size="xl" showAddButton />
            <Pressable>
              <AppText className="!text-secondary text-sm">
                Modifier la photo de profil
              </AppText>
            </Pressable>
          </View>

          <View className="gap-6">
            <View className="flex-row gap-3">
              <AppInput
                label="Prénom"
                labelClassName="!text-white"
                value={firstName}
                onChangeText={setFirstName}
              />
              <AppInput
                label="Nom"
                labelClassName="!text-white"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            <AppInput
              label="Pseudo"
              labelClassName="!text-white"
              value={pseudo}
              onChangeText={setPseudo}
              autoCapitalize="none"
            />
            <AppInput
              label="Email"
              labelClassName="!text-white"
              type="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        <Button
          variant="primary"
          label="Enregistrer"
          onPress={() => router.back()}
        />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
