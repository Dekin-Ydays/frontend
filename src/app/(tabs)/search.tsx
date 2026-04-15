import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RoundedButton } from "@/components/ui/rounded-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import { MessageListItem } from "@/components/messages/message-list-item";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  filterRow: "flex-row gap-2 px-5 pt-24 pb-2",
} as const;

/*
// Mock data
*/
const FILTERS = ["Profils", "Danses", "Autre"] as const;
type Filter = (typeof FILTERS)[number];

const AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=200&q=80",
] as const;

type ProfileItem = { id: string; avatarUri: string; userName: string; stats: string };
type DanceItem = { id: string; title: string; imageUri: string };

const PROFILES: ProfileItem[] = [
  { id: "1", avatarUri: AVATARS[0], userName: "Jean-Baptiste Sainte-Beuve", stats: "7 suivis | 19 followers" },
  { id: "2", avatarUri: AVATARS[1], userName: "Maxou le fou", stats: "77 suivis | 1 followers" },
  { id: "3", avatarUri: AVATARS[2], userName: "Quantix", stats: "4 suivis | 1997 followers" },
  { id: "4", avatarUri: AVATARS[3], userName: "adri1.cr", stats: "12 suivis | 58 followers" },
  { id: "5", avatarUri: AVATARS[0], userName: "Jean-Baptiste Sainte-Beuve", stats: "7 suivis | 19 followers" },
  { id: "6", avatarUri: AVATARS[1], userName: "Maxou le fou", stats: "77 suivis | 1 followers" },
  { id: "7", avatarUri: AVATARS[2], userName: "Quantix", stats: "4 suivis | 1997 followers" },
  { id: "8", avatarUri: AVATARS[3], userName: "adri1.cr", stats: "12 suivis | 58 followers" },
  { id: "9", avatarUri: AVATARS[0], userName: "Jean-Baptiste Sainte-Beuve", stats: "7 suivis | 19 followers" },
];

const DANCES: DanceItem[] = [
  {
    id: "1",
    title: "Hip-Hop Basics",
    imageUri: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    title: "Salsa Cubana",
    imageUri: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    title: "Contemporary",
    imageUri: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    title: "Breaking",
    imageUri: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    title: "Waacking",
    imageUri: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "6",
    title: "Locking",
    imageUri: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80",
  },
];

/*
// Main component
*/
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const searchQuery = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const [activeFilter, setActiveFilter] = useState<Filter>("Profils");

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return PROFILES;
    return PROFILES.filter((p) => p.userName.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredDances = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return DANCES;
    return DANCES.filter((d) => d.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const listBottomPadding = insets.bottom + 96;

  return (
    <View className={styles.screen}>
      {/* Filter row */}
      <View className={styles.filterRow}>
        {FILTERS.map((filter) => (
          <RoundedButton
            key={filter}
            variant={activeFilter === filter ? "primary" : "secondary"}
            label={filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </View>

      {/* Content — switches layout based on active filter */}
      {activeFilter === "Danses" ? (
        <FlatList
          key="dances"
          data={filteredDances}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: listBottomPadding, gap: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MediaTileButton
              imageUri={item.imageUri}
              title={item.title}
              className="flex-1 rounded-[20px]"
            />
          )}
        />
      ) : (
        <FlatList
          key="profiles"
          data={filteredProfiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: listBottomPadding }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MessageListItem
              avatarUri={item.avatarUri}
              userName={item.userName}
              messagePreview={item.stats}
              onPress={() => router.push("/(tabs)/other-profile")}
            />
          )}
        />
      )}
    </View>
  );
}
