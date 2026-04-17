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
        <View className="px-5 pb-36 gap-y-6">
          <View className="items-center gap-y-2.5">
            <ProfilePicture uri={MOCK_AVATARS[0]} size={96} showAddButton />
            <Pressable>
              <AppText className="!text-secondary text-sm">
                Modifier la photo de profil
              </AppText>
            </Pressable>
          </View>

          <View className="gap-y-6">
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <AppInput
                  label="Prénom"
                  labelClassName="!text-white"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#919191"
                />
              </View>
              <View className="flex-1">
                <AppInput
                  label="Nom"
                  labelClassName="!text-white"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#919191"
                />
              </View>
            </View>

            <AppInput
              label="Pseudo"
              labelClassName="!text-white"
              value={pseudo}
              onChangeText={setPseudo}
              autoCapitalize="none"
              placeholderTextColor="#919191"
            />

            <AppInput
              label="Email"
              labelClassName="!text-white"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#919191"
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
