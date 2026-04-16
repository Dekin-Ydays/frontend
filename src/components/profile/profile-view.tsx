import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { ChatBubble, EditPencil } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { RoundedButton } from "@/components/ui/rounded-button";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { ProfileTabButton } from "@/components/profile/profile-tab-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import type { ProfilePost, ProfileTab, ProfileTabKey } from "@/types/profile";

/*
// Styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-4 pb-32 pt-24",
  avatarRow: "mb-5 flex-row items-center gap-4",
  actionsRow: "mb-5 flex-row items-center gap-2.5",
  tabsRow: "mb-6 flex-row items-center gap-3",
  postItem: "mb-3 w-[48.5%]",
} as const;

/*
// Secondary components
*/
type ProfileHeaderProps = {
  avatarUri: string;
  name: string;
  stats: string;
  isOwnProfile: boolean;
  tabs: ProfileTab[];
  activeTab: ProfileTabKey;
  onChangeTab: (tab: ProfileTabKey) => void;
};

function ProfileHeader({
  avatarUri,
  name,
  stats,
  isOwnProfile,
  tabs,
  activeTab,
  onChangeTab,
}: ProfileHeaderProps) {
  return (
    <>
      <View className={styles.avatarRow}>
        <ProfilePicture uri={avatarUri} size={96} showAddButton={isOwnProfile} />
        <View className="flex-1">
          <AppText variant="bolderLargeText">{name}</AppText>
          <AppText variant="secondaryText" className="mt-1">{stats}</AppText>
        </View>
      </View>

      {!isOwnProfile && (
        <View className={styles.actionsRow}>
          <RoundedButton variant="primary" label="S'abonner" Icon={EditPencil} />
          <RoundedButton variant="secondary" label="Ecrire" Icon={ChatBubble} />
        </View>
      )}

      <View className={styles.tabsRow}>
        {tabs.map((tab) => (
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

/*
// Main component
*/
type ProfileViewProps = {
  avatarUri: string;
  name: string;
  stats: string;
  posts: ProfilePost[];
  tabs: ProfileTab[];
  activeTab: ProfileTabKey;
  onChangeTab: (tab: ProfileTabKey) => void;
  isOwnProfile?: boolean;
};

export function ProfileView({
  avatarUri,
  name,
  stats,
  posts,
  tabs,
  activeTab,
  onChangeTab,
  isOwnProfile = false,
}: ProfileViewProps) {
  const visiblePosts = useMemo(
    () => posts.filter((post) => post.category === activeTab),
    [posts, activeTab],
  );

  const renderPost = useCallback(
    ({ item }: { item: ProfilePost }) => (
      <MediaTileButton
        imageUri={item.imageUri}
        title={item.title}
        className={styles.postItem}
      />
    ),
    [],
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
        <ProfileHeader
          avatarUri={avatarUri}
          name={name}
          stats={stats}
          isOwnProfile={isOwnProfile}
          tabs={tabs}
          activeTab={activeTab}
          onChangeTab={onChangeTab}
        />
      }
      renderItem={renderPost}
    />
  );
}
