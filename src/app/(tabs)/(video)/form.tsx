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

const styles = {
  screen: "flex-1 bg-dark",
  thumbnail: "h-[184px] w-[96px] rounded-[20px] bg-white/10",
  musicRow: "flex-row items-center gap-1.5",
} as const;

const THUMBNAIL_URI =
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=200&q=80";

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
        <View className="px-5 pt-24 pb-36 gap-y-6">
          <View className="items-center gap-y-3">
            <Image
              source={{ uri: THUMBNAIL_URI }}
              className={styles.thumbnail}
              resizeMode="cover"
            />
            <View className={styles.musicRow}>
              <Icon icon={MusicNote} size={18} color="#BDBDBD" />
              <AppText variant="secondaryText">In the dark</AppText>
            </View>
          </View>

          <View className="gap-y-6">
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
