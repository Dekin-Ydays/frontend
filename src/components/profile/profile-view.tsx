import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
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

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < visiblePosts.length; i += 2) {
      result.push(visiblePosts.slice(i, i + 2));
    }
    return result;
  }, [visiblePosts]);

  const listData = useMemo(() => ["tabs" as const, ...rows], [rows]);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (item === "tabs") {
        return (
          <ProfileTabs
            tabs={tabs}
            activeTab={activeTab}
            onChangeTab={handleChangeTab}
          />
        );
      }

      return (
        <View className="flex-row gap-4 px-4 pt-4">
          {item.map((post: any) => (
            <MediaTileButton
              key={post.id}
              imageUri={post.imageUri}
              title={post.title}
              className="flex-1"
            />
          ))}
          {item.length === 1 && <View className="flex-1" />}
        </View>
      );
    },
    [tabs, activeTab, handleChangeTab],
  );

  return (
    <FlatList
      data={listData}
      keyExtractor={(item, index) =>
        item === "tabs" ? "tabs" : `row-${index}`
      }
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ProfileHeader
          avatarUri={avatarUri}
          name={name}
          stats={stats}
          isOwnProfile={isOwnProfile}
          onPressAdd={onPressAdd}
          onMessage={onMessage}
        />
      }
      stickyHeaderIndices={[1]}
      contentContainerClassName="pb-24"
    />
  );
}
