import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { ProfileTabButton } from "@/components/profile/profile-tab-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import type { ProfilePost, ProfileTabKey } from "@/types/profile";
import { MOCK_POSTS, PROFILE_TABS } from "@/mocks/profiles";

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
      {/* Avatar + stats */}
      <View className="mb-5 flex-row items-center gap-4">
        <ProfilePicture
          uri="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80"
          size={96}
          showAddButton
        />
        <View className="flex-1">
          <AppText variant="bolderLargeText">Juan-Bautista</AppText>
          <AppText variant="secondaryText" className="mt-1">
            7 suivis | 13 followers
          </AppText>
        </View>
      </View>

      {/* Tabs */}
      <View className="mb-6 flex-row items-center gap-3">
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
      className="mb-3 w-[48.5%]"
    />
  );
}

/*
// Main component
*/
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("performances");

  const visiblePosts = useMemo(() => {
    return MOCK_POSTS.filter((post) => post.category === activeTab);
  }, [activeTab]);

  return (
    <FlatList
      className="flex-1 bg-dark"
      contentContainerClassName="px-4 pb-32 pt-24"
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
