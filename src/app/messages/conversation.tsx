import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  ChatBubble,
  type ChatBubbleProps,
} from "@/components/messages/chat-bubble";
import { ChatDateSeparator } from "@/components/messages/chat-date-separator";
import { ChatTimestamp } from "@/components/messages/chat-timestamp";
import { MessageSender } from "@/components/messages/message-sender";
import { MOCK_AVATARS } from "@/mocks/avatars";

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

function buildInitialMessages(avatarUri: string): ChatItem[] {
  return [
    { type: "timestamp", id: "t1", time: "11:30" },
    {
      type: "message",
      id: "m1",
      text: "Adri1 ramène l'enceinte pour ce soir",
      isOwn: false,
      avatarUri,
      showAvatar: true,
    },
    {
      type: "message",
      id: "m2",
      text: "et vite",
      isOwn: false,
      avatarUri,
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
      avatarUri,
      showAvatar: true,
    },
  ];
}

export default function ConversationScreen() {
  const { avatarUri: paramAvatarUri } = useLocalSearchParams<{
    userName: string;
    avatarUri: string;
    isOnline: string;
  }>();

  const avatarUri = paramAvatarUri ?? MOCK_AVATARS[0];

  const [messages, setMessages] = useState<ChatItem[]>(() =>
    buildInitialMessages(avatarUri),
  );
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      { type: "timestamp", id: `t${Date.now()}`, time },
      { type: "message", id: `m${Date.now()}`, text, isOwn: true },
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
        contentContainerClassName="p-4"
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
