import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  View,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { AppText } from "@/components/ui/app-text";
import {
  ChatBubble,
  type ChatBubbleProps,
} from "@/components/messages/chat-bubble";
import { ChatDateSeparator } from "@/components/messages/chat-date-separator";
import { MessageSender } from "@/components/messages/message-sender";
import { useBottomBar } from "@/components/nav/bottom-bar-context";
import { MOCK_AVATARS } from "@/mocks/avatars";



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

const AVATAR_URI = MOCK_AVATARS[0];

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
    <AppText variant="secondaryText" className="text-right text-xs">
      {time}
    </AppText>
  );
}

/*
// Main component
*/
export default function ConversationScreen() {
  useLocalSearchParams<{ userName: string; avatarUri: string; isOnline: string }>();
  const { hide, show } = useBottomBar();

  const [messages, setMessages] = useState<ChatItem[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      hide();
      return show;
    }, [hide, show])
  );

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
      className="flex-1 bg-dark"
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerClassName={"gap-2 px-4 pb-28 pt-24"}
        ItemSeparatorComponent={() => <View className="h-1" />}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: false })
        }
      />
      <MessageSender
        value={inputValue}
        onChangeText={setInputValue}
        onSend={handleSend}
      />
    </KeyboardAvoidingView>
  );
}
