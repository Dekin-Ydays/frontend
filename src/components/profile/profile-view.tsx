import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ProfileHeader } from "@/components/profile/profile-header";
import { MediaTileButton } from "@/components/media/media-tile-button";
import type { ProfileTab, ProfileTabKey } from "@/types/profile";
import { MOCK_POSTS } from "@/mocks/profiles";

type ProfileViewProps = {
  avatarUri: string;
  name: string;
  stats: string;
  tabs: ProfileTab[];
  isOwnProfile?: boolean;
  onPressAdd?: () => void;
  onMessage?: () => void;
};

export function ProfileView({
  avatarUri,
  name,
  stats,
  tabs,
  isOwnProfile = false,
  onPressAdd,
  onMessage,
}: ProfileViewProps) {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const activeTab = ((Array.isArray(tab) ? tab[0] : tab) ??
    "performances") as ProfileTabKey;

  const handleChangeTab = useCallback(
    (t: ProfileTabKey) => router.setParams({ tab: t }),
    [router],
  );

  const visiblePosts = useMemo(
    () => MOCK_POSTS.filter((post) => post.category === activeTab),
    [activeTab],
  );

  return (
    <FlatList
      contentContainerClassName="px-4 gap-4 pb-24"
      data={visiblePosts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperClassName="gap-4"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ProfileHeader
          avatarUri={avatarUri}
          name={name}
          stats={stats}
          isOwnProfile={isOwnProfile}
          tabs={tabs}
          activeTab={activeTab}
          onChangeTab={handleChangeTab}
          onPressAdd={onPressAdd}
          onMessage={onMessage}
        />
      }
      renderItem={({ item }) => (
        <MediaTileButton
          imageUri={item.imageUri}
          title={item.title}
          className="flex-1"
        />
      )}
    />
  );
}
