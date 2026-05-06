import { useState } from "react";
import { View, type ListRenderItem } from "react-native";
import { FlatList } from "react-native";
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

const keyExtractor = (item: CommentData) => item.id;

export function CommentsBottomSheet({
  visible,
  onClose,
}: CommentsBottomSheetProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="p-4">
        <View className="border-b border-white/20 pb-3">
          <AppText>Commentaires</AppText>
        </View>
      </View>
      <FlatList
        data={MOCK_COMMENTS}
        keyExtractor={keyExtractor}
        renderItem={renderComment}
        contentContainerClassName="gap-4 p-4 pb-24"
        // Décharge les vues non visibles de la mémoire (très efficace sur Android)
        removeClippedSubviews={true}
        // Nombre d'éléments rendus initialement (juste de quoi remplir l'écran)
        initialNumToRender={10}
        // Taille de la fenêtre virtuelle (défaut = 21).
        // 5 = 2 écrans au-dessus, 1 écran visible, 2 écrans en dessous. Réduit la conso RAM.
        windowSize={5}
        // Nombre d'éléments rendus à chaque frame de scroll (évite les lags si on scrolle vite)
        maxToRenderPerBatch={5}
        // Met à jour la liste moins souvent lors d'un scroll très rapide (en ms)
        updateCellsBatchingPeriod={50}
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
