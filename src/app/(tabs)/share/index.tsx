import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  View,
} from "react-native";
import { Send } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { Button } from "@/components/ui/button";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { type ShareUser, MOCK_SHARE_USERS } from "@/mocks/send";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-black/50",
  backdrop: "flex-1",
  sheet: "bg-[rgba(14,14,14,0.95)] rounded-t-[40px] px-5 pt-5 gap-5",
  handle: "self-center w-10 h-1.5 bg-white/40 rounded-full mb-1",
  userCard: "flex-1 items-center gap-2.5 py-2",
  userName: "text-sm text-center",
  bottomBar: "border-t border-white/5 pt-4",
} as const;

/*
// Secondary components
*/
function UserCard({ item }: { item: ShareUser }) {
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
export default function SendScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_SHARE_USERS;
    return MOCK_SHARE_USERS.filter((u) => u.userName.toLowerCase().includes(q));
  }, [query]);

  return (
    <View className={styles.screen}>
      {/* Tap backdrop to go back */}
      <Pressable className={styles.backdrop} onPress={() => router.back()} />

      {/* Bottom sheet */}
      <View
        className={styles.sheet}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className={styles.handle} />

        <AppInput
          placeholder="Rechercher une personne..."
          placeholderTextColor="#919191"
          value={query}
          onChangeText={setQuery}
        />

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          style={{ maxHeight: 280 }}
          renderItem={({ item }) => <UserCard item={item} />}
        />

        <View className={styles.bottomBar}>
          <Button variant="primary" label="Envoyer" Icon={Send} />
        </View>
      </View>
    </View>
  );
}
