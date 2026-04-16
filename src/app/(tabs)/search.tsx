import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RoundedButton } from "@/components/ui/rounded-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import { MessageListItem } from "@/components/messages/message-list-item";
import type { SearchFilter } from "@/types/search";
import {
  MOCK_DANCES,
  MOCK_SEARCH_PROFILES,
  SEARCH_FILTERS,
} from "@/mocks/search";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  filterRow: "flex-row gap-2 px-5 pt-24 pb-2",
} as const;

/*
// Main component
*/
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const searchQuery = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("Profils");

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return MOCK_SEARCH_PROFILES;
    return MOCK_SEARCH_PROFILES.filter((p) =>
      p.userName.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const filteredDances = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return MOCK_DANCES;
    return MOCK_DANCES.filter((d) => d.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const listBottomPadding = insets.bottom + 96;

  return (
    <View className={styles.screen}>
      {/* Filter row */}
      <View className={styles.filterRow}>
        {SEARCH_FILTERS.map((filter) => (
          <RoundedButton
            key={filter}
            variant={activeFilter === filter ? "primary" : "secondary"}
            label={filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </View>

      {activeFilter === "Danses" ? (
        <FlatList
          key="dances"
          data={filteredDances}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: listBottomPadding,
            gap: 8,
          }}
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: listBottomPadding,
          }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MessageListItem
              avatarUri={item.avatarUri}
              userName={item.userName}
              messagePreview={item.stats}
              onPress={() => router.push("/(tabs)/(profile)/1")}
            />
          )}
        />
      )}
    </View>
  );
}
