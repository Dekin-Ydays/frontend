import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import {
  ChatBubble,
  type ChatBubbleProps,
} from "@/components/messages/chat-bubble";
import { ChatDateSeparator } from "@/components/messages/chat-date-separator";
import { ChatInput } from "@/components/messages/chat-input";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  content: "gap-2 px-4 pb-28 pt-24",
  timestamp: "text-right text-xs",
} as const;

/*
// Types
*/
type TimestampItem = {
  type: "timestamp";
  id: string;
  time: string;
};

type MessageItem = {
  type: "message";
  id: string;
} & ChatBubbleProps;

type DateItem = {
  type: "date";
  id: string;
  date: string;
};

type ChatItem = TimestampItem | MessageItem | DateItem;

/*
// Mock data
*/
const AVATAR_URI =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80";

const initialMessages: ChatItem[] = [
  { type: "timestamp", id: "t1", time: "11:30" },
  {
    type: "message",
    id: "m1",
    text: "Adri1 ramène l'enceinte pour ce soir",
    isOwn: false,
    avatarUri: AVATAR_URI,
    showAvatar: true,
  },
  {
    type: "message",
    id: "m2",
    text: "et vite",
    isOwn: false,
    avatarUri: AVATAR_URI,
    showAvatar: false,
  },
  { type: "timestamp", id: "t2", time: "11:30" },
  {
    type: "message",
    id: "m3",
    text: "J'te fais ça de suite",
    isOwn: true,
  },
  { type: "message", id: "m4", text: "Ok", isOwn: true },
  { type: "date", id: "d1", date: "Jeudi 18 novembre" },
  { type: "timestamp", id: "t3", time: "11:30" },
  {
    type: "message",
    id: "m5",
    text: "Ohhhh",
    isOwn: false,
    avatarUri: AVATAR_URI,
    showAvatar: true,
  },
];

/*
// Secondary components
*/
function ChatTimestamp({ time }: { time: string }) {
  return (
    <AppText variant="secondaryText" className={styles.timestamp}>
      {time}
    </AppText>
  );
}

/*
// Main component
*/
export default function ConversationScreen() {
  useLocalSearchParams<{ userName: string; avatarUri: string; isOnline: string }>();

  const [messages, setMessages] = useState<ChatItem[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newId = `m${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { type: "timestamp", id: `t${Date.now()}`, time },
      { type: "message", id: newId, text, isOwn: true },
    ]);
    setInputValue("");

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputValue]);

  const renderItem: ListRenderItem<ChatItem> = useCallback(({ item }) => {
    if (item.type === "timestamp") {
      return <ChatTimestamp time={item.time} />;
    }
    if (item.type === "date") {
      return <ChatDateSeparator date={item.date} />;
    }
    return (
      <ChatBubble
        text={item.text}
        isOwn={item.isOwn}
        avatarUri={item.avatarUri}
        showAvatar={item.showAvatar}
      />
    );
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={styles.screen}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerClassName={styles.content}
        ItemSeparatorComponent={() => <View className="h-1" />}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
      />
      <ChatInput
        value={inputValue}
        onChangeText={setInputValue}
        onSend={handleSend}
      />
    </KeyboardAvoidingView>
  );
}
