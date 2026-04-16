import { useMemo, useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { Search } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { RoundedButton } from "@/components/ui/rounded-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import { MessageListItem } from "@/components/messages/message-list-item";
import { Icon } from "@/components/ui/icon";
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
  bottomBar:
    "absolute bottom-0 left-0 right-0 bg-gradient-to-b from-black/0 to-black/80 h-24 items-center justify-center",
  bottomRow: "flex-row items-center justify-center gap-3 px-4 w-full",
  searchIconPill:
    "h-16 w-16 flex-row items-center justify-center rounded-full bg-white/10 border border-white/5",
  searchInput:
    "h-16 flex-1 rounded-full bg-white/10 border border-white/5 px-5 text-white",
} as const;

/*
// Main component
*/
export default function ResearchDancesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("Profils");
  const [searchQuery, setSearchQuery] = useState("");

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

  const listBottomPadding = insets.bottom + 112;

  return (
    <View className={styles.screen}>
      {/* Filter row */}
      <View className={styles.filterRow}>
        {SEARCH_FILTERS.map((filter) => (
          <RoundedButton
            key={filter}
            variant={activeFilter === filter ? "primary" : "secondary"}
            label={filter}
            onPress={() => {
              setActiveFilter(filter);
              setSearchQuery("");
            }}
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

      {/* Bottom search bar */}
      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom }}
      >
        <View className={styles.bottomRow}>
          <View className={styles.searchIconPill}>
            <Icon icon={Search} size={32} color="#FFFFFF" />
          </View>
          <TextInput
            placeholder={
              activeFilter === "Danses"
                ? "Rechercher une danse..."
                : "Rechercher un profil..."
            }
            placeholderTextColor="#919191"
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
            className={styles.searchInput}
          />
        </View>
      </View>
    </View>
  );
}
