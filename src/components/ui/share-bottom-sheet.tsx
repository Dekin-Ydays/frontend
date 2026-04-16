import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Send } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { AppInput } from "@/components/ui/app-input";
import { Button } from "@/components/ui/button";
import { AppText } from "@/components/ui/app-text";
import { type ShareUser, MOCK_SHARE_USERS } from "@/mocks/send";

/*
// Styles
*/
const styles = {
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
// Props
*/
type ShareBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/*
// Main component
*/
export function ShareBottomSheet({ visible, onClose }: ShareBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_SHARE_USERS;
    return MOCK_SHARE_USERS.filter((u) => u.userName.toLowerCase().includes(q));
  }, [query]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View
        className="bg-[rgba(14,14,14,0.97)] rounded-t-[40px] overflow-hidden px-5 pb-6 gap-5"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
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
          <Button variant="primary" label="Envoyer" Icon={Send} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}
