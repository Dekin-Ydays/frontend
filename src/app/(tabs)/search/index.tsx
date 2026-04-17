import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { RoundedButton } from "@/components/ui/buttons/rounded-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import { MessageListItem } from "@/components/messages/message-list-item";
import type {
  SearchFilter,
  SearchProfileItem,
  SearchDanceItem,
} from "@/types/search";
import {
  MOCK_PERFORMANCES,
  MOCK_REALISATIONS,
  MOCK_SEARCH_PROFILES,
  SEARCH_FILTERS,
} from "@/mocks/search";

/*
// Utils
*/
function filterByQuery<T>(
  items: T[],
  query: string,
  getField: (item: T) => string,
): T[] {
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
      contentContainerClassName="gap-4"
      contentContainerStyle={{ paddingBottom }}
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
      contentContainerClassName="gap-4"
      contentContainerStyle={{ paddingBottom }}
      columnWrapperClassName="gap-4"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <MediaTileButton imageUri={item.imageUri} title={item.title} />
      )}
    />
  );
}

/*
// Main component
*/
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { q, category } = useLocalSearchParams<{
    q?: string;
    category?: string;
  }>();

  const searchQuery = (Array.isArray(q) ? q[0] : q) ?? "";
  const activeFilter = ((Array.isArray(category) ? category[0] : category) ??
    "Profils") as SearchFilter;
  const listPaddingBottom = insets.bottom + 96;

  const filteredProfiles = useMemo(
    () => filterByQuery(MOCK_SEARCH_PROFILES, searchQuery, (p) => p.userName),
    [searchQuery],
  );

  const filteredPerformances = useMemo(
    () => filterByQuery(MOCK_PERFORMANCES, searchQuery, (d) => d.title),
    [searchQuery],
  );

  const filteredRealisations = useMemo(
    () => filterByQuery(MOCK_REALISATIONS, searchQuery, (d) => d.title),
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
    <View className="flex-1 bg-dark p-4 bg-24 gap-4">
      <View className="flex-row gap-2">
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
      {activeFilter === "Performances" && (
        <DancesList
          data={filteredPerformances}
          paddingBottom={listPaddingBottom}
        />
      )}
      {activeFilter === "Réalisations" && (
        <DancesList
          data={filteredRealisations}
          paddingBottom={listPaddingBottom}
        />
      )}
    </View>
  );
}
