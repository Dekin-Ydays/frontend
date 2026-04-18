import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { View } from "react-native";
import { ProfileView } from "@/components/profile/profile-view";
import { PROFILE_TABS } from "@/mocks/profiles";
import { MOCK_AVATARS } from "@/mocks/avatars";

const AVATAR_URI = MOCK_AVATARS[0];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-dark">
      <ProfileView
        avatarUri={AVATAR_URI}
        name="Juan-Bautista"
        stats="7 suivis | 13 followers"
        tabs={PROFILE_TABS}
        isOwnProfile
        onPressAdd={() => router.push("/video/creation" as Href)}
      />
    </View>
  );
}
