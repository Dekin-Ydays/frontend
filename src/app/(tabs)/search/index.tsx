import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { RoundedButton } from "@/components/ui/buttons/rounded-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import { MessageListItem } from "@/components/messages/message-list-item";
import { AppText } from "@/components/ui/app-text";
import type { SearchFilter, SearchProfileItem, SearchDanceItem } from "@/types/search";
import { MOCK_DANCES, MOCK_SEARCH_PROFILES, SEARCH_FILTERS } from "@/mocks/search";

/*
// Utils
*/
function filterByQuery<T>(items: T[], query: string, getField: (item: T) => string): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter((item) => getField(item).toLowerCase().includes(q));
}

/*
// Secondary components
*/
type ProfilesListProps = {
  data: SearchProfileItem[];
  paddingBottom: number;
  onPress: (id: string) => void;
};

function ProfilesList({ data, paddingBottom, onPress }: ProfilesListProps) {
  return (
    <FlatList
      key="profiles"
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom, gap: 16 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <MessageListItem
          avatarUri={item.avatarUri}
          userName={item.userName}
          messagePreview={item.stats}
          onPress={() => onPress(item.id)}
        />
      )}
    />
  );
}

type DancesListProps = {
  data: SearchDanceItem[];
  paddingBottom: number;
};

function DancesList({ data, paddingBottom }: DancesListProps) {
  return (
    <FlatList
      key="dances"
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: 8 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom, gap: 8 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <MediaTileButton
          imageUri={item.imageUri}
          title={item.title}
          className="flex-1 rounded-[20px]"
        />
      )}
    />
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center">
      <AppText variant="secondaryText">{label}</AppText>
    </View>
  );
}

/*
// Main component
*/
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { q, category } = useLocalSearchParams<{ q?: string; category?: string }>();

  const searchQuery = (Array.isArray(q) ? q[0] : q) ?? "";
  const activeFilter = ((Array.isArray(category) ? category[0] : category) ?? "Profils") as SearchFilter;
  const listPaddingBottom = insets.bottom + 96;

  const filteredProfiles = useMemo(
    () => filterByQuery(MOCK_SEARCH_PROFILES, searchQuery, (p) => p.userName),
    [searchQuery],
  );

  const filteredDances = useMemo(
    () => filterByQuery(MOCK_DANCES, searchQuery, (d) => d.title),
    [searchQuery],
  );

  const handleFilterChange = useCallback(
    (filter: SearchFilter) => router.setParams({ category: filter }),
    [router],
  );

  const handlePressProfile = useCallback(
    (id: string) => router.push(`/profile/${id}` as Href),
    [router],
  );

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-row gap-2 px-5 pb-2">
        {SEARCH_FILTERS.map((filter) => (
          <RoundedButton
            key={filter}
            variant={activeFilter === filter ? "primary" : "secondary"}
            label={filter}
            onPress={() => handleFilterChange(filter)}
          />
        ))}
      </View>

      {activeFilter === "Profils" && (
        <ProfilesList
          data={filteredProfiles}
          paddingBottom={listPaddingBottom}
          onPress={handlePressProfile}
        />
      )}
      {activeFilter === "Danses" && (
        <DancesList data={filteredDances} paddingBottom={listPaddingBottom} />
      )}
      {activeFilter === "Autre" && (
        <EmptyState label="Bientôt disponible" />
      )}
    </View>
  );
}
