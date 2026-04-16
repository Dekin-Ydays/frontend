import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { ProfileTabButton } from "@/components/profile/profile-tab-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import type { ProfilePost, ProfileTabKey } from "@/types/profile";
import { MOCK_POSTS, PROFILE_TABS } from "@/mocks/profiles";
import { MOCK_AVATARS } from "@/mocks/avatars";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-4 pb-32 pt-24",
  headerAvatarRow: "mb-5 flex-row items-center gap-4",
  headerStats: "mt-1",
  headerTabs: "mb-6 flex-row items-center gap-3",
  postItem: "mb-3 w-[48.5%]",
} as const;

/*
// Secondary components
*/
type ProfileHeaderProps = {
  activeTab: ProfileTabKey;
  onChangeTab: (tab: ProfileTabKey) => void;
};

function ProfileHeader({ activeTab, onChangeTab }: ProfileHeaderProps) {
  return (
    <>
      <View className={styles.headerAvatarRow}>
        <ProfilePicture uri={MOCK_AVATARS[0]} size={96} showAddButton />
        <View className="flex-1">
          <AppText variant="bolderLargeText">Juan-Bautista</AppText>
          <AppText variant="secondaryText" className={styles.headerStats}>
            7 suivis | 13 followers
          </AppText>
        </View>
      </View>

      <View className={styles.headerTabs}>
        {PROFILE_TABS.map((tab) => (
          <ProfileTabButton
            key={tab.key}
            label={tab.label}
            isActive={activeTab === tab.key}
            onPress={() => onChangeTab(tab.key)}
          />
        ))}
      </View>
    </>
  );
}

function renderPostItem({ item }: { item: ProfilePost }) {
  return (
    <MediaTileButton
      imageUri={item.imageUri}
      title={item.title}
      className={styles.postItem}
    />
  );
}

/*
// Main component
*/
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("performances");

  const visiblePosts = useMemo(
    () => MOCK_POSTS.filter((post) => post.category === activeTab),
    [activeTab],
  );

  return (
    <FlatList
      className={styles.screen}
      contentContainerClassName={styles.content}
      data={visiblePosts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ProfileHeader activeTab={activeTab} onChangeTab={setActiveTab} />
      }
      renderItem={renderPostItem}
    />
  );
}
