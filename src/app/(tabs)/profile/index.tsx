import { useLocalSearchParams, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useCallback } from "react";
import { ProfileView } from "@/components/profile/profile-view";
import type { ProfileTabKey } from "@/types/profile";
import { MOCK_POSTS, PROFILE_TABS } from "@/mocks/profiles";
import { MOCK_AVATARS } from "@/mocks/avatars";

const AVATAR_URI = MOCK_AVATARS[0];

export default function ProfileScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const activeTab = ((Array.isArray(tab) ? tab[0] : tab) ?? "performances") as ProfileTabKey;

  const handleChangeTab = useCallback(
    (t: ProfileTabKey) => router.setParams({ tab: t }),
    [router],
  );

  return (
    <ProfileView
      avatarUri={AVATAR_URI}
      name="Juan-Bautista"
      stats="7 suivis | 13 followers"
      posts={MOCK_POSTS}
      tabs={PROFILE_TABS}
      activeTab={activeTab}
      onChangeTab={handleChangeTab}
      isOwnProfile
      onPressAdd={() => router.push("/(tabs)/video/creation" as Href)}
    />
  );
}
