import { useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { Search } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoundedButton } from "@/components/ui/rounded-button";
import { MediaTileButton } from "@/components/media/media-tile-button";
import { Icon } from "@/components/ui/icon";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  // Bottom search bar (replaces tab menu)
  bottomBar:
    "absolute bottom-0 left-0 right-0 bg-gradient-to-b from-black/0 to-black/80 h-24 items-center justify-center",
  bottomRow: "flex-row items-center justify-center gap-3 px-4 w-full",
  searchIconPill:
    "h-16 w-16 flex-row items-center justify-center rounded-full bg-white/10 border border-white/5",
  searchInput:
    "h-16 flex-1 rounded-full bg-white/10 border border-white/5 px-5 text-white",
} as const;

/*
// Mock data
*/
const FILTERS = ["Danses", "Profils", "Autre"] as const;
type Filter = (typeof FILTERS)[number];

const DANCES = [
  {
    id: "1",
    title: "Hip-Hop Basics",
    imageUri:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    title: "Salsa Cubana",
    imageUri:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    title: "Contemporary",
    imageUri:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    title: "Breaking",
    imageUri:
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    title: "Waacking",
    imageUri:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "6",
    title: "Locking",
    imageUri:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80",
  },
];

/*
// Main component
*/
export default function ResearchDancesScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Filter>("Danses");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDances = DANCES.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className={styles.screen}>
      <FlatList
        data={filteredDances}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 80 + 8,
          paddingBottom: insets.bottom + 112,
          gap: 8,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="flex-row gap-2 pb-2">
            {FILTERS.map((filter) => (
              <RoundedButton
                key={filter}
                variant={activeFilter === filter ? "primary" : "secondary"}
                label={filter}
                onPress={() => setActiveFilter(filter)}
              />
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <MediaTileButton
            imageUri={item.imageUri}
            title={item.title}
            className="flex-1 rounded-[20px]"
          />
        )}
      />

      {/* Bottom search bar (replaces tab menu) */}
      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom }}
      >
        <View className={styles.bottomRow}>
          <View className={styles.searchIconPill}>
            <Icon icon={Search} size={24} color="#FFFFFF" />
          </View>
          <TextInput
            placeholder="Rechercher une danse..."
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
