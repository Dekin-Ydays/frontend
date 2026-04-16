import { useState } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import type { CommentData } from "@/types/comment";
import { AppText } from "@/components/ui/app-text";
import { MessageSender } from "@/components/messages/message-sender";
import { CommentItem } from "./comment-item";

/*
// Tailwind styles
*/
const styles = {
  header: "px-5 pt-2 pb-4 border-b border-white/10",
  headerTitle: "text-center font-montserrat-bold",
} as const;

type CommentsSectionProps = {
  comments: CommentData[];
  /** Hauteur max de la liste avant scroll. Par défaut 380. */
  listMaxHeight?: number;
};

const renderComment: ListRenderItem<CommentData> = ({ item }) => (
  <CommentItem item={item} />
);

/**
 * Section de commentaires réutilisable : header + liste scrollable + input.
 * Peut être intégrée dans un BottomSheet, une page plein écran, etc.
 */
export function CommentsSection({
  comments,
  listMaxHeight = 380,
}: CommentsSectionProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <View>
      {/* Header */}
      <View className={styles.header}>
        <AppText className={styles.headerTitle}>
          Commentaires
        </AppText>
      </View>

      {/* Liste */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 20 }}
        style={{ maxHeight: listMaxHeight }}
      />

      {/* Input */}
      <MessageSender
        value={inputValue}
        onChangeText={setInputValue}
        onSend={() => setInputValue("")}
        placeholder="Votre commentaire..."
      />
    </View>
  );
}
