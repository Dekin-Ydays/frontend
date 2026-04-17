import { useState } from "react";
import { FlatList, View, type ListRenderItem } from "react-native";
import type { CommentData } from "@/types/comment";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MessageSender } from "@/components/messages/message-sender";
import { CommentItem } from "./comment-item";
import { MOCK_COMMENTS } from "@/mocks/comments";
import { AppText } from "../ui/app-text";

type CommentsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const renderComment: ListRenderItem<CommentData> = ({ item }) => (
  <CommentItem item={item} />
);

export function CommentsBottomSheet({
  visible,
  onClose,
}: CommentsBottomSheetProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="border-b border-white/20 pb-3 mb-3">
        <AppText>Commentaires</AppText>
      </View>
      <FlatList
        data={MOCK_COMMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 gap-4 pb-24"
      />
      <MessageSender
        value={inputValue}
        onChangeText={setInputValue}
        onSend={() => setInputValue("")}
        placeholder="Votre commentaire..."
      />
    </BottomSheet>
  );
}
