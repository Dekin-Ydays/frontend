import { useCallback, useMemo } from "react";
import { ScrollView, View } from "react-native";
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

  return (
    <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
      <ProfileHeader
        avatarUri={avatarUri}
        name={name}
        stats={stats}
        isOwnProfile={isOwnProfile}
        onPressAdd={onPressAdd}
        onMessage={onMessage}
      />

      <ProfileTabs
        tabs={tabs}
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
      />

      <View className="p-4 pb-24 gap-4">
        {rows.map((row, i) => (
          <View key={i} className="flex-row gap-4">
            {row.map((post) => (
              <MediaTileButton
                key={post.id}
                imageUri={post.imageUri}
                title={post.title}
                className="flex-1"
              />
            ))}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
