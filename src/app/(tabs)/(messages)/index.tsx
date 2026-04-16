import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import {
  MessageListItem,
  type MessageListItemProps,
} from "@/components/messages/message-list-item";
import { MessagesSearchInput } from "@/components/messages/messages-search-input";
import { MOCK_CONVERSATIONS } from "@/mocks/messages";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "gap-4 px-4 pb-24 pt-24",
  listHeader: "mb-3",
  listHeaderSearch: "mt-2",
  itemSeparator: "h-4",
} as const;

type MessageRow = MessageListItemProps & { key: string };

/*
// Secondary components
*/
type MessageListHeaderProps = {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
};

function MessageListHeader({
  searchQuery,
  onChangeSearchQuery,
}: MessageListHeaderProps) {
  return (
    <View className={styles.listHeader}>
      <View className={styles.listHeaderSearch}>
        <MessagesSearchInput
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
        />
      </View>
    </View>
  );
}

function renderMessageItem({ item }: { item: MessageRow }) {
  return <MessageListItem {...item} />;
}

function renderItemSeparator() {
  return <View className={styles.itemSeparator} />;
}

/*
// Main component
*/
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
            pathname: "/(tabs)/(messages)/conversation",
            params: {
              userName: item.userName,
              avatarUri: item.avatarUri,
              isOnline: item.isOnline ? "true" : "false",
            },
          }),
      })),
    [router],
  );

  const filteredMessages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return messages;
    }

    return messages.filter((message) => {
      return (
        message.userName.toLowerCase().includes(normalizedQuery) ||
        message.messagePreview.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, messages]);

  return (
    <FlatList
      className={styles.screen}
      contentContainerClassName={styles.content}
      data={filteredMessages}
      keyExtractor={(item) => item.key}
      ListHeaderComponent={
        <MessageListHeader
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
        />
      }
      ItemSeparatorComponent={renderItemSeparator}
      showsVerticalScrollIndicator={false}
      renderItem={renderMessageItem}
    />
  );
}
