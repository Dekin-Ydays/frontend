import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { QuestionMark, EditPencil, Bell, LogOut, NavArrowRight } from "iconoir-react-native";
import { SettingsItem } from "@/components/profile/settings-item";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-4 pt-28 gap-3",
} as const;

/*
// Main component
*/
export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView className={styles.screen} contentContainerClassName={styles.content}>
      <SettingsItem
        icon={QuestionMark}
        label="Demander de l'aide"
        trailingIcon={NavArrowRight}
      />
      <SettingsItem
        icon={EditPencil}
        label="Modifier le profil"
        onPress={() => router.push("/(tabs)/profile/edit")}
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
