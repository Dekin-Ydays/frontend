import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { Search } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { Icon } from "@/components/ui/icon";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "px-5 pb-28",
  searchContainer: "relative mb-6",
  searchIcon: "absolute left-4 z-10 h-[52px] justify-center",
  searchInput:
    "h-[52px] w-full rounded-[10px] bg-white/10 border border-white/5 pl-14 pr-4 font-montserrat text-white text-sm",
  sectionTitle: "mb-4",
  userCard: "flex-1 items-center gap-2.5 py-4",
  userName: "text-sm text-center",
} as const;

/*
// Mock data
*/
type DiscoverUser = {
  id: string;
  avatarUri: string;
  userName: string;
};

const AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
] as const;

const users: DiscoverUser[] = [
  { id: "1", avatarUri: AVATARS[0], userName: "Jean-Baptiste Sainte-Beuve" },
  { id: "2", avatarUri: AVATARS[3], userName: "adri1.cr" },
  { id: "3", avatarUri: AVATARS[2], userName: "Quantix" },
  { id: "4", avatarUri: AVATARS[1], userName: "Maxou le fou" },
  { id: "5", avatarUri: AVATARS[0], userName: "Jean-Baptiste Sainte-Beuve" },
  { id: "6", avatarUri: AVATARS[3], userName: "adri1.cr" },
];

/*
// Secondary components
*/
function UserCard({ item }: { item: DiscoverUser }) {
  return (
    <Pressable className={styles.userCard}>
      <ProfilePicture uri={item.avatarUri} size={96} />
      <AppText className={styles.userName} numberOfLines={2}>
        {item.userName}
      </AppText>
    </Pressable>
  );
}

/*
// Main component
*/
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.userName.toLowerCase().includes(q));
  }, [query]);

  return (
    <View className={styles.screen}>
      <FlatList
        className={styles.screen}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 112,
        }}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Search input */}
            <View className={styles.searchContainer}>
              <View className={styles.searchIcon}>
                <Icon icon={Search} size={20} color="#919191" />
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher une personne..."
                placeholderTextColor="#919191"
                className={styles.searchInput}
                underlineColorAndroid="transparent"
              />
            </View>

            {/* Section title */}
            <AppText variant="title" className={styles.sectionTitle}>
              Suggestions
            </AppText>
          </View>
        }
        renderItem={({ item }) => <UserCard item={item} />}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </View>
  );
}
