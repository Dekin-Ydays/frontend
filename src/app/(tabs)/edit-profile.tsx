import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { ProfilePicture } from "@/components/profile/profile-picture";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  avatarSection: "items-center gap-y-2.5",
  changePhotoText: "!text-secondary text-sm",
  form: "gap-y-6",
  rowFields: "flex-row gap-2.5",
  // Bottom action bar
  bottomBar:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 justify-center px-5",
  primaryButton:
    "h-[60px] w-full rounded-[20px] bg-primary items-center justify-center",
  primaryButtonText: "!text-dark",
} as const;

const AVATAR_URI =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80";

/*
// Main component
*/
export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
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
        <View className="px-5 pt-24 pb-36 gap-y-6">
          {/* Avatar section */}
          <View className={styles.avatarSection}>
            <ProfilePicture uri={AVATAR_URI} size={96} showAddButton />
            <Pressable>
              <AppText className={styles.changePhotoText}>
                Modifier la photo de profil
              </AppText>
            </Pressable>
          </View>

          {/* Form */}
          <View className={styles.form}>
            <View className={styles.rowFields}>
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

      {/* Bottom action bar */}
      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable className={styles.primaryButton}>
          <AppText variant="title" className={styles.primaryButtonText}>
            Enregistrer
          </AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
