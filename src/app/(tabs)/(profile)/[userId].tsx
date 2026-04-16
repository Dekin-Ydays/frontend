import { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { ChatBubble, EditPencil } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { RoundedButton } from "@/components/ui/rounded-button";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { ProfileTabButton } from "@/components/profile/profile-tab-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import { useBottomBar } from "@/components/nav/bottom-bar-context";
import type { ProfilePost, ProfileTabKey } from "@/types/profile";
import { MOCK_POSTS, OTHER_PROFILE_TABS } from "@/mocks/profiles";
import { MOCK_AVATARS } from "@/mocks/avatars";

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
        <ProfilePicture uri={MOCK_AVATARS[0]} size={96} />
        <View className="flex-1">
          <AppText variant="bolderLargeText">Juan-Bautista</AppText>
          <AppText variant="secondaryText" className="mt-1">
            7 suivis | 13 followers
          </AppText>
        </View>
      </View>

      {/* Action buttons */}
      <View className="mb-5 flex-row items-center gap-2.5">
        <RoundedButton variant="primary" label="S'abonner" Icon={EditPencil} />
        <RoundedButton variant="secondary" label="Ecrire" Icon={ChatBubble} />
      </View>

      {/* Tabs */}
      <View className="mb-6 flex-row items-center gap-3">
        {OTHER_PROFILE_TABS.map((tab) => (
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
export default function OtherProfileScreen() {
  const { hide, show } = useBottomBar();
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("performances");

  useEffect(() => {
    hide();
    return show;
  }, [hide, show]);

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
