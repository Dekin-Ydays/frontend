import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { Upload, MusicNote } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { Button } from "@/components/ui/button";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { Icon } from "@/components/ui/icon";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-5 pt-24 pb-36 gap-y-6",
  thumbnailSection: "items-center gap-y-3",
  thumbnail: "h-[184px] w-[96px] rounded-[20px] bg-white/10",
  musicRow: "flex-row items-center gap-1.5",
  formFields: "gap-y-6",
} as const;

export default function VideoFormScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
          <View className={styles.thumbnailSection}>
            <Image
              source={{ uri: MOCK_THUMBNAIL_URI }}
              className={styles.thumbnail}
              resizeMode="cover"
            />
            <View className={styles.musicRow}>
              <Icon icon={MusicNote} size={18} color="#BDBDBD" />
              <AppText variant="secondaryText">In the dark</AppText>
            </View>
          </View>

          <View className={styles.formFields}>
            <AppInput
              label="Titre"
              labelClassName="!text-white"
              value={title}
              onChangeText={setTitle}
              placeholder="Ma danse"
              placeholderTextColor="#919191"
            />

            <AppInput
              label="Description"
              labelClassName="!text-white"
              value={description}
              onChangeText={setDescription}
              placeholder="je me lance dans la danse"
              placeholderTextColor="#919191"
            />
          </View>
        </View>
      </ScrollView>

      <BottomActionBar>
        <Button variant="primary" label="Publier" Icon={Upload} />
      </BottomActionBar>
    </KeyboardAvoidingView>
  );
}
