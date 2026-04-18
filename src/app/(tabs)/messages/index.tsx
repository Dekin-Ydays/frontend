import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import {
  MessageListItem,
  type MessageListItemProps,
} from "@/components/messages/message-list-item";
import { SearchInput } from "@/components/ui/inputs/search-input";
import { MOCK_CONVERSATIONS } from "@/mocks/messages";
import { filterByQuery } from "@/lib/search";

type MessageRow = MessageListItemProps & { key: string };

function renderMessageItem({ item }: { item: MessageRow }) {
  return <MessageListItem {...item} />;
}

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const messages = useMemo<MessageRow[]>(
    () =>
      MOCK_CONVERSATIONS.map((item, index) => ({
        ...item,
        key: `message-${index + 1}`,
        onPress: () =>
          router.push({
            pathname: "/messages/conversation",
            params: {
              userName: item.userName,
              avatarUri: item.avatarUri,
              isOnline: item.isOnline ? "true" : "false",
            },
          }),
      })),
    [router],
  );

  const filteredMessages = useMemo(
    () =>
      filterByQuery(messages, searchQuery, [
        (m) => m.userName,
        (m) => m.messagePreview,
      ]),
    [searchQuery, messages],
  );

  return (
    <View className="flex-1 bg-dark">
      <View className="p-4">
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un contact..."
        />
      </View>
      <FlatList
        contentContainerClassName="px-4 gap-4 pb-24"
        data={filteredMessages}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        renderItem={renderMessageItem}
      />
    </View>
  );
}
