import { useState } from "react";
import { FlatList, type ListRenderItem } from "react-native";
import type { CommentData } from "@/types/comment";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MessageSender } from "@/components/messages/message-sender";
import { CommentItem } from "./comment-item";
import { MOCK_COMMENTS } from "@/mocks/comments";

type CommentsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const renderComment: ListRenderItem<CommentData> = ({ item }) => (
  <CommentItem item={item} />
);

export function CommentsBottomSheet({ visible, onClose }: CommentsBottomSheetProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Commentaires">
      <FlatList
        data={MOCK_COMMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 20 }}
        style={{ maxHeight: 380 }}
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
