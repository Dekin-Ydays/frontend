import { useState } from "react";
import { useRouter } from "expo-router";
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

export default function VideoFormScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
          <View className="items-center gap-y-3">
            <Image
              source={{ uri: MOCK_THUMBNAIL_URI }}
              className="h-[184px] w-[96px] rounded-[20px] bg-white/10"
              resizeMode="cover"
            />
            <View className="flex-row items-center gap-1.5">
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
        <Button variant="primary" label="Publier" Icon={Upload} onPress={() => router.push("/video/score")} />
      </BottomActionBar>
    </KeyboardAvoidingView>
  );
}
