import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { ProfileHeader } from "@/components/profile/profile-header";
import { MediaTileButton } from "@/components/media/media-tile-button";
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

  const visiblePosts = useMemo(
    () => MOCK_POSTS.filter((post) => post.category === activeTab),
    [activeTab],
  );

  return (
    <View className="flex-1 bg-dark">
      <ProfileHeader
        avatarUri={AVATAR_URI}
        name="Juan-Bautista"
        stats="7 suivis | 13 followers"
        isOwnProfile
        tabs={PROFILE_TABS}
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        onPressAdd={() => router.push("/video/creation" as Href)}
      />
      <FlatList
        contentContainerClassName="px-4 pb-24 gap-4"
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperClassName="gap-4"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MediaTileButton imageUri={item.imageUri} title={item.title} className="flex-1" />
        )}
      />
    </View>
  );
}
