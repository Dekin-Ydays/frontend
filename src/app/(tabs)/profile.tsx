import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { ProfileTabButton } from "@/components/profile/profile-tab-button";
import { MediaTileButton } from "@/components/media/media-tile-button";

const styles = {
  screen: "flex-1 bg-dark",
  content: "px-4 pb-32 pt-24",
  headerContainer: "mb-8 flex-row items-center gap-4",
  profileInfo: "flex-1",
  profileStats: "mt-2",
  tabsContainer: "mb-6 flex-row items-center gap-3",
  tile: "mb-3 w-[48.5%]",
} as const;

type ProfileTabKey = "performances" | "realisations" | "favorites";

type ProfilePost = {
  id: string;
  title: string;
  category: ProfileTabKey;
  imageUri: string;
};

const profileTabs: { key: ProfileTabKey; label: string }[] = [
  { key: "performances", label: "Performances" },
  { key: "realisations", label: "Réalisations" },
  { key: "favorites", label: "Mes favoris" },
];

const posts: ProfilePost[] = [
  {
    id: "1",
    title: "DPR IAN concert...",
    category: "performances",
    imageUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "2",
    title: "Je teste mon...",
    category: "realisations",
    imageUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "3",
    title: "Nouvelle danse de...",
    category: "favorites",
    imageUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "4",
    title: "DPR IAN concert...",
    category: "performances",
    imageUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "5",
    title: "Stray kids les goats...",
    category: "realisations",
    imageUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "6",
    title: "Stray kids les goats...",
    category: "favorites",
    imageUri:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
];

type ProfileHeaderProps = {
  activeTab: ProfileTabKey;
  onChangeTab: (tab: ProfileTabKey) => void;
};

function ProfileHeader({ activeTab, onChangeTab }: ProfileHeaderProps) {
  return (
    <>
      <View className={styles.headerContainer}>
        <ProfilePicture
          uri="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80"
          size={100}
          showAddButton
        />
        <View className={styles.profileInfo}>
          <AppText variant="bolderLargeText">Juan-Bautista</AppText>
          <AppText variant="secondaryText" className={styles.profileStats}>
            7 suivis | 13 followers
          </AppText>
        </View>
      </View>

      <View className={styles.tabsContainer}>
        {profileTabs.map((tab) => (
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
      className={styles.tile}
    />
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("performances");

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => post.category === activeTab);
  }, [activeTab]);

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
