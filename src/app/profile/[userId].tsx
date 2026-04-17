import { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { ProfileView } from "@/components/profile/profile-view";
import type { ProfileTabKey } from "@/types/profile";
import { MOCK_POSTS, OTHER_PROFILE_TABS } from "@/mocks/profiles";
import { MOCK_AVATARS } from "@/mocks/avatars";

const AVATAR_URI = MOCK_AVATARS[0];

export default function OtherProfileScreen() {
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
      tabs={OTHER_PROFILE_TABS}
      activeTab={activeTab}
      onChangeTab={handleChangeTab}
      onMessage={() =>
        router.push({
          pathname: "/messages/conversation",
          params: { userName: "Juan-Bautista", avatarUri: AVATAR_URI, isOnline: "false" },
        } as Href)
      }
    />
  );
}
