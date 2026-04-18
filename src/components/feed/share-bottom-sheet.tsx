import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Send } from "iconoir-react-native";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { AppInput } from "@/components/ui/inputs/app-input";
import { Button } from "@/components/ui/buttons/button";
import { AppText } from "@/components/ui/app-text";
import { type ShareUser, MOCK_SHARE_USERS } from "@/mocks/send";
import { BottomBar } from "../ui/bottom-bar";
import { filterByQuery } from "@/lib/search";

function UserCard({ item }: { item: ShareUser }) {
  return (
    <Pressable className="flex-1 items-center gap-2.5 py-2">
      <ProfilePicture uri={item.avatarUri} size={96} />
      <AppText className="text-sm text-center" numberOfLines={2}>
        {item.userName}
      </AppText>
    </Pressable>
  );
}

type ShareBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function ShareBottomSheet({ visible, onClose }: ShareBottomSheetProps) {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(
    () => filterByQuery(MOCK_SHARE_USERS, query, (u) => u.userName),
    [query],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppInput
        placeholder="Rechercher une personne..."
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

      <BottomBar>
        <Button
          variant="primary"
          label="Envoyer"
          Icon={Send}
          onPress={onClose}
        />
      </BottomBar>
    </BottomSheet>
  );
}
