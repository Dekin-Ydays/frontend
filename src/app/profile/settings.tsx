import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { QuestionMark, EditPencil, Bell, LogOut, NavArrowRight } from "iconoir-react-native";
import { SettingsItem } from "@/components/profile/settings-item";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-dark" contentContainerClassName={"px-4 pt-28 gap-3"}>
      <SettingsItem
        icon={QuestionMark}
        label="Demander de l'aide"
        trailingIcon={NavArrowRight}
      />
      <SettingsItem
        icon={EditPencil}
        label="Modifier le profil"
        onPress={() => router.push("/profile/edit")}
        trailingIcon={NavArrowRight}
      />
      <SettingsItem
        icon={Bell}
        label="Gérer les notifications"
        trailingIcon={NavArrowRight}
      />
      <SettingsItem
        icon={LogOut}
        label="Se déconnecter"
        danger
        trailingIcon={LogOut}
        onPress={() => router.replace("/login" as Href)}
      />
    </ScrollView>
  );
}
