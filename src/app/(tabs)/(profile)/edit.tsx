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
import { MOCK_AVATARS } from "@/mocks/avatars";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-5 pt-24 pb-36 gap-y-6",
  avatarSection: "items-center gap-y-2.5",
  avatarEditLink: "!text-secondary text-sm",
  form: "gap-y-6",
  nameRow: "flex-row gap-2.5",
} as const;

/*
// Main component
*/
export default function EditProfileScreen() {
  const [firstName, setFirstName] = useState("Adrien");
  const [lastName, setLastName] = useState("Cambier");
  const [pseudo, setPseudo] = useState("TheGoat1438");
  const [email, setEmail] = useState("gérard.dupont@gmail.com");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className={styles.content}>
          {/* Avatar section */}
          <View className={styles.avatarSection}>
            <ProfilePicture uri={MOCK_AVATARS[0]} size={96} showAddButton />
            <Pressable>
              <AppText className={styles.avatarEditLink}>
                Modifier la photo de profil
              </AppText>
            </Pressable>
          </View>

          {/* Form */}
          <View className={styles.form}>
            <View className={styles.nameRow}>
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
