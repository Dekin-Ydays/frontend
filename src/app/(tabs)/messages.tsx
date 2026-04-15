import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import {
  MessageListItem,
  type MessageListItemProps,
} from "@/components/messages/message-list-item";
import { MessagesSearchInput } from "@/components/messages/messages-search-input";

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

/*
// Mock data
*/
const avatarList = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80",
] as const;

type MessageRow = MessageListItemProps & { key: string };

const messages: MessageRow[] = [
  {
    avatarUri: avatarList[0],
    userName: "Jean-Baptiste Sainte-Beuve",
    messagePreview: "A partagé une vidéo avec vous...",
    isOnline: true,
  },
  {
    avatarUri: avatarList[1],
    userName: "Maxou le fou",
    messagePreview: "Hey broo alors le 6?",
  },
  {
    avatarUri: avatarList[2],
    userName: "Quantix",
    messagePreview: "OUH OUH AHAH",
  },
  {
    avatarUri: avatarList[0],
    userName: "Jean-Baptiste Sainte-Beuve",
    messagePreview: "A partagé une vidéo avec vous...",
  },
  {
    avatarUri: avatarList[1],
    userName: "Maxou le fou",
    messagePreview: "Hey broo alors le 6?",
  },
  {
    avatarUri: avatarList[2],
    userName: "Quantix",
    messagePreview: "OUH OUH AHAH",
  },
  {
    avatarUri: avatarList[0],
    userName: "Jean-Baptiste Sainte-Beuve",
    messagePreview: "A partagé une vidéo avec vous...",
    isOnline: true,
  },
  {
    avatarUri: avatarList[1],
    userName: "Maxou le fou",
    messagePreview: "Hey broo alors le 6?",
  },
  {
    avatarUri: avatarList[2],
    userName: "Quantix",
    messagePreview: "OUH OUH AHAH",
  },
].map((item, index) => ({
  ...item,
  onPress: () => {},
  key: `message-${index + 1}`,
}));

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
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [searchQuery]);

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
