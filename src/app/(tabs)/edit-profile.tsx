import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { Button } from "@/components/ui/button";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { ProfilePicture } from "@/components/profile/profile-picture";

/*
// Main component
*/
const AVATAR_URI =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80";

export default function EditProfileScreen() {
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
        <View className="px-5 pt-24 pb-36 gap-y-6">
          {/* Avatar section */}
          <View className="items-center gap-y-2.5">
            <ProfilePicture uri={AVATAR_URI} size={96} showAddButton />
            <Pressable>
              <AppText className="!text-secondary text-sm">
                Modifier la photo de profil
              </AppText>
            </Pressable>
          </View>

          {/* Form */}
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

      <BottomActionBar>
        <Button variant="primary" label="Enregistrer" />
      </BottomActionBar>
    </KeyboardAvoidingView>
  );
}
